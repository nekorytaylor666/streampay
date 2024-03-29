import create, { SetState, GetState } from "zustand";
import { devtools } from "zustand/middleware";

import useNetworkStore from "./NetworkStore";
import useStreamStore from "./StreamsStore";
import useTokenStore from "./TokenStore";
import useWalletStore from "./WalletStore";

const persistStoreToLocalStorage = () => {
  const state = useStore.getState() as StoreType;
  localStorage.cluster = state.cluster;
  localStorage.walletType = state.walletType?.name;

  const existingStreams = JSON.parse(localStorage.streams || "{}");
  const walletKey = state.wallet?.publicKey;
  if (walletKey) {
    // put current streams in localStorage without overwriting
    // the exiting ones in other wallets or clusters
    // localStorage.streams[state.cluster][walletKey] = state.streams
    const mergedStreams = {
      ...existingStreams,
      [state.cluster]: {
        ...existingStreams[state.cluster],
        [walletKey.toBase58()]: state.streams,
      },
    };
    localStorage.streams = JSON.stringify(mergedStreams);
  }
};

export type StoreType = ReturnType<typeof useTokenStore> &
  ReturnType<typeof useNetworkStore> &
  ReturnType<typeof useStreamStore> &
  ReturnType<typeof useWalletStore> & {
    persistStoreToLocalStorage: () => void;
  };

const useStore = create<StoreType>(
  devtools((set: SetState<StoreType>, get: GetState<StoreType>) => ({
    ...useTokenStore(set),
    ...useNetworkStore(set, get),
    ...useStreamStore(set, get),
    ...useWalletStore(set, get),
    persistStoreToLocalStorage,
  }))
);

window.addEventListener("beforeunload", persistStoreToLocalStorage);

export default useStore;
