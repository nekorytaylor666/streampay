import { Dispatch, SetStateAction } from "react";

import { clusterApiUrl } from "@solana/web3.js";
import { Cluster, ClusterExtended, LocalCluster } from "@streamflow/timelock";

export const CLUSTER_LOCAL = "local";

const clusterUrls: { [s: string]: () => string } = {
  [CLUSTER_LOCAL]: () => "http://localhost:8899", // http://127.0.0.1:8899",
  [Cluster.Devnet]: () => clusterApiUrl(Cluster.Devnet),
  [Cluster.Mainnet]: () => clusterApiUrl(Cluster.Mainnet),
};

interface NetworkStore {
  cluster: ClusterExtended;
  clusterUrl: () => string;
  explorerUrl: () => string;
  setCluster: (cluster: Cluster) => Dispatch<
    SetStateAction<{
      cluster: Cluster;
    }>
  >;
}

const useNetworkStore = (set: Function, get: Function): NetworkStore => ({
  // state
  cluster: Cluster.Devnet,

  // actions
  clusterUrl: () => clusterUrls[get().cluster](),
  explorerUrl: () => {
    const cluster = get().cluster;
    return cluster === LocalCluster.Local
      ? `custom&customUrl=http%3A%2F%2Flocalhost%3A8899`
      : cluster;
  },
  setCluster: (cluster: Cluster): Dispatch<SetStateAction<{ cluster: Cluster }>> => {
    get().persistStoreToLocalStorage();
    return set({ cluster });
  },
});

export default useNetworkStore;
