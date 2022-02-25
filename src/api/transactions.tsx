import { toast } from "react-toastify";
import Stream, {
  WithdrawStreamData,
  CreateStreamData,
  TransferStreamData,
  TopupStreamData,
  CancelStreamData,
} from "@streamflow/stream";
import * as Sentry from "@sentry/react";
import { Wallet } from "@project-serum/anchor/src/provider";
import { Connection } from "@solana/web3.js";

import ToastrLink from "../components/ToastrLink";
import { ERR_NOT_CONNECTED, TX_FINALITY_FINALIZED, ERR_NO_PRIOR_CREDIT } from "../constants";
import { getExplorerLink } from "../utils/helpers";

export const createStream = async (
  Stream: Stream,
  data: CreateStreamData,
  wallet: Wallet | null
) => {
  try {
    if (!wallet || wallet?.publicKey === null || !Stream.getConnection()) {
      throw new Error(ERR_NOT_CONNECTED);
    }

    toast.info("Please confirm transaction in your wallet.", { autoClose: false });
    const response = await Stream.create({
      ...data,
      sender: wallet,
      partner: wallet.publicKey.toBase58(),
    });

    const stream = await Stream.getOne({ id: response.metadata.publicKey.toBase58() });

    const url = getExplorerLink("tx", response.tx); // TODO print transaction here.
    toast.dismiss();
    toast.success(<ToastSuccess url={url} connection={Stream.getConnection()} />, {
      autoClose: 10000,
      closeOnClick: true,
    });

    return { ...response, stream };
  } catch (err: any) {
    toast.dismiss();
    console.log("err", err);
    handleError(err);
  }
};

export const withdrawStream = async (
  Stream: Stream,
  data: WithdrawStreamData,
  wallet: Wallet | null
) => {
  try {
    if (!wallet || wallet?.publicKey === null || !Stream.getConnection()) {
      throw new Error(ERR_NOT_CONNECTED);
    }

    toast.info("Please confirm transaction in your wallet.", { autoClose: false });
    const response = await Stream.withdraw({ ...data, invoker: wallet });

    const url = getExplorerLink("tx", response.tx);
    toast.dismiss();
    toast.success(<ToastSuccess url={url} connection={Stream.getConnection()} />, {
      autoClose: 10000,
      closeOnClick: true,
    });

    return response;
  } catch (err: any) {
    toast.dismiss();
    handleError(err);
  }
};

export const topupStream = async (Stream: Stream, data: TopupStreamData, wallet: Wallet | null) => {
  try {
    if (!wallet || wallet?.publicKey === null || !Stream.getConnection()) {
      throw new Error(ERR_NOT_CONNECTED);
    }

    toast.info("Please confirm transaction in your wallet.", { autoClose: false });
    const response = await Stream.topup({ ...data, invoker: wallet });

    const url = getExplorerLink("tx", response.tx);
    toast.dismiss();
    toast.success(<ToastSuccess url={url} connection={Stream.getConnection()} />, {
      autoClose: 10000,
      closeOnClick: true,
    });

    return response;
  } catch (err: any) {
    toast.dismiss();
    handleError(err);
  }
};

export const transferStream = async (Stream: Stream, data: TransferStreamData, wallet: Wallet) => {
  try {
    toast.info("Please confirm transaction in your wallet.", { autoClose: false });

    const response = await Stream.transfer({
      ...data,
      invoker: wallet,
    });

    const url = getExplorerLink("tx", response.tx);
    toast.dismiss();
    toast.success(<ToastSuccess url={url} connection={Stream.getConnection()} />, {
      autoClose: 10000,
      closeOnClick: true,
    });

    return response;
  } catch (err: any) {
    toast.dismiss();
    handleError(err);
  }
};

export const cancelStream = async (
  Stream: Stream,
  data: CancelStreamData,
  wallet: Wallet | null
) => {
  try {
    if (!wallet || wallet?.publicKey === null || !Stream.getConnection()) {
      throw new Error(ERR_NOT_CONNECTED);
    }

    toast.info("Please confirm transaction in your wallet.", { autoClose: false });
    const response = await Stream.cancel({ ...data, invoker: wallet });

    const url = getExplorerLink("tx", response.tx);
    toast.dismiss();
    toast.success(<ToastSuccess url={url} connection={Stream.getConnection()} />, {
      autoClose: 10000,
      closeOnClick: true,
    });

    return response;
  } catch (err: any) {
    toast.dismiss();
    handleError(err);
  }
};

const ToastSuccess = ({ url, connection }: { url: string; connection: Connection }) => (
  <ToastrLink
    url={url}
    urlText="View on explorer"
    nonUrlText={
      `Transaction ${connection.commitment}!` +
      (connection.commitment !== TX_FINALITY_FINALIZED
        ? " Please allow it few seconds to finalize."
        : "")
    }
  />
);

const handleError = (err: any) => {
  let errorMsg = err.message;
  if (err.message.includes("Owner cannot sign")) errorMsg = "Recipient can't sign!";
  else if (
    err.message.includes("Attempt to debit an account but found no record of a prior credit.")
  )
    errorMsg = ERR_NO_PRIOR_CREDIT;

  toast.error(errorMsg);
  Sentry.captureException(err);

  return errorMsg;
};
