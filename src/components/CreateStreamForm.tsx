import { useRef, useState } from "react";

import "fs";
import "buffer-layout";
import { BN } from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { getUnixTime } from "date-fns";
import { toast } from "react-toastify";
import { format } from "date-fns";

import { formatPeriodOfTime } from "../utils/helpers";
import sendTransaction from "../actions/sendTransaction";
import {
  END,
  ERR_NO_TOKEN_SELECTED,
  ERR_NOT_CONNECTED,
  ProgramInstruction,
  START,
  TIME_SUFFIX,
} from "../constants";
import { useFormContext } from "../contexts/FormContext";
import useStore, { StoreType } from "../stores";
import { CreateStreamData } from "../types";
import {
  Amount,
  Button,
  DateTime,
  Recipient,
  SelectToken,
  WalletPicker,
  Toggle,
  Modal,
  ModalRef,
  VestingInput as Input,
  Checkbox,
} from "./index";
import { getTokenAmount } from "../utils/helpers";

const storeGetter = (state: StoreType) => ({
  addStream: state.addStream,
  connection: state.connection(),
  wallet: state.wallet,
  token: state.token,
  setToken: state.setToken,
  myTokenAccounts: state.myTokenAccounts,
  setMyTokenAccounts: state.setMyTokenAccounts,
});

export default function CreateStreamForm({
  loading,
  setLoading,
}: {
  loading: boolean;
  setLoading: (value: boolean) => void;
}) {
  const newStream = Keypair.generate();
  const {
    amount,
    subject,
    setSubject,
    setAmount,
    receiver,
    setReceiver,
    startDate,
    setStartDate,
    startTime,
    setStartTime,
    endDate,
    setEndDate,
    endTime,
    setEndTime,
    cliffDate,
    setCliffDate,
    cliffTime,
    setCliffTime,
    cliffAmount,
    setCliffAmount,
    timePeriod,
    setTimePeriod,
    timePeriodMultiplier,
    setTimePeriodMultiplier,
    senderCanCancel,
    setSenderCanCancel,
    recipientCanCancel,
    setRecipientCanCancel,
    ownershipTransferable,
    setOwnershipTransferable,
  } = useFormContext();

  const [s, setS] = useState(timePeriodMultiplier > 1 ? "s" : "");

  const [advanced, setAdvanced] = useState(false);

  const modalRef = useRef<ModalRef>(null);

  const { connection, wallet, addStream, token, setToken, myTokenAccounts, setMyTokenAccounts } =
    useStore(storeGetter);

  const ticker = token?.info?.symbol ? token.info.symbol.toUpperCase() : "";

  const lengthSeconds =
    (+new Date(endDate + "T" + endTime) - +new Date(cliffDate + "T" + cliffTime)) / 1000;
  const numPeriods = lengthSeconds / (timePeriodMultiplier * timePeriod);
  const releaseRate = (100 - cliffAmount) / (numPeriods > 1 ? numPeriods : 1);

  async function validate(element: HTMLFormElement): Promise<string> {
    const { name, value } = element;
    let start, end, cliff;
    let msg = "invalid";
    switch (name) {
      case "start":
        start = new Date(value + TIME_SUFFIX);
        const now = new Date(new Date().toDateString());
        msg = start < now ? "Cannot start the stream in the past." : "";
        break;
      case "start_time":
        start = new Date(startDate + "T" + value);
        msg = start < new Date() ? "Cannot start the stream in the past." : "";
        break;
      case "end":
        msg =
          new Date(value + TIME_SUFFIX) < new Date(startDate + TIME_SUFFIX)
            ? "Umm... end date before the start date?"
            : "";
        break;
      case "end_time":
        start = new Date(startDate + "T" + startTime);
        end = new Date(endDate + "T" + value);
        msg = end < start ? "Err... end time before the start time?" : "";
        break;
      case "cliff_date":
        start = new Date(startDate + TIME_SUFFIX);
        cliff = new Date(value + TIME_SUFFIX);
        end = new Date(endDate + TIME_SUFFIX);
        msg =
          advanced && (cliff < start || cliff > end)
            ? "Cliff must be between start and end date."
            : "";
        break;
      case "cliff_time":
        start = new Date(startDate + "T" + startTime);
        cliff = new Date(cliffDate + "T" + value);
        end = new Date(endDate + "T" + endTime);
        msg =
          advanced && (cliff < start || cliff > end)
            ? "Cliff must be between start and end date."
            : "";
        break;
      case "amount":
        msg = amount === 0 ? "Please enter amount larger than 0." : "";
        break;
      case "account":
        let pubKey = null;
        try {
          pubKey = new PublicKey(value);
        } catch {
          msg = "Please enter a valid Solana wallet address.";
          break;
        }
        const receiverAccount = await connection?.getAccountInfo(pubKey);
        if (receiverAccount == null) {
          msg = "";
          break;
        }
        if (!receiverAccount.owner.equals(SystemProgram.programId)) {
          msg = "Please enter a valid Solana wallet address";
          break;
        }
        if (receiverAccount.executable) {
          msg = "Recipient cannot be a program.";
          break;
        }
        msg = "";
        break;
      default:
        msg = "";
        break;
    }
    return msg;
  }

  async function createStream(e: any) {
    e.preventDefault();

    if (!wallet?.publicKey || !connection) {
      toast.error(ERR_NOT_CONNECTED);
      return false;
    }

    if (!token) {
      toast.error(ERR_NO_TOKEN_SELECTED);
      return false;
    }

    const form = document.getElementById("form") as HTMLFormElement;

    if (!form) {
      return false;
    }

    for (let i = 0; i < form.elements.length; i++) {
      const elem = form.elements[i] as HTMLObjectElement; //todo: this is not a valid type.
      const errorMsg = await validate(form.elements[i] as HTMLFormElement);
      if (errorMsg) {
        // console.log('error: ', errorMsg);
        elem.setCustomValidity(errorMsg);
        elem.reportValidity();
        elem.setCustomValidity("");
        // console.log('return false');
        return false;
      }
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }

    const start = getUnixTime(new Date(startDate + "T" + startTime));
    let end = getUnixTime(new Date(endDate + "T" + endTime));

    // Make sure that end time is always AFTER start time
    if (end === start) {
      end = start + 1;
    }

    setLoading(true);

    const data = {
      deposited_amount: new BN(amount * 10 ** token.uiTokenAmount.decimals),
      recipient: new PublicKey(receiver),
      mint: new PublicKey(token.info.address),
      start_time: new BN(start),
      end_time: new BN(end),
      period: new BN(advanced ? timePeriod * timePeriodMultiplier : 1),
      cliff: new BN(advanced ? +new Date(cliffDate + "T" + cliffTime) / 1000 : start),
      cliff_amount: new BN(
        (advanced ? (cliffAmount / 100) * amount : 0) * 10 ** token.uiTokenAmount.decimals
      ),
      new_stream_keypair: newStream,
      stream_name: subject,
      cancelable_by_sender: senderCanCancel,
      cancelable_by_recipient: recipientCanCancel,
      transferable: ownershipTransferable,
      withdrawal_public: false,
    } as CreateStreamData;

    const receiverAccount = await connection?.getAccountInfo(new PublicKey(receiver));

    if (!receiverAccount) {
      const shouldContinue = await modalRef?.current?.show();

      if (!shouldContinue) {
        setLoading(false);
        return false;
      }
    }

    const success = await sendTransaction(ProgramInstruction.Create, data);
    setLoading(false);

    if (success) {
      //@ts-ignore
      addStream(newStream.publicKey.toBase58(), {
        ...data,
        closable_at: new BN(end),
        last_withdrawn_at: new BN(0),
        withdrawn_amount: new BN(0),
        canceled_at: new BN(0),
        created_at: new BN(+new Date() / 1000),
        escrow_tokens: undefined as any,
        magic: new BN(0),
        recipient_tokens: undefined as any,
        sender: wallet.publicKey,
        sender_tokens: undefined as any,
        total_amount: new BN(amount),
      });

      const mint = token.info.address;

      const updatedTokenAmount = await getTokenAmount(connection, wallet, mint);
      setMyTokenAccounts({
        ...myTokenAccounts,
        [mint]: { ...myTokenAccounts[mint], uiTokenAmount: updatedTokenAmount },
      });
      setToken({ ...token, uiTokenAmount: updatedTokenAmount });
    }
  }

  const updateStartTime = (startTime: string) => {
    setStartTime(startTime);
    setCliffTime(startTime);
  };

  return (
    <form onSubmit={createStream} id="form" className="mb-0 lg:mb-11">
      <div className="my-4 grid gap-3 sm:gap-4 grid-cols-5 sm:grid-cols-2">
        <Amount
          onChange={setAmount}
          value={amount}
          max={token?.uiTokenAmount?.uiAmount ? token.uiTokenAmount.uiAmount : 0}
        />
        <SelectToken />
        <Input
          type="text"
          name="subject"
          label="Subject / Title"
          placeholder="e.g. StreamFlow VC - seed round"
          value={subject}
          onChange={setSubject}
          required
        />
        <Recipient onChange={setReceiver} value={receiver} />
        <DateTime
          title={START}
          date={startDate}
          updateDate={setStartDate}
          time={startTime}
          updateTime={updateStartTime}
        />
        <DateTime
          title={END}
          date={endDate}
          updateDate={setEndDate}
          time={endTime}
          updateTime={setEndTime}
        />
        <div className="grid gap-x-1 sm:gap-x-2 grid-cols-2 col-span-3 sm:col-span-1">
          <label className="block text-base mb-1 font-medium text-gray-100 capitalize col-span-2">
            Release Frequency
          </label>
          <input
            type="number"
            min={1}
            value={timePeriodMultiplier.toString()}
            onChange={(e) => {
              setTimePeriodMultiplier(Number(e.target.value));
              setS(Number(e.target.value) > 1 ? "s" : "");
            }}
            onBlur={(e) => {
              if (!Number(e.target.value)) {
                setTimePeriodMultiplier(1);
              }
            }}
            className="text-white pl-2.5 sm:pl-3 bg-gray-800 col-span-1 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
          />
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(Number(e.target.value))}
            className="text-white pl-2.5 sm:pl-3 bg-gray-800 col-span-1 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary pr-7"
          >
            <option value={1}>second{s}</option>
            <option value={60}>minute{s}</option>
            <option value={60 * 60}>hour{s}</option>
            <option value={60 * 60 * 24}>day{s}</option>
            <option value={60 * 60 * 24 * 7}>week{s}</option>
            {/*  imprecise */}
            <option value={60 * 60 * 24 * 30}>month{s}</option>
            <option value={60 * 60 * 24 * 365}>year{s}</option>
          </select>
        </div>
        <Checkbox
          name="senderCanCancel"
          label="Sender can cancel?"
          checked={senderCanCancel}
          onChange={setSenderCanCancel}
        />
        <Checkbox
          name="senderCanCancel"
          label="Recipient can cancel?"
          checked={recipientCanCancel}
          onChange={setRecipientCanCancel}
        />
        <Checkbox
          name="ownershipTransferable"
          label="Ownership transferable?"
          checked={ownershipTransferable}
          onChange={setOwnershipTransferable}
        />
      </div>
      <Toggle enabled={advanced} setEnabled={setAdvanced} labelRight="Advanced" />
      {advanced &&
        (!endDate || !endTime ? (
          <span className="text-white text-base">Please specify start and end time.</span>
        ) : (
          <>
            <div className="my-4 grid gap-3 sm:gap-4 grid-cols-5">
              <DateTime
                title="cliff"
                date={cliffDate}
                updateDate={setCliffDate}
                time={cliffTime}
                updateTime={setCliffTime}
                classes="col-span-2 sm:col-span-2"
              />
              <div className="col-span-1 relative">
                <label
                  htmlFor="cliff_amount"
                  className="block text-base font-medium text-gray-100 capitalize"
                >
                  Release
                </label>
                <input
                  id="cliff_amount"
                  name="cliff_amount"
                  type="number"
                  min={0}
                  max={100}
                  value={cliffAmount.toString()}
                  onChange={(e) => setCliffAmount(Number(e.target.value))}
                  className="text-white mt-1 pr-6 pl-2.5 sm:pl-3 bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
                />
                <span className="absolute text-white right-2 sm:right-3 bottom-2">%</span>
              </div>
            </div>
            <div className="col-span-full">
              <p className="text-gray-400 pt-2 mt-4 text-sm leading-6">
                <b className="font-bold block">Overview:</b>
                First
                <span className="text-white text-sm">
                  {` ${cliffAmount}% (${(((amount || 0) * cliffAmount) / 100).toFixed(
                    2
                  )} ${ticker}) `}
                </span>
                <br className="sm:hidden" />
                released on
                <span className="text-white text-sm">{` ${cliffDate} `}</span>at
                <span className="text-white text-sm">{` ${cliffTime}`}</span>.
              </p>
              <p className="text-gray-400 text-sm leading-6 sm:inline-block">
                And then
                <span className="text-white text-sm">{` ${releaseRate.toFixed(3)}% (${(
                  (amount || 0) * releaseRate
                ).toFixed(2)} ${ticker}) `}</span>
                <br className="sm:hidden" />
                released every
                <span className="text-white text-sm">{` ${formatPeriodOfTime(
                  timePeriod * timePeriodMultiplier
                )} `}</span>
                <br />
                until
                <span className="text-white text-sm">{` ${format(
                  new Date(endDate + "T" + endTime),
                  "ccc do MMM, yyyy - HH:mm"
                )}`}</span>
                .
              </p>
            </div>
          </>
        ))}
      {wallet?.connected ? (
        <Button
          type="submit"
          primary
          classes="px-20 py-4 font-bold text-2xl my-5"
          disabled={loading}
        >
          Create
        </Button>
      ) : (
        <WalletPicker classes="px-8 py-4 font-bold text-2xl my-8 sm:my-10" title="Connect wallet" />
      )}
      <Modal
        ref={modalRef}
        title="Seems like the recipient address has empty balance."
        text="Please check that the address is correct before proceeding."
        type="info"
        confirm={{ color: "red", text: "Continue" }}
      />
    </form>
  );
}
