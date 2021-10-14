import { clusterApiUrl, Connection } from "@solana/web3.js";
import { toast } from "react-toastify";
import { WalletNotFoundError } from "@solana/wallet-adapter-base";
import Wallet from "@project-serum/sol-wallet-adapter";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { WalletType } from "../types";
import { CLUSTER_MAINNET } from "./NetworkStore";
import { NATIVE_MINT, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { createMintAndVault, Provider } from "@project-serum/common";
import { BN } from "@project-serum/anchor";
import { AIRDROP_AMOUNT } from "../constants";

let memoizedConnection: { [s: string]: Connection } = {};

const getConnection = (clusterUrl: string | null) => {
  if (!clusterUrl) {
    return null;
  }
  const key = clusterUrl;
  if (!memoizedConnection[key]) {
    memoizedConnection = { [key]: new Connection(clusterUrl) };
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
        state
          .connection()
          .getBalance(wallet.publicKey)
          .then(async (result: number) => {
            state.setBalance(result / LAMPORTS_PER_SOL);
            console.log(wallet);
            console.log(wallet.publicKey);
            //let accs = await getConnection(clusterApiUrl(CLUSTER_MAINNET))?.getTokenAccountsByOwner(wallet.publicKey, {programId: TOKEN_PROGRAM_ID});
            // @ts-ignore
            // for( let i = 0; i < 50; i++) {
            //       // @ts-ignore
            //       console.log("https://explorer.solana.com/address/" + accs.value[i].pubkey.toBase58());
            //     }
          });
        const provider = new Provider(
          getConnection(get().clusterUrl()) as Connection,
          wallet,
          {}
        );
        // await getConnection(get().clusterUrl())?.requestAirdrop(
        //   wallet.publicKey,
        //   AIRDROP_AMOUNT * LAMPORTS_PER_SOL
        // );
        // const [mint, senderTokens] = await createMintAndVault(
        //   provider,
        //   new BN(100_000_000_000),
        //   wallet.publicKey,
        //   4
        // );

        toast.success("Connected to wallet!");
      });
      wallet.on("disconnect", () => {
        set({ walletType: null, wallet: null });
        toast.info("Disconnected from wallet");
      });
      wallet.connect().catch((e: Error) => {
        set({ walletType: null, wallet: null });
        toast.error(
          e instanceof WalletNotFoundError
            ? "Wallet extension not installed"
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
