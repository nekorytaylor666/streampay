import { Dispatch, SetStateAction } from "react";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import cx from "classnames";

import { Nav, WalletPicker, Logo, Toggle } from ".";
import logo from "../assets/icons/logo.png";
import useStore, { StoreType } from "../stores";
import type { Cluster } from "../types";

const storeGetter = ({ cluster, wallet, setCluster }: StoreType) => ({
  cluster,
  wallet,
  setCluster,
});

const Header = () => {
  const { cluster, wallet, setCluster } = useStore(storeGetter);

  const toggleCluster = (
    isMainnet: boolean
  ): Dispatch<SetStateAction<{ cluster: Cluster; programId: string }>> => {
    return isMainnet
      ? setCluster(WalletAdapterNetwork.Mainnet)
      : setCluster(WalletAdapterNetwork.Devnet);
  };

  return (
    <div className="flex justify-between items-center py-4 lg:mb-20 sticky top-0 bg-gray-900 bg-opacity-90 z-10">
      <Logo src={logo} />
      <Nav classes="hidden lg:block" />
      <div className="flex items-center">
        <Toggle
          enabled={cluster === WalletAdapterNetwork.Mainnet}
          setEnabled={toggleCluster}
          label="devnet"
          classes="hidden sm:flex mr-2"
        />
        <WalletPicker
          title="Connect"
          classes={cx("px-3 py-1 sm:px-6 sm:py-2", {
            hidden: wallet?.connected,
          })}
        />
      </div>
    </div>
  );
};

export default Header;
