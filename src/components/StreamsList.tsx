import { useEffect, FC } from "react";

import Wallet from "@project-serum/sol-wallet-adapter";
import { PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";
import { Stream as StreamData } from "@streamflow/timelock";
import Stream from "@streamflow/timelock";

import { StreamCard } from ".";
import { cancelStream } from "../api/transactions";
import { DATA_LAYER_VARIABLE, EVENT_ACTION, EVENT_CATEGORY } from "../constants";
import useStore, { StoreType } from "../stores";
import { getTokenAmount } from "../utils/helpers";
import { trackEvent } from "../utils/marketing_helpers";

const storeGetter = (state: StoreType) => ({
  streams: state.streams,
  addStream: state.addStream,
  populateStreams: state.populateStreams,
  updateStream: state.updateStream,
  deleteStream: state.deleteStream,
  clearStreams: state.clearStreams,
  token: state.token,
  tokenPriceUsd: state.tokenPriceUsd,
  myTokenAccounts: state.myTokenAccounts,
  setMyTokenAccounts: state.setMyTokenAccounts,
  setToken: state.setToken,
  cluster: state.cluster,
  walletType: state.walletType,
});

const filterStreams = (streams: [string, StreamData][], type: "vesting" | "streams") => {
  const isVesting = type === "vesting";

  if (isVesting) return streams.filter((stream) => !stream[1].canTopup);
  return streams.filter((stream) => stream[1].canTopup);
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
    populateStreams,
    clearStreams,
    token,
    tokenPriceUsd,
    myTokenAccounts,
    setMyTokenAccounts,
    setToken,
    cluster,
    walletType,
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
      const allStreams = await Stream.get({
        connection,
        wallet: wallet.publicKey as PublicKey,
        cluster,
      });
      populateStreams(allStreams);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster]);

  async function handleCancel(id: string) {
    // @ts-ignore
    const isCancelled = await cancelStream({ id }, connection, wallet, cluster);

    if (isCancelled) {
      const stream = await Stream.getOne({ connection, id });
      const cancelledAmount = stream.depositedAmount - stream.withdrawnAmount;
      if (stream) {
        updateToken();
        updateStream([id, stream]);
        trackEvent(
          EVENT_CATEGORY.STREAM,
          EVENT_ACTION.CANCEL,
          wallet?.publicKey?.toBase58() as string,
          (cancelledAmount * tokenPriceUsd) / 10 ** token.uiTokenAmount.decimals,
          {
            [DATA_LAYER_VARIABLE.TOKEN_SYMBOL]: token.info.symbol,
            [DATA_LAYER_VARIABLE.STREAM_ADDRESS]: id,
            [DATA_LAYER_VARIABLE.TOKEN_FEE]:
              (cancelledAmount * 0.0025) / 10 ** token.uiTokenAmount.decimals,
            [DATA_LAYER_VARIABLE.WALLET_TYPE]: walletType?.name,
          }
        );
      }
    }
  }

  return (
    <>
      {filterStreams(streams, type).map(([id, data]) => (
        <StreamCard
          key={id}
          onCancel={() => handleCancel(id)}
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
