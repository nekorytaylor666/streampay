import { useEffect } from "react";

import Stream from "@streamflow/stream";

import useStore, { StoreType } from "../stores";
import { StreamsList, DesktopMode } from "../components";

const storeGetter = (state: StoreType) => ({
  streams: state.streams,
  populateStreams: state.populateStreams,
  clearStreams: state.clearStreams,
  cluster: state.cluster,
  wallet: state.wallet!,
  connection: state.connection()!,
});

const AllStreamsPage = () => {
  const { populateStreams, clearStreams, cluster, connection, wallet, streams } =
    useStore(storeGetter);

  useEffect(() => {
    clearStreams();

    (async () => {
      const allStreams = await Stream.get({
        connection,
        wallet: wallet.publicKey,
        cluster,
      });
      console.log("all streams", allStreams);
      populateStreams(allStreams);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster]);

  return (
    <>
      <DesktopMode />
      <StreamsList streams={streams} />
    </>
  );
};

export default AllStreamsPage;
