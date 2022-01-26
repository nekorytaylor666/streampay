import { useEffect, FC } from "react";

import Wallet from "@project-serum/sol-wallet-adapter";
import { PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";
import { Stream as StreamData } from "@streamflow/timelock/dist/layout";
import Stream from "@streamflow/timelock";

import { StreamCard } from ".";
import sendTransaction from "../actions/sendTransaction";
import { ProgramInstruction, EVENT_ACTION, EVENT_CATEGORY } from "../constants";
import useStore, { StoreType } from "../stores";
import { getTokenAmount } from "../utils/helpers";
import { trackEvent } from "../utils/marketing_helpers";

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
  cluster: state.cluster,
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
    clearStreams,
    token,
    myTokenAccounts,
    setMyTokenAccounts,
    setToken,
    cluster,
  } = useStore(storeGetter);
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
      const allStreams = await Stream.get(
        connection,
        wallet.publicKey as PublicKey,
        "all",
        "all",
        cluster
      );
      addStreamsToStore(allStreams);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster]);

  async function cancelStream(id: string) {
    const isCancelled = await sendTransaction(ProgramInstruction.Cancel, {
      stream: new PublicKey(id),
    });

    if (isCancelled) {
      const stream = await Stream.getOne(connection, new PublicKey(id));
      if (stream) {
        updateToken();
        updateStream([id, stream]);
        trackEvent(
          EVENT_CATEGORY.STREAM,
          EVENT_ACTION.CANCELED,
          wallet?.publicKey?.toBase58() as string,
          "0"
        );
      }
    }

    return isCancelled;
  }

  return (
    <>
      {filterStreams(streams, type).map(([id, data]) => (
        <StreamCard
          key={id}
          onCancel={() => cancelStream(id)}
          onWithdraw={updateToken}
          onTopup={updateToken}
          id={id}
          data={data}
          myAddress={wallet?.publicKey?.toBase58() as string}
        />
      ))}
    </>
  );
};

export default StreamsList;
