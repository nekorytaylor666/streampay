import { FC } from "react";

import { Cluster } from "@streamflow/stream";

import Logo from "./Logo";
import logo from "../assets/icons/logo.png";
import { Nav, Toggle } from ".";
import useStore from "../stores";

const Header: FC = () => {
  const cluster = useStore((state) => state.cluster);
  const setCluster = useStore((state) => state.setCluster);
  const wallet = useStore((state) => state.wallet);

  const isMainnet = cluster === Cluster.Mainnet;
  const toggleCluster = () => setCluster(isMainnet ? Cluster.Devnet : Cluster.Mainnet);

  return (
    <div className="flex sticky top-0 w-screen bg-dark justify-between items-center p-4 sm:p-6 border-b border-gray-dark z-10">
      <Logo src={logo} classes="w-44" />
      {wallet?.connected && <Nav classes="hidden lg:block" />}
      <div className="flex justify-end items-center w-44">
        <Toggle
          checked={!isMainnet}
          customChange={toggleCluster}
          labelLeft="mainnet"
          labelRight="devnet"
          classes="hidden sm:flex mr-2"
        />
      </div>
      <Toggle
        checked={!isMainnet}
        customChange={toggleCluster}
        labelLeft="mainnet"
        labelRight="devnet"
        classes="flex sm:hidden justify-end mt-1"
      />
    </div>
  );
};

export default Header;
