import { FC } from "react";

import { Cluster } from "@streamflow/stream";

import Logo from "./Logo";
import logo from "../assets/icons/logo.png";
import { IcnMenu, IcnClose } from "../assets/icons";
import { Airdrop, Nav } from ".";
import useStore from "../stores";
import WalletMenu from "./WalletMenu";

interface HeaderProps {
  toggleVerticalNav: () => void;
  isVerticalNavOpened: boolean;
}

const Header: FC<HeaderProps> = ({ toggleVerticalNav, isVerticalNavOpened }) => {
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
    <div className="flex sticky top-0 w-screen bg-dark items-center p-4 sm:p-6 border-b border-gray-dark justify-between sm:justify-start z-50">
      <Logo src={logo} wallet={wallet} classes={`sm:w-60 ${!wallet?.connected && "flex-grow"}`} />
      {wallet?.connected && <Nav classes="hidden sm:flex-grow lg:block" />}
      {!isMainnet && <Airdrop classes="hidden sm:block" />}
      <div className="flex justify-end w-50 h-10">
        {wallet?.connected && <WalletMenu clusterChange={toggleCluster} />}
      </div>
      {wallet?.connected && (
        <button onClick={toggleVerticalNav}>
          {isVerticalNavOpened ? (
            <IcnMenu
              fill="rgb(113, 130, 152)"
              classes="sm:hidden bg-gray-dark w-10 h-10 rounded-lg"
            />
          ) : (
            <IcnClose
              fill="rgb(113, 130, 152)"
              classes="sm:hidden bg-gray-dark w-10 h-10 rounded-lg"
            />
          )}
        </button>
      )}
    </div>
  );
};

export default Header;
