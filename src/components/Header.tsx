import { FC } from "react";

import { Cluster } from "@streamflow/stream";

import Logo from "./Logo";
import logo from "../assets/icons/logo.png";
import { Nav } from ".";
import useStore from "../stores";
import WalletMenu from "./WalletMenu";

const Header: FC = () => {
  const cluster = useStore((state) => state.cluster);
  const setCluster = useStore((state) => state.setCluster);
  const wallet = useStore((state) => state.wallet);

  const isMainnet = cluster === Cluster.Mainnet;
  const toggleCluster = () => {
    if (isMainnet) {
      setCluster(Cluster.Devnet);
      document.documentElement.classList.remove("main");
      document.documentElement.classList.add("dev");
    } else {
      setCluster(Cluster.Mainnet);
      document.documentElement.classList.remove("dev");
      document.documentElement.classList.add("main");
    }
  };

  return (
    <div className="flex sticky top-0 w-screen bg-dark items-center p-4 sm:p-6 border-b border-gray-dark z-10">
      <Logo src={logo} classes={`w-60 ${!wallet?.connected && "flex-grow"}`} />
      {wallet?.connected && <Nav classes="hidden lg:block flex-grow" />}
      <div className="flex justify-end w-50">
        {wallet?.connected && <WalletMenu clusterChange={toggleCluster} />}
      </div>
    </div>
  );
};

export default Header;
