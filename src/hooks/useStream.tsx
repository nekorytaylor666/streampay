import Stream, { Stream as StreamData } from "@streamflow/stream";
import { useQuery, UseQueryResult } from "react-query";

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

export const useStreams = (): UseQueryResult<[string, StreamData][]> => {
  const { cluster, connection, wallet } = useStore(storeGetter);
  //it will create memoized query with refetch interval 3 sec and it also refetchin background.
  return useQuery(
    ["streams", cluster],
    async () => Stream.get({ connection, wallet: wallet.publicKey, cluster }),
    {
      refetchInterval: 3000,
      refetchIntervalInBackground: true,
    }
  );
};
