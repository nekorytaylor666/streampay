import { useMemo, MouseEvent, FC, useEffect, useState } from "react";

import { useHistory } from "react-router-dom";
import {
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWebWallet,
  getSolflareWallet,
  getSolletWallet,
} from "@solana/wallet-adapter-wallets";
import type { Wallet, WalletName } from "@solana/wallet-adapter-base";
import { Cluster } from "@streamflow/stream";

import useStore, { StoreType } from "../stores";

const storeGetter = ({ cluster, setWalletType }: StoreType) => ({
  setWalletType,
  cluster,
});

const WalletPicker: FC = () => {
  const history = useHistory();
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

  const defaultIsInstalled: { [key: WalletName]: boolean } = walletTypes.reduce(
    (acc, wallet) => ({ ...acc, [wallet.name]: false }),
    {}
  );

  const [isWalletInstalled, setIsWalletInstalled] = useState(defaultIsInstalled);

  const onConfirm = (wallet: Wallet) => {
    setWalletType(wallet, history);
  };

  useEffect(() => {
    (async () => {
      const isInstalled: { [key: WalletName]: boolean } = await walletTypes.reduce(
        async (acc, wallet) => {
          const isReady = await wallet.adapter.ready();
          return { ...acc, [wallet.name]: isReady };
        },
        {}
      );
      return setIsWalletInstalled(isInstalled);
    })();
  }, [walletTypes]);

  return (
    <div
      className="w-full sm:w-100"
      onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
    >
      {walletTypes.map((wallet) => (
        <button
          className="flex cursor-pointer w-full mb-4 p-6 text-white rounded-2xl bg-gray-dark hover:bg-blue transition duration-300 ease-in-out"
          onClick={() => onConfirm(wallet)}
        >
          <img className="h-6 inline-block mr-4" src={wallet.icon}></img>
          <p className="text-white font-bold flex-grow text-left">{wallet.name}</p>

          {isWalletInstalled[wallet.name] && <p className="text-gray text-p2">Installed</p>}
        </button>
      ))}
    </div>
  );
};

export default WalletPicker;
