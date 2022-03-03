import { toast } from "react-toastify";
import Stream, {
  ClusterExtended,
  WithdrawStreamData,
  CreateStreamData,
  TransferStreamData,
  TopupStreamData,
  CancelStreamData,
} from "@streamflow/stream";
import * as Sentry from "@sentry/react";
import { Wallet } from "@project-serum/anchor/src/provider";
import { Connection } from "@solana/web3.js";

import { ERR_NOT_CONNECTED, TX_FINALITY_FINALIZED, ERR_NO_PRIOR_CREDIT } from "../constants";
import { getExplorerLink } from "../utils/helpers";
import { MsgToast } from "../components";

export const createStream = async (
  data: CreateStreamData,
  connection: Connection,
  wallet: Wallet | null,
  cluster: ClusterExtended
) => {
  try {
    if (!wallet || wallet?.publicKey === null || !connection) {
      throw new Error(ERR_NOT_CONNECTED);
    }

    toast.info(<MsgToast title="Please confirm transaction in your wallet." type="info" />, {
      autoClose: false,
    });
    const response = await Stream.create({
      ...data,
      sender: wallet,
      connection,
      cluster,
    });

    const stream = await Stream.getOne({ connection, id: response.id });

    const url = getExplorerLink("tx", response.tx); // TODO print transaction here.
    toast.dismiss();
    toast.success(
      <MsgToast
        type="success"
        url={url}
        title={`Transaction ${connection.commitment}!`}
        message={
          connection.commitment !== TX_FINALITY_FINALIZED
            ? " Please allow it few seconds to finalize."
            : ""
        }
      />,
      {
        autoClose: 10000,
        closeOnClick: true,
      }
    );

    return { ...response, stream };
  } catch (err: any) {
    toast.dismiss();
    console.log("err", err);
    handleError(err);
  }
};

export const withdrawStream = async (
  data: WithdrawStreamData,
  connection: Connection,
  wallet: Wallet | null,
  cluster: ClusterExtended
) => {
  try {
    if (!wallet || wallet?.publicKey === null || !connection) {
      throw new Error(ERR_NOT_CONNECTED);
    }

    toast.info(<MsgToast title="Please confirm transaction in your wallet." type="info" />, {
      autoClose: false,
    });
    const response = await Stream.withdraw({ ...data, connection, invoker: wallet, cluster });

    const url = getExplorerLink("tx", response.tx);
    toast.dismiss();
    toast.success(
      <MsgToast
        type="success"
        url={url}
        title={`Transaction ${connection.commitment}!`}
        message={
          connection.commitment !== TX_FINALITY_FINALIZED
            ? " Please allow it few seconds to finalize."
            : ""
        }
      />,
      {
        autoClose: 10000,
        closeOnClick: true,
      }
    );

    return response;
  } catch (err: any) {
    toast.dismiss();
    handleError(err);
  }
};

export const topupStream = async (
  data: TopupStreamData,
  connection: Connection,
  wallet: Wallet | null,
  cluster: ClusterExtended
) => {
  try {
    if (!wallet || wallet?.publicKey === null || !connection) {
      throw new Error(ERR_NOT_CONNECTED);
    }

    toast.info(<MsgToast title="Please confirm transaction in your wallet." type="info" />, {
      autoClose: false,
    });
    const response = await Stream.topup({ ...data, connection, invoker: wallet, cluster });

    const url = getExplorerLink("tx", response.tx);
    toast.dismiss();
    toast.success(
      <MsgToast
        type="success"
        url={url}
        title={`Transaction ${connection.commitment}!`}
        message={
          connection.commitment !== TX_FINALITY_FINALIZED
            ? " Please allow it few seconds to finalize."
            : ""
        }
      />,
      {
        autoClose: 10000,
        closeOnClick: true,
      }
    );

    return response;
  } catch (err: any) {
    toast.dismiss();
    handleError(err);
  }
};

export const transferStream = async (
  data: TransferStreamData,
  connection: Connection,
  wallet: Wallet,
  cluster: ClusterExtended
) => {
  try {
    toast.info(<MsgToast title="Please confirm transaction in your wallet." type="info" />, {
      autoClose: false,
    });

    const response = await Stream.transfer({
      ...data,
      connection,
      invoker: wallet,
      cluster,
    });

    const url = getExplorerLink("tx", response.tx);
    toast.dismiss();
    toast.success(
      <MsgToast
        type="success"
        url={url}
        title={`Transaction ${connection.commitment}!`}
        message={
          connection.commitment !== TX_FINALITY_FINALIZED
            ? " Please allow it few seconds to finalize."
            : ""
        }
      />,
      {
        autoClose: 10000,
        closeOnClick: true,
      }
    );

    return response;
  } catch (err: any) {
    toast.dismiss();
    handleError(err);
  }
};

export const cancelStream = async (
  data: CancelStreamData,
  connection: Connection,
  wallet: Wallet | null,
  cluster: ClusterExtended
) => {
  try {
    if (!wallet || wallet?.publicKey === null || !connection) {
      throw new Error(ERR_NOT_CONNECTED);
    }

    toast.info(<MsgToast title="Please confirm transaction in your wallet." type="info" />, {
      autoClose: false,
    });
    const response = await Stream.cancel({ ...data, connection, invoker: wallet, cluster });

    const url = getExplorerLink("tx", response.tx);
    toast.dismiss();
    toast.success(
      <MsgToast
        type="success"
        url={url}
        title={`Transaction ${connection.commitment}!`}
        message={
          connection.commitment !== TX_FINALITY_FINALIZED
            ? " Please allow it few seconds to finalize."
            : ""
        }
      />,
      {
        autoClose: 10000,
        closeOnClick: true,
      }
    );

    return response;
  } catch (err: any) {
    toast.dismiss();
    handleError(err);
  }
};

const handleError = (err: any) => {
  let errorMsg = err.message;

  if (err.message.includes("Owner cannot sign")) {
    errorMsg = "Recipient can't sign!";
  } else if (
    err.message.includes("Attempt to debit an account but found no record of a prior credit.")
  ) {
    errorMsg = ERR_NO_PRIOR_CREDIT;
  } else if (errorMsg.length === 0) {
    errorMsg = err.msg;
  }

  toast.error(<MsgToast title={errorMsg} type="error" />);
  Sentry.captureException(err);

  return errorMsg;
};
