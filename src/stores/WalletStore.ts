import Wallet from "@project-serum/sol-wallet-adapter";
import { WalletNotFoundError } from "@solana/wallet-adapter-base";
import { Connection } from "@solana/web3.js";
import { toast } from "react-toastify";

import { WalletType } from "../types";
import { trackEvent } from "../utils/marketing_helpers";
import { EVENT_CATEGORY, EVENT_ACTION, DATA_LAYER_VARIABLE } from "../constants";

interface WalletState {
  walletType: WalletType | null;
  wallet: Wallet | null;
  connection: () => Connection | null;
  setWalletType: (walletType: WalletType | null) => Promise<void>;
  disconnectWallet: () => void;
}

type WalletStore = (set: Function, get: Function) => WalletState;

let memoizedConnection: { [s: string]: Connection } = {};

const getConnection = (clusterUrl: string | null) => {
  if (!clusterUrl) {
    return null;
  }

  const key = clusterUrl;
  if (!memoizedConnection[key]) {
    memoizedConnection = {
      [key]: new Connection(clusterUrl, { commitment: "confirmed", disableRetryOnRateLimit: true }),
    };
  }

  return memoizedConnection[key];
};

const walletStore: WalletStore = (set, get) => ({
  // state
  walletType: null,
  wallet: null,
  connection: () => getConnection(get().clusterUrl()),

  // actions
  setWalletType: async (walletType) => {
    const state = get();
    if (walletType?.name === state.walletType?.name) return;

    const wallet = walletType?.adapter();
    if (wallet) {
      wallet.on("connect", async () => {
        set({ walletType, wallet });
        // state.persistStoreToLocalStorage();
        toast.success("Wallet connected!");
        trackEvent(EVENT_CATEGORY.WALLET, EVENT_ACTION.CONNECT, wallet.publicKey.toBase58(), 0, {
          [DATA_LAYER_VARIABLE.WALLET_TYPE]: walletType?.name,
        });
      });
      wallet.on("disconnect", () => {
        trackEvent(EVENT_CATEGORY.WALLET, EVENT_ACTION.DISCONNECT, "", 0, {
          [DATA_LAYER_VARIABLE.WALLET_TYPE]: walletType?.name,
        });
        set({ walletType: null, wallet: null });
        // state.persistStoreToLocalStorage();
        toast.info("Disconnected from wallet");
      });
      wallet.connect().catch((e: Error) => {
        set({ walletType: null, wallet: null });
        toast.error(
          e instanceof WalletNotFoundError
            ? "Wallet extension not installed." //todo: add link to install
            : "Wallet not connected, try again."
        );
      });
    } else {
      set({ walletType, wallet });
    }
  },
  disconnectWallet: () => {
    const state = get();
    state.wallet?.disconnect();
    state.setWalletType(null);
  },
});

export default walletStore;
