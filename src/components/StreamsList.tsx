import { useEffect, FC } from "react";

import { BN } from "@project-serum/anchor";
import Wallet from "@project-serum/sol-wallet-adapter";
import { PublicKey } from "@solana/web3.js";
import type { Connection, AccountInfo } from "@solana/web3.js";
import { decode, TokenStreamData } from "@streamflow/timelock/dist/layout";
import { toast } from "react-toastify";
import swal from "sweetalert";

import { Stream, EmptyStreams } from ".";
import sendTransaction from "../actions/sendTransaction";
import {
  ProgramInstruction,
  TIMELOCK_STRUCT_OFFSET_RECIPIENT,
  TIMELOCK_STRUCT_OFFSET_SENDER,
  TX_FINALITY_CONFIRMED,
} from "../constants";
import useStore, { StoreType } from "../stores";
import { Token } from "../types";
import { getTokenAmount } from "../utils/helpers";

const storeGetter = (state: StoreType) => ({
  streams: state.streams,
  addStream: state.addStream,
  deleteStream: state.deleteStream,
  clearStreams: state.clearStreams,
  token: state.token,
  myTokenAccounts: state.myTokenAccounts,
  setMyTokenAccounts: state.setMyTokenAccounts,
  setToken: state.setToken,
  programId: state.programId,
});

interface ProgramAccount {
  pubkey: PublicKey;
  account: AccountInfo<Buffer>;
}

const getProgramAccounts = (
  connection: Connection,
  programId: string,
  offset: number,
  bytes: string
) =>
  connection?.getProgramAccounts(new PublicKey(programId), {
    filters: [
      {
        memcmp: {
          offset,
          bytes,
        },
      },
    ],
  });

const sortStreams = (streams: { [s: string]: TokenStreamData }) =>
  Object.entries(streams).sort(
    ([, stream1], [, stream2]) => stream2.start_time.toNumber() - stream1.start_time.toNumber()
  );

interface StreamsListProps {
  connection: Connection;
  wallet: Wallet;
}
const StreamsList: FC<StreamsListProps> = ({ connection, wallet }) => {
  const {
    streams,
    addStream,
    deleteStream,
    clearStreams,
    token,
    myTokenAccounts,
    setMyTokenAccounts,
    setToken,
    programId,
  } = useStore(storeGetter);

  const publicKey = wallet.publicKey?.toBase58();

  const updateToken = async (connection: Connection, wallet: Wallet, token: Token) => {
    const address = token.info.address;
    const updatedTokenAmount = await getTokenAmount(connection, wallet, address);

    setMyTokenAccounts({
      ...myTokenAccounts,
      [address]: { ...myTokenAccounts[address], uiTokenAmount: updatedTokenAmount },
    });
    setToken({ ...token, uiTokenAmount: updatedTokenAmount });
  };

  const addStreams = (accounts: ProgramAccount[]) =>
    accounts.forEach((account) => {
      const decoded = decode(account.account.data);
      addStream(account.pubkey.toBase58(), decoded);
    });

  useEffect(() => {
    clearStreams();
    if (!connection || !publicKey) return;

    Promise.all([
      getProgramAccounts(connection, programId, TIMELOCK_STRUCT_OFFSET_SENDER, publicKey),
      getProgramAccounts(connection, programId, TIMELOCK_STRUCT_OFFSET_RECIPIENT, publicKey),
    ]).then(([senderStreams, recepientStreams]) =>
      addStreams([...senderStreams, ...recepientStreams])
    );

    //todo: issue #11 https://github.com/StreamFlow-Finance/streamflow-app/issues/1

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function withdrawStream(id: string) {
    const isWithdrawn = await sendTransaction(ProgramInstruction.Withdraw, {
      stream: new PublicKey(id),
      amount: new BN(0), //TODO: enable withdrawing arbitrary amount via UI
    });

    if (isWithdrawn) {
      const stream = await connection.getAccountInfo(new PublicKey(id), TX_FINALITY_CONFIRMED);

      if (stream) {
        updateToken(connection, wallet, token);
        addStream(id, decode(stream.data));
      }
    }
  }

  async function cancelStream(id: string) {
    const isCancelled = await sendTransaction(ProgramInstruction.Cancel, {
      stream: new PublicKey(id),
    });

    if (isCancelled) {
      const stream = await connection.getAccountInfo(new PublicKey(id), TX_FINALITY_CONFIRMED);
      console.log("STREAM", stream);
      if (stream) {
        updateToken(connection, wallet, token);
        addStream(id, decode(stream.data));
      }
    }

    return isCancelled;
  }

  async function transferStream(id: string) {
    const input = await swal({
      title: "Transfer recipient:",
      content: {
        element: "input",
        attributes: {
          placeholder: "New recipient address",
          type: "text",
        },
      },
    });

    try {
      const newRecipient = new PublicKey(input);
      const success = await sendTransaction(ProgramInstruction.TransferRecipient, {
        stream: new PublicKey(id),
        new_recipient: new PublicKey(newRecipient),
      });
      if (success) {
        toast.success("Stream transferred to " + input);
        deleteStream(id); //todo: let's keep it there, just as readonly.
      }
    } catch (e) {
      toast.error("Invalid address");
    }
  }

  if (!Object.keys(streams).length || !wallet?.publicKey?.toBase58()) return <EmptyStreams />;

  return (
    <>
      {sortStreams(streams).map(([id, data]) => (
        <Stream
          key={id}
          onWithdraw={() => withdrawStream(id)}
          onCancel={() => cancelStream(id)}
          onTransfer={() => transferStream(id)}
          id={id}
          data={data}
          myAddress={wallet?.publicKey?.toBase58() as string}
        />
      ))}
    </>
  );
};

export default StreamsList;
