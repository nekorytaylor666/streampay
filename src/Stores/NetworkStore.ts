import { clusterApiUrl } from '@solana/web3.js';

export const CLUSTER_LOCAL = 'local';
export const CLUSTER_DEVNET = 'devnet';
export const CLUSTER_TESTNET = 'testnet';
export const CLUSTER_MAINNET = 'mainnet-beta';

const clusterUrls: { [s: string]: () => string } = {
  [CLUSTER_LOCAL]: () => 'http://localhost:8899', //http://127.0.0.1:8899",
  [CLUSTER_DEVNET]: () => clusterApiUrl(CLUSTER_DEVNET),
  [CLUSTER_TESTNET]: () => clusterApiUrl(CLUSTER_TESTNET),
  [CLUSTER_MAINNET]: () => clusterApiUrl(CLUSTER_MAINNET),
};

const programIds: { [s: string]: () => string | null } = {
  [CLUSTER_LOCAL]: () => 'BBbP5MHFSfcoygAtaPpWUmiEdb7yW2mZHDzg2MTnAsVa', // prompt("Program ID?"),
  [CLUSTER_DEVNET]: () => 'BBbP5MHFSfcoygAtaPpWUmiEdb7yW2mZHDzg2MTnAsVa',
  [CLUSTER_TESTNET]: () => '8tQZMH3NWtoiNDYwTpSZ3GVrRKbMVi2S5Xjy6UcbG5rR',
  [CLUSTER_MAINNET]: () => null, // TODO: publish the program to mainnet
};

const useNetworkStore = (set: Function, get: Function) => ({
  // state
  cluster: CLUSTER_DEVNET as string, //todo set mainnet
  programId: programIds[CLUSTER_DEVNET]() as string,

  // actions
  clusterUrl: () => clusterUrls[get().cluster](),
  explorerUrl: () => {
    const cluster = get().cluster;
    return cluster === CLUSTER_LOCAL ? `custom&customUrl=http%3A%2F%2Flocalhost%3A8899` : cluster;
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
});

export default useNetworkStore;
