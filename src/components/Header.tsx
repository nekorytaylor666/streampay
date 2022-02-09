import cx from "classnames";
import { Cluster } from "@streamflow/stream";

import { Logo, Nav, WalletPicker, Toggle } from ".";
import logo from "../assets/icons/logo.png";
import useStore, { StoreType } from "../stores";

const storeGetter = ({ cluster, wallet, setCluster }: StoreType) => ({
  cluster,
  wallet,
  setCluster,
});

const Header = () => {
  const { wallet, cluster, setCluster } = useStore(storeGetter);
  const isMainnet = cluster === Cluster.Mainnet;

  const toggleCluster = () => setCluster(isMainnet ? Cluster.Devnet : Cluster.Mainnet);

  return (
    <div
      className={cx(
        "items-center px-3.5 sm:px-5 py-5 lg:mb-16 sticky top-0 bg-opacity-90 z-10 mb-2 border-b border-black",
        isMainnet ? "bg-main" : "bg-sandbox"
      )}
    >
      <div className="flex justify-between items-center">
        <Logo src={logo} classes="w-44" />
        <Nav classes="hidden" />
        {/* Deleted Nav class lg:block*/}
        <div className="flex justify-end items-center w-44">
          <Toggle
            enabled={isMainnet}
            setEnabled={toggleCluster}
            labelLeft="devnet"
            labelRight="mainnet"
            classes="hidden mr-2"
          />
          {/* Deleted Toggle class sm:flex*/}
          <WalletPicker
            title="Connect"
            classes={cx("hidden px-3 py-1 sm:px-6 sm:py-2", {
              hidden: wallet?.connected,
            })}
          />
        </div>
      </div>
      <Toggle
        enabled={isMainnet}
        setEnabled={toggleCluster}
        labelLeft="devnet"
        labelRight="mainnet"
        classes="flex sm:hidden justify-end mt-1"
      />
    </div>
  );
};

export default Header;
