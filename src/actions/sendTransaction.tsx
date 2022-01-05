import { toast } from "react-toastify";
import Timelock from "@streamflow/timelock/dist/packages/timelock/timelock";

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
        console.log("MALISA connection", connection);
        console.log("MALISA wallet", wallet);
        console.log("MALISA data", d);
        for (const prop in d) {
          //@ts-ignore
          console.log(prop.toString(), d[prop].toString());
        }

        tx = await Timelock.create(
          connection,
          // @ts-ignore
          wallet,
          d.recipient,
          d.mint,
          d.start_time,
          d.net_deposited_amount,
          d.period,
          d.cliff,
          d.cliff_amount,
          d.amount_per_period,
          d.stream_name,
          d.can_topup,
          d.cancelable_by_sender,
          d.cancelable_by_recipient,
          d.transferable_by_sender,
          d.transferable_by_recipient,
          d.automatic_withdrawal
        );
        break;
      case ProgramInstruction.Topup:
        d = data as TopupStreamData;
        tx = await Timelock.topup(
          connection,
          // @ts-ignore
          wallet,
          d.stream,
          d.amount
        );
        break;
      case ProgramInstruction.Withdraw:
        d = data as WithdrawStreamData;
        console.log("amount to withdraw from react app: ", d.amount.toString());
        tx = await Timelock.withdraw(
          connection,
          // @ts-ignore
          wallet,
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
          d.stream
        );
        break;
      case ProgramInstruction.TransferRecipient:
        d = data as TransferStreamData;
        tx = await Timelock.transferRecipient(
          connection,
          // @ts-ignore
          wallet,
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
