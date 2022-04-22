import { useMemo } from "react";

import { Stream as StreamData } from "@streamflow/stream";
import { useQuery, UseQueryResult } from "react-query";

import useStore, { StoreType } from "../stores";

const storeGetter = (state: StoreType) => ({
  StreamInstance: state.StreamInstance,
  streams: state.streams,
  setLoading: state.setLoading,
  populateStreams: state.populateStreams,
  clearStreams: state.clearStreams,
  cluster: state.cluster,
  wallet: state.wallet!,
  connection: state.StreamInstance?.getConnection(),
  clusterUrl: state.clusterUrl,
});

type StreamOutput = [string, StreamData];
//we either return full use query result or just essential loaders
export const useStreams = ():
  | UseQueryResult<StreamOutput[]>
  | Pick<UseQueryResult<StreamOutput[]>, "isLoading" | "data" | "isError"> => {
  const { cluster, StreamInstance, wallet, clusterUrl } = useStore(storeGetter);
  //it will create memoized query with refetch interval 3 sec and it also refetchin background.
  const isInstanceConnectedToCluster = useMemo(
    () => (StreamInstance?.getConnection() as any)?._rpcEndpoint === clusterUrl(),
    [StreamInstance, clusterUrl]
  );
  const query = useQuery(
    ["streams", cluster],
    async () => {
      if (!StreamInstance || !wallet?.publicKey) return [];
      return StreamInstance?.get({
        wallet: wallet.publicKey,
      });
    },
    {
      refetchInterval: 3000,
      refetchIntervalInBackground: true,
      enabled: isInstanceConnectedToCluster,
    }
  );
  const tempQueryResult = { isLoading: true, data: [], isError: false };
  if (!isInstanceConnectedToCluster) {
    return tempQueryResult;
  }
  return query;
};
