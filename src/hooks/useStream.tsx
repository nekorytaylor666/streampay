import { useEffect } from "react";

import Stream, { Stream as StreamData } from "@streamflow/stream";

import useStore, { StoreType } from "../stores";

const storeGetter = (state: StoreType) => ({
  streams: state.streams,
  setLoading: state.setLoading,
  populateStreams: state.populateStreams,
  clearStreams: state.clearStreams,
  cluster: state.cluster,
  wallet: state.wallet!,
  connection: state.connection()!,
});

export interface UseStreamOutput {
  streams: [string, StreamData][];
}

export const useStreams = (): UseStreamOutput => {
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

  return { streams };
};
