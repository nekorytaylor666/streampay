import { useEffect, FC, useRef } from "react";

import Wallet from "@project-serum/sol-wallet-adapter";
import { PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";
import { Stream as StreamData } from "@streamflow/timelock/dist/layout";
import Stream from "@streamflow/timelock";
import { toast } from "react-toastify";

import { StreamCard, Modal, ModalRef } from ".";
import sendTransaction from "../actions/sendTransaction";
import { ProgramInstruction } from "../constants";
import useStore, { StoreType } from "../stores";
import { getTokenAmount } from "../utils/helpers";

const storeGetter = (state: StoreType) => ({
  streams: state.streams,
  addStream: state.addStream,
  addStreams: state.addStreams,
  updateStream: state.updateStream,
  deleteStream: state.deleteStream,
  clearStreams: state.clearStreams,
  token: state.token,
  myTokenAccounts: state.myTokenAccounts,
  setMyTokenAccounts: state.setMyTokenAccounts,
  setToken: state.setToken,
});

const filterStreams = (streams: [string, StreamData][], type: "vesting" | "streams") => {
  const isVesting = type === "vesting";

  if (isVesting) return streams.filter((stream) => !stream[1].can_topup);
  return streams.filter((stream) => stream[1].can_topup);
};

interface StreamsListProps {
  connection: Connection;
  wallet: Wallet;
  type: "vesting" | "streams";
}
const StreamsList: FC<StreamsListProps> = ({ connection, wallet, type }) => {
  const {
    streams,
    updateStream,
    addStreams: addStreamsToStore,
    deleteStream,
    clearStreams,
    token,
    myTokenAccounts,
    setMyTokenAccounts,
    setToken,
  } = useStore(storeGetter);
  const modalRef = useRef<ModalRef>(null);

  const updateToken = async () => {
    const address = token.info.address;
    const updatedTokenAmount = await getTokenAmount(connection, wallet, address);

    setMyTokenAccounts({
      ...myTokenAccounts,
      [address]: { ...myTokenAccounts[address], uiTokenAmount: updatedTokenAmount },
    });
    setToken({ ...token, uiTokenAmount: updatedTokenAmount });
  };

  useEffect(() => {
    clearStreams();
    if (!connection || !wallet?.publicKey) return;

    (async () => {
      const allStreams = await Stream.get(connection, wallet.publicKey as PublicKey);
      addStreamsToStore(allStreams);
    })();

    //todo: issue #11 https://github.com/StreamFlow-Finance/streamflow-app/issues/11
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cancelStream(id: string) {
    const isCancelled = await sendTransaction(ProgramInstruction.Cancel, {
      stream: new PublicKey(id),
    });

    if (isCancelled) {
      const stream = await Stream.getOne(connection, new PublicKey(id));
      if (stream) {
        updateToken();
        updateStream([id, stream]);
      }
    }

    return isCancelled;
  }

  async function transferStream(id: string, invoker: "sender" | "recipient") {
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

          if (invoker === "sender") {
            const stream = await Stream.getOne(connection, new PublicKey(id));
            updateStream([id, stream]);
          } else deleteStream(id);
        }
      } catch (e) {
        toast.error("Invalid address");
      }
    }
  }

  return (
    <>
      {filterStreams(streams, type).map(([id, data]) => (
        <StreamCard
          key={id}
          onCancel={() => cancelStream(id)}
          onTransfer={(invoker) => transferStream(id, invoker)}
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
