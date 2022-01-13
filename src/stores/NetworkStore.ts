import { Dispatch, SetStateAction } from "react";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

import type { Cluster } from "../types";

export const CLUSTER_LOCAL = "local";
export const CLUSTER_DEVNET = "devnet";
export const CLUSTER_TESTNET = "testnet";
export const CLUSTER_MAINNET = "mainnet-beta";

const clusterUrls: { [s: string]: () => string } = {
  [CLUSTER_LOCAL]: () => "http://localhost:8899", //http://127.0.0.1:8899",
  [CLUSTER_DEVNET]: () => clusterApiUrl(CLUSTER_DEVNET),
  [CLUSTER_TESTNET]: () => clusterApiUrl(CLUSTER_TESTNET),
  [CLUSTER_MAINNET]: () => clusterApiUrl(CLUSTER_MAINNET),
};

const useNetworkStore = (set: Function, get: Function) => ({
  // state
  cluster: WalletAdapterNetwork.Devnet as Cluster,

  // actions
  clusterUrl: () => clusterUrls[get().cluster](),
  explorerUrl: () => {
    const cluster = get().cluster;
    return cluster === CLUSTER_LOCAL ? `custom&customUrl=http%3A%2F%2Flocalhost%3A8899` : cluster;
  },
  setCluster: (cluster: Cluster): Dispatch<SetStateAction<{ cluster: Cluster }>> => {
    get().persistStoreToLocalStorage();
    return set({ cluster });
  },
});

export default useNetworkStore;
