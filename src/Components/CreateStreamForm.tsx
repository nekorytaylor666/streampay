import {
  Advanced,
  Amount,
  ButtonPrimary,
  DateTime,
  Recipient,
  SelectCluster,
  SelectToken,
  WalletPicker,
} from "./index";
import { useFormContext } from "../Contexts/FormContext";
import { getUnixTime } from "date-fns";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  END,
  ERR_NO_TOKEN_SELECTED,
  ERR_NOT_CONNECTED,
  ProgramInstruction,
  START,
  TIME_SUFFIX,
} from "../constants";
import useStore, { StoreType } from "../Stores";
import Toggle from "./Toggle";
import { toast } from "react-toastify";

import "fs";
import "buffer-layout";
import { BN } from "@project-serum/anchor";
import sendTransaction from "../Actions/sendTransaction";
import { CreateStreamData } from "../types";

const storeGetter = (state: StoreType) => ({
  addStream: state.addStream,
  addStreamingMint: state.addStreamingMint,
  connection: state.connection(),
  wallet: state.wallet,
  token: state.token,
  setToken: state.setToken,
  // tokenAccounts: state.tokenAccounts,
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
    advanced,
    setAdvanced,
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
  } = useFormContext();

  const { connection, wallet, addStream, addStreamingMint, token } =
    useStore(storeGetter);

  function validate(element: HTMLFormElement) {
    const { name, value } = element;
    let start, end, cliff;
    let msg = "";
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
      // case "recipient":
      //   let acc = await connection?.getAccountInfo(new PublicKey(value));
      //   msg =
      //     !acc?.lamports ||
      //     !acc?.owner?.equals(SystemProgram.programId) ||
      //     acc?.executable
      //       ? "This account doesn't seem correct."
      //       : "";
      //   break;
      default:
    }
    element.setCustomValidity(msg);
  }

  async function createStream(e: any) {
    e.preventDefault();

    if (!wallet?.publicKey || !connection) {
      toast.error(ERR_NOT_CONNECTED);
      return false;
    }

    if (token === null) {
      toast.error(ERR_NO_TOKEN_SELECTED);
      return false;
    }

    const form = document.getElementById("form") as HTMLFormElement;

    if (!form) {
      return false;
    }

    for (let i = 0; i < form.elements.length; i++) {
      validate(form.elements[i] as HTMLFormElement);
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
      cliff: new BN(
        advanced ? +new Date(cliffDate + "T" + cliffTime) / 1000 : start
      ),
      cliff_amount: new BN(
        (advanced ? (cliffAmount / 100) * amount : 0) *
          10 ** token.uiTokenAmount.decimals
      ),
      new_stream_keypair: newStream,
    } as CreateStreamData;

    let receiverAccount = await connection.getAccountInfo(data.recipient);
    if (
      !receiverAccount?.lamports ||
      !receiverAccount?.owner?.equals(SystemProgram.programId) ||
      receiverAccount?.executable
    ) {
      const confirmed = true;
      // const confirmed = await swal({
      //   text: "Are you sure the address is correct?",
      //   icon: "warning",
      //   buttons: {
      //     cancel: true,
      //     confirm: true,
      //   },
      // });
      if (!confirmed) {
        setLoading(false);
        return false;
      }
    }

    const success = await sendTransaction(ProgramInstruction.Create, data);
    setLoading(false);

    if (success) {
      //streamCreated(newStream.publicKey.toBase58());
      addStream(newStream.publicKey.toBase58(), {
        ...data,
        cancellable_at: new BN(end),
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
      addStreamingMint(token.info.address);
    }
    return false;
  }

  return (
    <form onSubmit={createStream} id="form">
      <div className="my-4 grid gap-4 grid-cols-5 sm:grid-cols-2">
        <Amount
          onChange={setAmount}
          value={amount}
          max={
            token?.uiTokenAmount?.uiAmount ? token.uiTokenAmount.uiAmount : 0
          }
        />
        <SelectToken />
        <Recipient onChange={setReceiver} value={receiver} />
        <DateTime
          title={START}
          date={startDate}
          updateDate={setStartDate}
          time={startTime}
          updateTime={setStartTime}
        />
        <DateTime
          title={END}
          date={endDate}
          updateDate={setEndDate}
          time={endTime}
          updateTime={setEndTime}
        />
      </div>
      <Toggle enabled={advanced} setEnabled={setAdvanced} label="Advanced" />
      <Advanced
        visible={advanced}
        amount={amount}
        endDate={endDate}
        endTime={endTime}
        cliffDate={cliffDate}
        updateCliffDate={setCliffDate}
        cliffTime={cliffTime}
        updateCliffTime={setCliffTime}
        timePeriod={timePeriod}
        updateTimePeriod={setTimePeriod}
        timePeriodMultiplier={timePeriodMultiplier}
        updateTimePeriodMultiplier={setTimePeriodMultiplier}
        cliffAmount={cliffAmount}
        updateCliffAmount={setCliffAmount}
      />
      {wallet?.connected ? (
        <ButtonPrimary
          className="font-bold text-2xl my-5"
          onClick={createStream}
          disabled={loading}
        >
          Stream!
        </ButtonPrimary>
      ) : (
        <>
          <hr className="my-4 sm:hidden" />
          <SelectCluster />
          <WalletPicker />
        </>
      )}
    </form>
  );
}
