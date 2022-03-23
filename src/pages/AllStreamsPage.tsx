import { useEffect } from "react";

import Stream from "@streamflow/stream";

import useStore, { StoreType } from "../stores";
import { StreamsList } from "../components";

const storeGetter = (state: StoreType) => ({
  streams: state.streams,
  setLoading: state.setLoading,
  populateStreams: state.populateStreams,
  clearStreams: state.clearStreams,
  cluster: state.cluster,
  wallet: state.wallet!,
  connection: state.connection()!,
});

const AllStreamsPage = () => {
  const { populateStreams, clearStreams, cluster, connection, wallet, streams, setLoading } =
    useStore(storeGetter);

  useEffect(() => {
    clearStreams();
    setLoading(true);

    (async () => {
      const allStreams = await Stream.get({
        connection,
        wallet: wallet.publicKey,
        cluster,
      });
      populateStreams(allStreams);
      setLoading(false);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster]);

  return (
    <div className="px-4 sm:pl-0 flex-grow py-6">
      <h3 className="sm:hidden font-bold text-white text-center mb-6 mt-2">All Streams</h3>
      <StreamsList streams={streams} />
    </div>
  );
};

export default AllStreamsPage;
