import {
  Amount,
  ButtonPrimary,
  DateTime,
  Recipient,
  SelectCluster,
  SelectToken,
  Vesting,
  WalletPicker,
} from "./index";
import { useFormContext } from "../Contexts/FormContext";
import { getUnixTime } from "date-fns";
import { streamCreated, StreamData } from "../utils/helpers";
import { _createStream } from "../Actions";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  END,
  ERR_NOT_CONNECTED,
  ERR_NO_TOKEN_SELECTED,
  START,
  TIME_SUFFIX,
} from "../constants";
import { Dispatch, SetStateAction } from "react";
import useStore, { StoreType } from "../Stores";
import Toggle from "./Toggle";
import { toast } from "react-toastify";

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
    vesting,
    setVesting,
    token,
    setToken,
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
    const data = new StreamData(
      wallet.publicKey.toBase58(),
      receiver,
      amount,
      start,
      end
    );
    const success = await _createStream(data, connection, wallet, pda, {
      token,
      account: new PublicKey(tokenAccounts[token.address]),
    });
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
        {wallet?.publicKey && <SelectToken token={token} setToken={setToken} />}
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
      <Toggle enabled={vesting} setEnabled={setVesting} label="Vesting" />
      <Vesting visible={vesting} />
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
