import { toast } from "react-toastify";
import bs58 from "bs58";
import {
  StreamRaw,
  WithdrawStreamData,
  CreateStreamData,
  TransferStreamData,
  TopupStreamData,
  CancelStreamData,
} from "@streamflow/stream";
import * as Sentry from "@sentry/react";
import { Wallet } from "@project-serum/anchor/src/provider";
import { Connection, Keypair } from "@solana/web3.js";

import ToastrLink from "../components/ToastrLink";
import { ERR_NOT_CONNECTED, TX_FINALITY_FINALIZED, ERR_NO_PRIOR_CREDIT } from "../constants";
import { getExplorerLink } from "../utils/helpers";
import { MsgToast } from "../components";

export const createStream = async (
  Stream: StreamRaw,
  data: CreateStreamData,
  wallet: Wallet | null
) => {
  try {
    if (!wallet || wallet?.publicKey === null || !Stream.getConnection()) {
      throw new Error(ERR_NOT_CONNECTED);
    }

    toast.info(<MsgToast title="Please confirm transaction in your wallet." type="info" />, {
      autoClose: false,
    });

    const proba = bs58.decode(""); //TODO: ADD secret key
    const bufferFrom = Uint8Array.from(proba);

    const keypair = Keypair.fromSecretKey(bufferFrom);

    const response = await Stream.create({
      ...data,
      sender: keypair,
      partner: wallet.publicKey.toBase58(),
    });

    const stream = await Stream.getOne(response.metadata.publicKey.toBase58());

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
  Stream: StreamRaw,
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

export const topupStream = async (
  Stream: StreamRaw,
  data: TopupStreamData,
  wallet: Wallet | null
) => {
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

export const transferStream = async (
  Stream: StreamRaw,
  data: TransferStreamData,
  wallet: Wallet
) => {
  try {
    toast.info(<MsgToast title="Please confirm transaction in your wallet." type="info" />, {
      autoClose: false,
    });

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
  Stream: StreamRaw,
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
