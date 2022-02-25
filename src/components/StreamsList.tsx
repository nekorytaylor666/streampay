import { useEffect, FC } from "react";

import { PublicKey } from "@solana/web3.js";
import { Stream as StreamData, getNumberFromBN } from "@streamflow/stream";

import { StreamCard } from ".";
import { cancelStream } from "../api/transactions";
import { DATA_LAYER_VARIABLE, EVENT_ACTION, EVENT_CATEGORY } from "../constants";
import useStore, { StoreType } from "../stores";
import { getTokenAmount } from "../utils/helpers";
import { trackEvent } from "../utils/marketing_helpers";
import { WalletAdapter } from "../types";

const storeGetter = (state: StoreType) => ({
  Stream: state.Stream,
  connection: state.Stream?.getConnection(),
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
  wallet: WalletAdapter;
  type: "vesting" | "streams";
}
const StreamsList: FC<StreamsListProps> = ({ wallet, type }) => {
  const {
    Stream,
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
    connection,
  } = useStore(storeGetter);

  const updateToken = async () => {
    if (!connection || !wallet?.publicKey) return;
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
    if (!Stream || !wallet?.publicKey) return;

    (async () => {
      const allStreams = await Stream.get({
        wallet: wallet.publicKey as PublicKey,
      });
      populateStreams(allStreams);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster]);

  async function handleCancel(id: string) {
    if (!Stream) return;
    const isCancelled = await cancelStream(Stream, { id }, wallet);

    if (isCancelled) {
      const stream = await Stream.getOne({ id });
      const decimals = myTokenAccounts[stream.mint].uiTokenAmount.decimals;

      const cancelledAmount =
        getNumberFromBN(stream.depositedAmount, decimals) -
        getNumberFromBN(stream.withdrawnAmount, decimals);

      if (stream) {
        updateToken();
        updateStream([id, stream]);
        trackEvent(
          EVENT_CATEGORY.STREAM,
          EVENT_ACTION.CANCEL,
          wallet?.publicKey?.toBase58() as string,
          cancelledAmount * tokenPriceUsd,
          {
            [DATA_LAYER_VARIABLE.TOKEN_SYMBOL]: token.info.symbol,
            [DATA_LAYER_VARIABLE.STREAM_ADDRESS]: id,
            [DATA_LAYER_VARIABLE.TOKEN_FEE]: cancelledAmount * 0.0025,
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
