import { useMemo } from "react";

import { Stream as StreamData } from "@streamflow/stream";
import { useQuery, UseQueryResult } from "react-query";

import { sortStreams } from "../utils/helpers";
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
type FilteredStreamsOutput = {
  all: StreamOutput[];
  incoming: StreamOutput[];
  outgoing: StreamOutput[];
};
//we either return full use query result or just essential loaders
export const useStreams = ():
  | UseQueryResult<FilteredStreamsOutput>
  | Pick<UseQueryResult<FilteredStreamsOutput>, "isLoading" | "data" | "isError"> => {
  const { cluster, StreamInstance, wallet, clusterUrl } = useStore(storeGetter);
  //check for rpc endpoint on StreamInstance to be same as clusterUrl in the store. If they are the same we will assume that instance is connected to right cluster
  const isInstanceConnectedToCluster = useMemo(
    () => (StreamInstance?.getConnection() as any)?._rpcEndpoint === clusterUrl(),
    [StreamInstance, clusterUrl]
  );

  //it will create memoized query with refetch interval 3 sec and it also refetchin background.
  const query: UseQueryResult<FilteredStreamsOutput> = useQuery(
    ["streams", cluster],
    async () => {
      if (!StreamInstance || !wallet?.publicKey) return [];
      const userWalletPublicKey = wallet.publicKey.toBase58();
      const streams = await StreamInstance?.get({
        wallet: wallet.publicKey,
      });
      const all = sortStreams(streams);
      const incoming = streams.filter((stream) => stream[1].recipient === userWalletPublicKey);
      const outgoing = streams.filter((stream) => stream[1].sender === userWalletPublicKey);
      const res: FilteredStreamsOutput = {
        all,
        incoming,
        outgoing,
      };
      return res;
    },
    {
      refetchInterval: 10000,
      refetchOnMount: false,
      refetchIntervalInBackground: true,
      enabled: isInstanceConnectedToCluster,
    }
  );
  //if instance is not connectet yet return placeholder object that will immitate react query response on loading stage
  if (!isInstanceConnectedToCluster) {
    return { isLoading: true, isError: false, data: { all: [], incoming: [], outgoing: [] } };
  }
  return query;
};
