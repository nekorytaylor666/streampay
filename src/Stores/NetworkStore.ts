import { clusterApiUrl } from "@solana/web3.js";

export const CLUSTER_LOCAL = "local";
export const CLUSTER_DEVNET = "devnet";
export const CLUSTER_TESTNET = "testnet";
export const CLUSTER_MAINNET = "mainnet-beta";

const clusterUrls: { [s: string]: () => string } = {
  [CLUSTER_LOCAL]: () => "http://127.0.0.1:8899",
  [CLUSTER_DEVNET]: () => clusterApiUrl(CLUSTER_DEVNET),
  [CLUSTER_TESTNET]: () => clusterApiUrl(CLUSTER_TESTNET),
  [CLUSTER_MAINNET]: () => clusterApiUrl(CLUSTER_MAINNET),
};

const programIds: { [s: string]: () => string | null } = {
  [CLUSTER_LOCAL]: () => prompt("Program ID?"),
  [CLUSTER_DEVNET]: () => "8tQZMH3NWtoiNDYwTpSZ3GVrRKbMVi2S5Xjy6UcbG5rR",
  [CLUSTER_TESTNET]: () => "8tQZMH3NWtoiNDYwTpSZ3GVrRKbMVi2S5Xjy6UcbG5rR",
  [CLUSTER_MAINNET]: () => null, // TODO: publish the program to mainnet
};

const useNetworkStore = (set: Function, get: Function) => ({
  // state
  cluster: (localStorage.cluster || CLUSTER_DEVNET) as string,
  programId: programIds[localStorage.cluster || CLUSTER_DEVNET]() as string,
  tokenAccounts: {} as { [key: string]: string },

  // actions
  clusterUrl: () => clusterUrls[get().cluster](),
  explorerUrl: () => {
    const cluster = get().cluster;
    return cluster === CLUSTER_LOCAL
      ? `custom&customUrl=${encodeURIComponent(get().clusterUrl)}`
      : cluster;
  },
  setCluster: (cluster: string) => {
    get().persistStoreToLocalStorage();
    const programId = programIds[cluster]();
    if (programId) {
      set({ cluster, programId });
    } else {
      set({ cluster: CLUSTER_DEVNET, programId: programIds[CLUSTER_DEVNET]() });
    }
  },
  setTokenAccounts: (tokenAccounts: { [key: string]: string }) =>
    set({ tokenAccounts }),
});

export default useNetworkStore;
