import { useState, forwardRef, useImperativeHandle, useMemo, MouseEvent } from "react";

import {
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWebWallet,
  getSolflareWallet,
  getSolletWallet,
} from "@solana/wallet-adapter-wallets";
import type { Wallet } from "@solana/wallet-adapter-base";
import cx from "classnames";
import { Cluster } from "@streamflow/stream";

import useStore, { StoreType } from "../stores";
import { ModalRef } from ".";

const storeGetter = ({ cluster, setWalletType }: StoreType) => ({
  setWalletType,
  cluster,
});

const WalletPicker = forwardRef<ModalRef>(({}, ref) => {
  const { cluster, setWalletType } = useStore(storeGetter);
  const [visible, setVisible] = useState(false);

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

  useImperativeHandle(ref, () => ({
    show: () =>
      new Promise(() => {
        setVisible(true);
      }),
  }));

  const onConfirm = (wallet: Wallet) => {
    setVisible(false);
    setWalletType(wallet);
  };

  const onCancel = () => {
    setVisible(false);
  };

  return (
    <div
      className={cx(
        "h-screen fixed z-10 w-screen backdrop-filter backdrop-blur-xs bg-opacity-70 bg-dark top-0 left-0 flex justify-center items-center",
        visible ? "block" : "hidden"
      )}
      onClick={onCancel}
    >
      <div
        className="w-11/12 sm:w-96 xl:w-1/3 2xl:w-1/4 px-4 pb-1 pt-5 sm:px-5 rounded-md bg-gradient-to-br to-ternary from-main flex flex-col"
        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        {walletTypes.map((wallet) => (
          <button
            className="border-primary border cursor-pointer mb-4 p-4 text-primary rounded-md"
            onClick={() => onConfirm(wallet)}
          >
            <img className="h-8 inline-block mr-4" src={wallet.icon}></img>
            <p className="inline-block text-base">{wallet.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
});

export default WalletPicker;
