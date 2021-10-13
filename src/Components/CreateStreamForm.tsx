import {Amount, ButtonPrimary, DateTime, Recipient, SelectCluster, SelectToken, Advanced, WalletPicker,} from "./index";
import {useFormContext} from "../Contexts/FormContext";
import {getUnixTime} from "date-fns";
import {streamCreated} from "../utils/helpers";
import {Keypair, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import {END, ERR_NO_TOKEN_SELECTED, ERR_NOT_CONNECTED, ProgramInstruction, START, TIME_SUFFIX,} from "../constants";
import {Dispatch, SetStateAction} from "react";
import useStore, {StoreType} from "../Stores";
import Toggle from "./Toggle";
import {toast} from "react-toastify";
// @ts-ignore
import {Stream} from "@timelock/layout"
import Timelock from "@timelock/timelock";

// @ts-ignore TODO: fix module
// import Timelock from "timelock";
import 'fs'
import 'buffer-layout'
import {BN} from "@project-serum/anchor";
import {NATIVE_MINT} from "@solana/spl-token";
import sendTransaction from "../Actions/sendTransaction";
import Dropdown from "./Dropdown";
import {CLUSTER_LOCAL} from "../Stores/NetworkStore";

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
  const pda = Keypair.generate();
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
    let start;
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
        const end = new Date(endDate + "T" + value);
        msg = end < start ? "Err... end time before the start time?" : "";
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
    const data = {} as Stream;
    const escrow = Keypair.generate()
    //todo add data!
    const success = await sendTransaction(ProgramInstruction.Create, connection, wallet, new PublicKey(escrow.publicKey), null, escrow)
    setLoading(false);
    if (success) {
      streamCreated(pda.publicKey.toBase58());
      const fee = await connection.getMinimumBalanceForRentExemption(96);
      setBalance(balance - amount - fee / LAMPORTS_PER_SOL);
      addStream(pda.publicKey.toBase58(), data);
    }
  }
  return (
    <form onSubmit={createStream} id="form">
      <div className="my-4 grid gap-4 grid-cols-5 sm:grid-cols-2">
        <Amount onChange={setAmount} value={amount} max={balance} />
        {wallet?.publicKey
            ? <SelectToken token={token} setToken={setToken} />
            : <div className="col-span-2 sm:col-span-1">
          <label htmlFor="token" className="block font-medium text-gray-100">
            Token
          </label>
              <select
                  disabled={true}
                  className="mt-1 text-white bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
                  defaultValue="1">
                <option value="1">Wallet not connected</option>
              </select>
        </div>}
        <Recipient onChange={setReceiver} value={receiver} />
        <DateTime title={START}
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
      <Advanced visible={advanced}
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
