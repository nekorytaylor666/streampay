import "fs";
import "buffer-layout";
import { BN } from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { getUnixTime } from "date-fns";
import { toast } from "react-toastify";
import swal from "sweetalert";

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
  Advanced,
  Amount,
  Button,
  DateTime,
  Recipient,
  SelectToken,
  WalletPicker,
  Toggle,
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

  const { connection, wallet, addStream, token, setToken, myTokenAccounts, setMyTokenAccounts } =
    useStore(storeGetter);

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
    } as CreateStreamData;

    const receiverAccount = await connection?.getAccountInfo(new PublicKey(receiver));
    if (receiverAccount == null) {
      await swal({
        text: "This address has no funds. Are you sure it's a correct one?",
        icon: "warning",
        buttons: {
          confirm: true,
        },
      });
      setLoading(false);
      return false;
    }

    const success = await sendTransaction(ProgramInstruction.Create, data);
    setLoading(false);

    if (success) {
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
      <div className="my-4 grid gap-4 grid-cols-5 sm:grid-cols-2">
        <Amount
          onChange={setAmount}
          value={amount}
          max={token?.uiTokenAmount?.uiAmount ? token.uiTokenAmount.uiAmount : 0}
        />
        <SelectToken />
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
      </div>
      <Toggle enabled={advanced} setEnabled={setAdvanced} labelLeft="Advanced" />
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
        <Button
          type="submit"
          primary
          classes="px-8 py-4 font-bold text-2xl my-5"
          disabled={loading}
        >
          Create
        </Button>
      ) : (
        <WalletPicker classes="px-8 py-4 font-bold text-2xl my-5" title="Connect wallet" />
      )}
    </form>
  );
}
