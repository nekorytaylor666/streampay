import { toast } from "react-toastify";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import ToastrLink from "../Components/ToastrLink";
import Wallet from "@project-serum/sol-wallet-adapter";
import {
  ERR_NOT_CONNECTED,
  ProgramInstruction,
  TIMELOCK_PROGRAM_ID,
  TX_FINALITY_FINALIZED,
} from "../constants";
import { getExplorerLink } from "../utils/helpers";
import Timelock from "@streamflow/timelock";
import useStore from "../Stores";
import {
  CancelStreamData,
  CreateStreamData,
  TransactionData,
  TransferStreamData,
  WithdrawStreamData,
} from "../types";

export default async function sendTransaction(
  connection: Connection | null,
  wallet: Wallet | null,
  instruction: ProgramInstruction,
  data: TransactionData
) {
  // const connection = useStore.getState().connection();
  // const wallet = useStore.getState().wallet;
  let d;
  console.log("cnwl", connection, wallet);
  try {
    if (wallet?.publicKey === null || !connection) {
      throw ERR_NOT_CONNECTED;
    }
    console.log("pass 1");
    toast.info("Please confirm transaction in your wallet.");
    let tx;
    switch (instruction) {
      case ProgramInstruction.Create:
        console.log("pass 2");
        d = data as CreateStreamData;
        console.log("conn wallet", connection, wallet);
        console.log("params", data);
        console.log("sending this data: ", {
          start_time: d.start_time.toString(),
          end_time: d.end_time.toString(),
          deposited_amount: d.deposited_amount.toString(),
          period: d.period.toString(),
          cliff: d.cliff.toString(),
          cliff_amount: d.cliff_amount.toString(),
          recipient: d.recipient.toString(),
          mint: d.mint.toString(),
        });
        tx = await Timelock.create(
          connection,
          // @ts-ignore
          wallet,
          TIMELOCK_PROGRAM_ID,
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
        console.log("conn wallet", connection, TIMELOCK_PROGRAM_ID, wallet);
        tx = await Timelock.withdraw(
          connection,
          // @ts-ignore
          wallet,
          TIMELOCK_PROGRAM_ID,
          d.stream,
          d.amount
        );
        break;
      case ProgramInstruction.Cancel:
        d = data as CancelStreamData;
        tx = await Timelock.cancel(
          connection,
          // @ts-ignore
          wallet,
          TIMELOCK_PROGRAM_ID,
          d.stream
        );
        break;
      case ProgramInstruction.TransferRecipient:
        d = data as TransferStreamData;
        tx = await Timelock.transferRecipient(
          connection,
          // @ts-ignore
          wallet,
          TIMELOCK_PROGRAM_ID,
          d.stream,
          d.new_recipient
        );
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
    console.log(e);
    console.warn(e);
    //todo log these errors somewhere for our reference
    toast.error("Error: " + e.message);
    return false;
  }
}
