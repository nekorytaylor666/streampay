import { useMemo, useEffect, FC } from "react";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  getPhantomWallet,
  getSolflareWebWallet,
  getSolflareWallet,
  getSolletWallet,
  getSlopeWallet,
} from "@solana/wallet-adapter-wallets";
import swal from "sweetalert";

import useStore, { StoreType } from "../stores";
import { WalletType } from "../types";
import Button from "./Button";

const storeGetter = ({ walletType, setWalletType, cluster }: StoreType) => ({
  walletType,
  setWalletType,
  cluster,
});

const div = document.createElement("div");

const addWalletOption = (walletType: WalletType) => {
  const button = document.createElement("div");
  const p = document.createElement("p");
  const img = document.createElement("img");
  img.src = walletType.icon;
  img.className = "h-8 inline-block mr-4";
  p.innerHTML = walletType.name;
  p.className = "inline-block";
  button.className = "border-primary border cursor-pointer mb-4 p-4 text-primary rounded-md";
  button.onclick = () => {
    if (swal.setActionValue && swal.close) {
      //@ts-ignore
      swal.setActionValue({ cancel: walletType });
      swal.close();
    }
  };
  button.appendChild(img);
  button.appendChild(p);
  div.appendChild(button);
};

const pickWallet = (walletTypes: WalletType[], setWalletType: (value: any) => any) => {
  div.innerHTML = "";
  for (const w of walletTypes) {
    addWalletOption(w);
  }
  swal({
    buttons: {},
    content: { element: div },
    className: "bg-gray-800",
  }).then(setWalletType);
};

let walletInitialized = false;

interface WalletPickerProps {
  classes: string;
  title: string;
}

const WalletPicker: FC<WalletPickerProps> = ({ classes, title }) => {
  const { setWalletType, cluster } = useStore(storeGetter);
  const walletTypes = useMemo(
    () => [
      getPhantomWallet(),
      getSlopeWallet(),
      getSolflareWebWallet({ network: cluster as WalletAdapterNetwork }),
      getSolflareWallet(),
      getSolletWallet({ network: cluster as WalletAdapterNetwork }),
    ],
    [cluster]
  );

  useEffect(() => {
    if (walletInitialized) {
      return;
    }
    walletInitialized = true;

    const type = localStorage.walletType;
    if (type) {
      const restoredWalletType = walletTypes.find((w) => w.name === type);
      if (restoredWalletType) {
        setWalletType(restoredWalletType);
      }
    }
  }, [setWalletType, walletTypes]);

  return (
    <Button primary classes={classes} onClick={() => pickWallet(walletTypes, setWalletType)}>
      {title}
    </Button>
  );
};

export default WalletPicker;
