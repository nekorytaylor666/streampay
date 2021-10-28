import { Connection } from "@solana/web3.js";
import { toast } from "react-toastify";
import { WalletNotFoundError } from "@solana/wallet-adapter-base";
import Wallet from "@project-serum/sol-wallet-adapter";
import { WalletType } from "../types";

let memoizedConnection: { [s: string]: Connection } = {};

const getConnection = (clusterUrl: string | null) => {
  if (!clusterUrl) {
    return null;
  }
  const key = clusterUrl;
  if (!memoizedConnection[key]) {
    memoizedConnection = { [key]: new Connection(clusterUrl, "confirmed") };
  }
  return memoizedConnection[key];
};

const walletStore = (set: Function, get: Function) => ({
  // state
  walletType: null as WalletType | null,
  wallet: null as Wallet | null,
  connection: () => getConnection(get().clusterUrl()),

  // actions
  setWalletType: async (walletType: WalletType | null) => {
    const state = get();
    if (walletType?.name === state.walletType?.name) {
      return;
    }
    state.persistStoreToLocalStorage();

    const wallet = walletType?.adapter();
    if (wallet) {
      wallet.on("connect", async () => {
        set({ walletType, wallet });
        toast.success("Wallet connected!");
      });
      wallet.on("disconnect", () => {
        set({ walletType: null, wallet: null });
        toast.info("Disconnected from wallet");
      });
      wallet.connect().catch((e: Error) => {
        set({ walletType: null, wallet: null });
        toast.error(
          e instanceof WalletNotFoundError
            ? "Wallet extension not installed" //todo: add link to install
            : "Wallet not connected, try again"
        );
      });
    } else {
      set({ walletType, wallet });
    }
  },
  connectWallet: () =>
    get()
      .wallet?.connect()
      .catch((e: Error) => {
        get().setWalletType(null);
        toast.error(
          e instanceof WalletNotFoundError
            ? "Wallet extension not installed"
            : "Wallet not connected, please try again"
        );
      }),
  disconnectWallet: () => {
    const state = get();
    // state.persistStoreToLocalStorage()
    state.wallet?.disconnect();
  },
});

export default walletStore;
