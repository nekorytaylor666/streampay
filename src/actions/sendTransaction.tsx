import { toast } from "react-toastify";
import Timelock from "ibrica-timelock";

import ToastrLink from "../components/ToastrLink";
import {
  ERR_NOT_CONNECTED,
  ProgramInstruction,
  TX_FINALITY_FINALIZED,
  ERR_NO_PRIOR_CREDIT,
} from "../constants";
import useStore from "../stores";
import {
  CancelStreamData,
  CreateStreamData,
  TopupStreamData,
  TransactionData,
  TransferStreamData,
  WithdrawStreamData,
} from "../types";
import { getExplorerLink } from "../utils/helpers";

export default async function sendTransaction(
  instruction: ProgramInstruction,
  data: TransactionData
) {
  const connection = useStore.getState().connection();
  const wallet = useStore.getState().wallet;
  const programId = useStore.getState().programId;

  let d;
  try {
    if (wallet?.publicKey === null || !connection) {
      throw new Error(ERR_NOT_CONNECTED);
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
          programId,
          d.new_stream_keypair,
          d.recipient,
          d.mint,
          d.deposited_amount,
          d.start_time,
          d.end_time,
          d.period,
          d.cliff,
          d.cliff_amount,
          d.cancelable_by_sender,
          d.cancelable_by_recipient,
          d.withdrawal_public,
          d.transferable,
          d.release_rate,
          d.stream_name
        );
        break;
      case ProgramInstruction.Topup:
        d = data as TopupStreamData;
        tx = await Timelock.topup(
          connection,
          // @ts-ignore
          wallet,
          programId,
          d.stream,
          d.amount
        );
        break;
      case ProgramInstruction.Withdraw:
        d = data as WithdrawStreamData;
        tx = await Timelock.withdraw(
          connection,
          // @ts-ignore
          wallet,
          programId,
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
          programId,
          d.stream
        );
        break;
      case ProgramInstruction.TransferRecipient:
        d = data as TransferStreamData;
        tx = await Timelock.transferRecipient(
          connection,
          // @ts-ignore
          wallet,
          programId,
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
    //todo log these errors somewhere for our reference
    let errorMsg = e.message;
    if (e.message.includes("Owner cannot sign")) errorMsg = "Recipient can not sign!";
    else if (
      e.message.includes("Attempt to debit an account but found no record of a prior credit.")
    )
      errorMsg = ERR_NO_PRIOR_CREDIT;

    toast.error(errorMsg);
    console.error("error", e);
    return false;
  }
}
