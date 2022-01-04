import { useEffect, FC, useRef } from "react";

import Wallet from "@project-serum/sol-wallet-adapter";
import { PublicKey } from "@solana/web3.js";
import type { Connection, AccountInfo } from "@solana/web3.js";
import { decode, Stream as StreamData } from "@streamflow/timelock/dist/layout";
import { toast } from "react-toastify";

import { Stream, Modal, ModalRef } from ".";
import sendTransaction from "../actions/sendTransaction";
import {
  ProgramInstruction,
  TIMELOCK_STRUCT_OFFSET_RECIPIENT,
  TIMELOCK_STRUCT_OFFSET_SENDER,
  TX_FINALITY_CONFIRMED,
} from "../constants";
import useStore, { StoreType } from "../stores";
import { getTokenAmount } from "../utils/helpers";

const storeGetter = (state: StoreType) => ({
  streams: state.streams,
  addStream: state.addStream,
  addStreams: state.addStreams,
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

const sortStreams = (streams: { [s: string]: StreamData }, type: "vesting" | "streams") => {
  const isVesting = type === "vesting";

  const allStreams = Object.entries(streams).sort(
    ([, stream1], [, stream2]) => stream2.start_time.toNumber() - stream1.start_time.toNumber()
  );

  let filteredStreams = [];

  if (isVesting) {
    filteredStreams = allStreams.filter((stream) => stream[1].amount_per_period.isZero());
  } else {
    filteredStreams = allStreams.filter((stream) => !stream[1].amount_per_period.isZero());
  }
  return filteredStreams;
};

interface StreamsListProps {
  connection: Connection;
  wallet: Wallet;
  type: "vesting" | "streams";
}
const StreamsList: FC<StreamsListProps> = ({ connection, wallet, type }) => {
  const {
    streams,
    addStream,
    addStreams: addStreamsToStore,
    deleteStream,
    clearStreams,
    token,
    myTokenAccounts,
    setMyTokenAccounts,
    setToken,
    programId,
  } = useStore(storeGetter);
  const modalRef = useRef<ModalRef>(null);

  const publicKey = wallet.publicKey?.toBase58();

  const updateToken = async () => {
    const address = token.info.address;
    const updatedTokenAmount = await getTokenAmount(connection, wallet, address);

    setMyTokenAccounts({
      ...myTokenAccounts,
      [address]: { ...myTokenAccounts[address], uiTokenAmount: updatedTokenAmount },
    });
    setToken({ ...token, uiTokenAmount: updatedTokenAmount });
  };

  const addStreams = (accounts: ProgramAccount[]) => {
    let newStreams = {};
    accounts.forEach((account) => {
      const decoded = decode(account.account.data);
      newStreams = { ...newStreams, [account.pubkey.toBase58()]: decoded };
    });

    addStreamsToStore(newStreams);
  };

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

  async function cancelStream(id: string) {
    const isCancelled = await sendTransaction(ProgramInstruction.Cancel, {
      stream: new PublicKey(id),
    });

    if (isCancelled) {
      const stream = await connection.getAccountInfo(new PublicKey(id), TX_FINALITY_CONFIRMED);
      if (stream) {
        updateToken();
        addStream(id, decode(stream.data));
      }
    }

    return isCancelled;
  }

  async function transferStream(id: string) {
    const newRecipientAddress = await modalRef?.current?.show();

    if (newRecipientAddress !== undefined) {
      try {
        const newRecipient = new PublicKey(newRecipientAddress);
        const success = await sendTransaction(ProgramInstruction.TransferRecipient, {
          stream: new PublicKey(id),
          new_recipient: new PublicKey(newRecipient),
        });
        if (success) {
          toast.success("Stream transferred to " + newRecipientAddress);
          deleteStream(id); //todo: let's keep it there, just as readonly.
        }
      } catch (e) {
        toast.error("Invalid address");
      }
    }
  }

  return (
    <>
      {sortStreams(streams, type).map(([id, data]) => (
        <Stream
          key={id}
          onCancel={() => cancelStream(id)}
          onTransfer={() => transferStream(id)}
          onWithdraw={updateToken}
          onTopup={updateToken}
          id={id}
          data={data}
          myAddress={wallet?.publicKey?.toBase58() as string}
        />
      ))}
      <Modal
        ref={modalRef}
        title="Transfer recipient:"
        type="text"
        placeholder="Recipient address"
        confirm={{ color: "blue", text: "Transfer" }}
      />
    </>
  );
};

export default StreamsList;
