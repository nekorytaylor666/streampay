import { useEffect, FC } from "react";

import { PublicKey } from "@solana/web3.js";
import Stream, { getNumberFromBN } from "@streamflow/stream";

import { Link, StreamCard } from "../components";
import { cancelStream } from "../api/transactions";
import { DATA_LAYER_VARIABLE, EVENT_ACTION, EVENT_CATEGORY } from "../constants";
import useStore, { StoreType } from "../stores";
import { getTokenAmount, sortTokenAccounts } from "../utils/helpers";
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
  setMyTokenAccountsSorted: state.setMyTokenAccountsSorted,
  setToken: state.setToken,
  cluster: state.cluster,
  walletType: state.walletType,
  oldStreams: state.oldStreams,
  wallet: state.wallet!,
  connection: state.connection()!,
});

const StreamsPage: FC = () => {
  const {
    streams,
    updateStream,
    populateStreams,
    clearStreams,
    token,
    tokenPriceUsd,
    myTokenAccounts,
    setMyTokenAccounts,
    setMyTokenAccountsSorted,
    setToken,
    cluster,
    walletType,
    oldStreams,
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

  return (
    <div className="w-full">
      {oldStreams && (
        <>
          <p className="text-white font-bold text-sm sm:text-base text-center mt-6 mb-12">
            Your old streams are SAFU. View them{" "}
            <Link url={"https://free.streamflow.finance"} title={"here"} classes={"text-blue"} />.
            <br />
          </p>
        </>
      )}
      <div className="grid grid-cols-7 gap-x-2 mb-5 px-6">
        <p className="text-p2 text-gray-light">Status</p>
        <p className="text-p2 text-gray-light">Type/Direction</p>
        <p className="text-p2 text-gray-light">Subject/Stream ID</p>
        <p className="text-p2 text-gray-light">Withdrawn/Deposited</p>
        <p className="text-p2 text-gray-light">Unlocked/Returned</p>
        <p className="text-p2 text-gray-light">Release Rate</p>
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
  );
};

export default StreamsPage;
