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
import { streamCreated } from "../utils/helpers";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  END,
  ERR_NO_TOKEN_SELECTED,
  ERR_NOT_CONNECTED,
  ProgramInstruction,
  START,
  TIME_SUFFIX,
} from "../constants";
import { Dispatch, SetStateAction } from "react";
import useStore, { StoreType } from "../Stores";
import Toggle from "./Toggle";
import { toast } from "react-toastify";

import "fs";
import "buffer-layout";
import { BN } from "@project-serum/anchor";
import sendTransaction from "../Actions/sendTransaction";
import { CreateStreamData } from "../types";

const storeGetter = (state: StoreType) => ({
  balance: state.balance,
  setBalance: state.setBalance,
  addStream: state.addStream,
  connection: state.connection(),
  wallet: state.wallet,
  tokenAccounts: state.tokenAccounts,
});

export default function CreateStreamForm({
  loading,
  setLoading,
}: {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
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
    token,
    setToken,
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

  const { connection, wallet, balance, setBalance, addStream, tokenAccounts } =
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
          cliff < start || cliff > end
            ? "Cliff must be between start and end date."
            : "";
        break;
      case "cliff_time":
        start = new Date(startDate + "T" + startTime);
        cliff = new Date(cliffDate + "T" + value);
        end = new Date(endDate + "T" + endTime);
        msg =
          cliff < start || cliff > end
            ? "Cliff must be between start and end date."
            : "";
        break;
      default:
    }
    element.setCustomValidity(msg);
  }

  async function createStream() {
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
      deposited_amount: new BN(amount),
      recipient: new PublicKey(receiver),
      mint: new PublicKey(token.address),
      start_time: new BN(start),
      end_time: new BN(end),
      period: new BN(timePeriod * timePeriodMultiplier),
      cliff: new BN(
        advanced ? +new Date(cliffDate + "T" + cliffTime) / 1000 : start
      ),
      cliff_amount: new BN(advanced ? (cliffAmount / 100) * amount : 0),
      new_stream_keypair: newStream,
    } as CreateStreamData;
    const success = await sendTransaction(ProgramInstruction.Create, data);
    setLoading(false);
    if (success) {
      streamCreated(newStream.publicKey.toBase58());
      const fee = await connection.getMinimumBalanceForRentExemption(96);
      setBalance(balance - amount - fee / LAMPORTS_PER_SOL);
      addStream(newStream.publicKey.toBase58(), {
        ...data,
        cancel_time: new BN(0),
        created_at: new BN(+new Date() / 1000),
        escrow_tokens: undefined as any,
        magic: new BN(0),
        recipient_tokens: undefined as any,
        sender: wallet.publicKey,
        sender_tokens: undefined as any,
        total_amount: new BN(amount),
        withdrawn: new BN(0),
      });
    }
  }

  return (
    <form onSubmit={createStream} id="form">
      <div className="my-4 grid gap-4 grid-cols-5 sm:grid-cols-2">
        <Amount onChange={setAmount} value={amount} max={balance} />
        {wallet?.publicKey ? (
          <SelectToken token={token} setToken={setToken} />
        ) : (
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="token" className="block font-medium text-gray-100">
              Token
            </label>
            <select
              disabled={true}
              className="mt-1 text-white bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
              defaultValue="1"
            >
              <option value="1">Wallet not connected</option>
            </select>
          </div>
        )}
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
