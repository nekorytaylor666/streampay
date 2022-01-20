import { toast } from "react-toastify";
import Stream from "@streamflow/timelock";
import * as Sentry from "@sentry/react";

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
  const cluster = useStore.getState().cluster;

  let d;
  try {
    if (wallet?.publicKey === null || !connection) {
      throw new Error(ERR_NOT_CONNECTED);
    }
    toast.info("Please confirm transaction in your wallet.", { autoClose: false });
    let response;
    switch (instruction) {
      case ProgramInstruction.Create:
        d = data as CreateStreamData;
        response = await Stream.create(
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
          d.automatic_withdrawal,
          null,
          cluster
        );
        break;
      case ProgramInstruction.Topup:
        d = data as TopupStreamData;
        response = await Stream.topup(
          connection,
          // @ts-ignore
          wallet,
          d.stream,
          d.amount,
          cluster
        );
        break;
      case ProgramInstruction.Withdraw:
        d = data as WithdrawStreamData;
        response = await Stream.withdraw(
          connection,
          // @ts-ignore
          wallet,
          d.stream,
          d.amount,
          cluster
        );
        break;
      case ProgramInstruction.Cancel:
        d = data as CancelStreamData;
        response = await Stream.cancel(
          connection,
          // @ts-ignore
          wallet,
          d.stream,
          cluster
        );
        break;
      case ProgramInstruction.TransferRecipient:
        d = data as TransferStreamData;
        response = await Stream.transferRecipient(
          connection,
          // @ts-ignore
          wallet,
          d.stream,
          d.new_recipient,
          cluster
        );
        break;
    }

    const url = getExplorerLink("tx", response.tx); //todo print transaction here.
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
      { autoClose: 10000, closeOnClick: true }
    );
    return response.data || true;
  } catch (err: any) {
    toast.dismiss();
    let errorMsg = err.message;
    if (err.message.includes("Owner cannot sign")) errorMsg = "Recipient can not sign!";
    else if (
      err.message.includes("Attempt to debit an account but found no record of a prior credit.")
    )
      errorMsg = ERR_NO_PRIOR_CREDIT;

    toast.error(errorMsg);
    Sentry.captureException(err);
    return false;
  }
}
