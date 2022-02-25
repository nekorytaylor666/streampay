import type { Wallet } from "@solana/wallet-adapter-base";
import { WalletNotReadyError } from "@solana/wallet-adapter-base";
import { toast } from "react-toastify";

import { trackEvent } from "../utils/marketing_helpers";
import { EVENT_CATEGORY, EVENT_ACTION, DATA_LAYER_VARIABLE } from "../constants";
import { WalletAdapter } from "../types";

interface WalletState {
  walletType: Wallet | null;
  wallet: WalletAdapter | null;
  setWalletType: (walletType: Wallet | null) => Promise<void>;
  disconnectWallet: () => void;
}

type WalletStore = (set: Function, get: Function) => WalletState;

// const getConnection = (clusterUrl: string | null) => {
//   if (!clusterUrl) {
//     return null;
//   }

//   const key = clusterUrl;
//   if (!memoizedConnection[key]) {
//     memoizedConnection = {
//       [key]: new Connection(clusterUrl, { commitment: "confirmed", disableRetryOnRateLimit: true }),
//     };
//   }

//   return memoizedConnection[key];
// };

const walletStore: WalletStore = (set, get) => ({
  // state
  walletType: null,
  wallet: null,

  // actions
  setWalletType: async (walletType) => {
    const state = get();
    if (walletType?.name === state.walletType?.name) return;

    const walletAdapter = walletType?.adapter;
    if (walletAdapter) {
      walletAdapter.on("connect", async () => {
        set({ walletType, wallet: walletAdapter });
        // state.persistStoreToLocalStorage();

        toast.success("Wallet connected!");
        trackEvent(
          EVENT_CATEGORY.WALLET,
          EVENT_ACTION.CONNECT,
          walletAdapter.publicKey?.toBase58() || "",
          0,
          {
            [DATA_LAYER_VARIABLE.WALLET_TYPE]: walletType?.name,
          }
        );
      });
      walletAdapter.on("disconnect", () => {
        set({ walletType: null, wallet: null });
        // state.persistStoreToLocalStorage();
        toast.info("Disconnected from wallet");
      });
      walletAdapter.connect().catch((e: Error) => {
        set({ walletType: null, wallet: null });
        toast.error(
          e instanceof WalletNotReadyError
            ? "Wallet extension not installed." //todo: add link to install
            : "Wallet not connected, try again."
        );
      });
    } else {
      set({ walletType, wallet: walletAdapter });
    }
  },
  disconnectWallet: () => {
    const { wallet, walletType, setWalletType } = get();
    trackEvent(EVENT_CATEGORY.WALLET, EVENT_ACTION.DISCONNECT, wallet.publicKey.toBase58(), 0, {
      [DATA_LAYER_VARIABLE.WALLET_TYPE]: walletType?.name,
    });
    wallet?.disconnect();
    setWalletType(null);
  },
});

export default walletStore;
