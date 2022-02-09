import { useMemo, FC } from "react";

import {
  getPhantomWallet,
  getSolflareWebWallet,
  getSolflareWallet,
  getSolletWallet,
  getSlopeWallet,
} from "@solana/wallet-adapter-wallets";
import type { Wallet } from "@solana/wallet-adapter-base";
import swal from "sweetalert";
import { Cluster } from "@streamflow/stream";

import useStore, { StoreType } from "../stores";
import Button from "./Button";

const storeGetter = ({ walletType, setWalletType, cluster }: StoreType) => ({
  walletType,
  setWalletType,
  cluster,
});

const div = document.createElement("div");

const addWalletOption = (walletType: Wallet) => {
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

const pickWallet = (walletTypes: Wallet[], setWalletType: (value: any) => any) => {
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

interface WalletPickerProps {
  classes: string;
  title: string;
}

const WalletPicker: FC<WalletPickerProps> = ({ classes, title }) => {
  const { setWalletType, cluster } = useStore(storeGetter);
  const walletTypes: Wallet[] = useMemo(
    () => [
      getPhantomWallet(),
      getSlopeWallet(),
      getSolflareWebWallet({ network: cluster as Cluster }),
      getSolflareWallet(),
      getSolletWallet({ network: cluster as Cluster }),
    ],
    [cluster]
  );

  return (
    <div className="wallet-list mx-auto font-Inter max-w-400px">
      <Button primary classes={classes} onClick={() => pickWallet(walletTypes, setWalletType)}>
        {title}
      </Button>
      {walletTypes.map(({ name, icon }) => (
        <div
          key={name}
          className="flex cursor-pointer mb-4 p-6 text-primary rounded-2xl bg-black-sidebar hover:bg-blue-primary transition duration-500 ease-in-out"
          onClick={() => {}}
        >
          <img src={icon} className="h-6 inline-block mr-4" />
          <p className="flex items-center text-white font-bold font-Inter">{name}</p>
        </div>
      ))}
    </div>
  );
};

export default WalletPicker;
