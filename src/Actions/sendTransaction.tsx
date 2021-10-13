import { toast } from "react-toastify";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import ToastrLink from "../Components/ToastrLink";
import Wallet from "@project-serum/sol-wallet-adapter";
import {
  ERR_NOT_CONNECTED,
  ProgramInstruction,
  TX_FINALITY_FINALIZED,
} from "../constants";
import { getExplorerLink } from "../utils/helpers";
import Timelock from "@streamflow/timelock";
import useStore from "../Stores";
import {
  CreateStreamData,
  TransactionData,
  WithdrawStreamData,
} from "../types";

export default async function sendTransaction(
  instruction: ProgramInstruction,
  data: TransactionData
) {
  const connection = useStore.getState().connection();
  const wallet = useStore.getState().wallet;
  let d;

  try {
    if (wallet?.publicKey !== null || !connection) {
      throw ERR_NOT_CONNECTED;
    }

    toast.info("Please confirm transaction in your wallet.");
    let tx;
    switch (instruction) {
      case ProgramInstruction.Create:
        d = data as CreateStreamData;
        tx = await Timelock.create(
          connection,
          // @ts-ignore
          wallet,
          d.new_stream_keypair,
          d.recipient,
          d.mint,
          d.deposited_amount,
          d.start_time,
          d.end_time,
          d.period,
          d.cliff,
          d.cliff_amount
        );
        break;
      case ProgramInstruction.Withdraw:
        d = data as WithdrawStreamData;
        // @ts-ignore
        tx = await Timelock.withdraw(connection, wallet, d.stream, d.amount);
        break;
      case ProgramInstruction.Cancel:
        // @ts-ignore
        tx = await Timelock.cancel(connection, wallet, stream);
        break;
      case ProgramInstruction.TransferRecipient:
        // @ts-ignore
        tx = await Timelock.transferRecipient(connection, wallet, stream, data);
        break;
    }
    // toast.dismiss();
    // toast.info("Submitted transaction. Awaiting confirmation...");
    const url = getExplorerLink("tx", tx); //todo print transaction here.
    toast.dismiss();
    toast.success(
      <ToastrLink
        url={url}
        urlText="View on explorer"
        nonUrlText={
          `Transaction ${connection.commitment}!` +
          (connection.commitment !== TX_FINALITY_FINALIZED
            ? " Please allow it few seconds to finalize."
            : "")
        }
      />,
      { autoClose: 15000, closeOnClick: true }
    );
    return true;
  } catch (e: any) {
    console.warn(e);
    //todo log these errors somewhere for our reference
    toast.error("Error: " + e.message);
    return false;
  }
}
