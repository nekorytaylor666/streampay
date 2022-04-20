import { FC } from "react";

import Stream, { getNumberFromBN, Stream as StreamData } from "@streamflow/stream";

import { StreamCard, NoStreams } from "../components";
import { cancelStream } from "../api/transactions";
import { DATA_LAYER_VARIABLE, EVENT_ACTION, EVENT_CATEGORY } from "../constants";
import useStore, { StoreType } from "../stores";
import { getTokenAmount, sortTokenAccounts } from "../utils/helpers";
import { trackEvent } from "../utils/marketing_helpers";

const storeGetter = (state: StoreType) => ({
  addStream: state.addStream,
  populateStreams: state.populateStreams,
  updateStream: state.updateStream,
  deleteStream: state.deleteStream,
  clearStreams: state.clearStreams,
  token: state.token,
  tokenPriceUsd: state.tokenPriceUsd,
  myTokenAccounts: state.myTokenAccounts,
  setMyTokenAccounts: state.setMyTokenAccounts,
  setMyTokenAccountsSorted: state.setMyTokenAccountsSorted,
  setToken: state.setToken,
  cluster: state.cluster,
  walletType: state.walletType,
  wallet: state.wallet!,
  connection: state.connection()!,
  loading: state.loading,
});

interface StreamsListProps {
  streams: [string, StreamData][];
}

const StreamsList: FC<StreamsListProps> = ({ streams }) => {
  const {
    updateStream,
    token,
    tokenPriceUsd,
    myTokenAccounts,
    setMyTokenAccounts,
    setMyTokenAccountsSorted,
    setToken,
    cluster,
    walletType,
    connection,
    wallet,
  } = useStore(storeGetter);

  const updateToken = async () => {
    const address = token.info.address;
    const updatedTokenAmount = await getTokenAmount(connection, wallet, address);
    const updatedTokenAccounts = {
      ...myTokenAccounts,
      [address]: { ...myTokenAccounts[address], uiTokenAmount: updatedTokenAmount },
    };

    const myTokenAccountsSorted = sortTokenAccounts(myTokenAccounts);

    setMyTokenAccounts(updatedTokenAccounts);
    setMyTokenAccountsSorted(myTokenAccountsSorted);
    setToken({ ...token, uiTokenAmount: updatedTokenAmount });
  };

  async function handleCancel(id: string) {
    const isCancelled = await cancelStream({ id }, connection, wallet, cluster);

    if (isCancelled) {
      const stream = await Stream.getOne({ connection, id });
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

  if (!streams) {
    return <NoStreams />;
  }

  return (
    <>
      {streams.length > 0 && (
        <div className="block w-full">
          <div className="hidden sm:grid sm:grid-cols-8 xl:grid-cols-11 rounded-2xl px-4 py-4 mb-1 sm:gap-x-3">
            <p className="text-p2 text-gray-light">Status</p>
            <p className="text-p2 text-gray-light hidden xl:block">Type/Direction</p>
            <p className="text-p2 text-gray-light col-span-2">Subject/Stream ID</p>
            <p className="text-p2 text-gray-light col-span-2">Withdrawn</p>
            <p className="text-p2 text-gray-light col-span-2">Unlocked (Returned)</p>
            <p className="text-p2 text-gray-light hidden xl:block col-span-2">Release Rate</p>
            <p className="text-p2 text-gray-light">Actions</p>
          </div>
          {streams.map(([id, data]) => (
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
        </div>
      )}
      {streams.length === 0 && (
        <NoStreams title="No Streams Available" subtitle="No existing streams to show here." />
      )}
    </>
  );
};

export default StreamsList;
