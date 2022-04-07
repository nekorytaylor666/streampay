import type { Wallet } from "@solana/wallet-adapter-base";
import { WalletNotReadyError } from "@solana/wallet-adapter-base";
import { toast } from "react-toastify";
import type { History } from "history";
import type { MessageSignerWalletAdapter } from "@solana/wallet-adapter-base";

import { trackEvent } from "../utils/marketing_helpers";
import { EVENT_CATEGORY, EVENT_ACTION, DATA_LAYER_VARIABLE } from "../constants";
import { WalletAdapter } from "../types";
import { MsgToast } from "../components";

interface WalletState {
  walletType: Wallet | null;
  wallet: WalletAdapter | null;
  messageSignerWallet: MessageSignerWalletAdapter | null;
  setWalletType: (walletType: Wallet | null, history: History<unknown>) => Promise<void>;
  disconnectWallet: () => void;
}

type WalletStore = (set: Function, get: Function) => WalletState;

const walletStore: WalletStore = (set, get) => ({
  // state
  walletType: null,
  messageSignerWallet: null,
  wallet: null,

  // actions
  setWalletType: async (walletType, history) => {
    const state = get();
    if (walletType?.name === state.walletType?.name) return;

    const walletAdapter = walletType?.adapter;
    if (walletAdapter) {
      walletAdapter.on("connect", async () => {
        set({ walletType, wallet: walletAdapter, messageSignerWallet: walletAdapter });
        // state.persistStoreToLocalStorage();
        history.push("/new-vesting");
        toast.success(
          <MsgToast
            title="Wallet Connected."
            message="You have successfully connected your wallet."
            type="success"
          />
        );

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
        history.push("./");
        // state.persistStoreToLocalStorage();
        toast.info(
          <MsgToast
            title="Disconnected from wallet."
            message="Please connect your wallet to continue."
            type="info"
          />
        );
      });
      walletAdapter.connect().catch((e: Error) => {
        set({ walletType: null, wallet: null });

        toast.error(
          e instanceof WalletNotReadyError ? (
            <MsgToast
              title="Wallet extension not installed."
              message="Please install wallet to continue."
              type="error"
            /> //todo: add link to install,
          ) : (
            <MsgToast title="Wallet not connected" message="Please try again." type="error" /> //not connected
          )
          // e instanceof WalletNotReadyError
          //   ? "Wallet extension not installed." //todo: add link to install
          //   : "Wallet not connected, try again."
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
