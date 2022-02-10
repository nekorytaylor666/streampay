import { useMemo, MouseEvent } from "react";

import {
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWebWallet,
  getSolflareWallet,
  getSolletWallet,
} from "@solana/wallet-adapter-wallets";
import type { Wallet } from "@solana/wallet-adapter-base";
import { Cluster } from "@streamflow/stream";

import useStore, { StoreType } from "../stores";

const storeGetter = ({ cluster, setWalletType }: StoreType) => ({
  setWalletType,
  cluster,
});

const WalletPickerHome = () => {
  const { cluster, setWalletType } = useStore(storeGetter);

  const walletTypes = useMemo(
    () => [
      getPhantomWallet(),
      getSlopeWallet(),
      getSolflareWebWallet({ network: cluster as Cluster }),
      getSolflareWallet(),
      getSolletWallet({ network: cluster as Cluster }),
    ],
    [cluster]
  );

  const onConfirm = (wallet: Wallet) => {
    //setVisible(false);
    setWalletType(wallet);
  };

  return (
    <div
      className="wallet-list mx-auto max-w-400px"
      onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
    >
      {walletTypes.map((wallet) => (
        <button
          className="flex cursor-pointer w-full mb-4 p-6 text-primary rounded-2xl bg-black-sidebar hover:bg-blue-primary transition duration-500 ease-in-out"
          onClick={() => onConfirm(wallet)}
        >
          <img className="h-6 inline-block mr-4" src={wallet.icon}></img>
          <p className="flex items-center text-white font-bold">{wallet.name}</p>
        </button>
      ))}
    </div>
  );
};

export default WalletPickerHome;
