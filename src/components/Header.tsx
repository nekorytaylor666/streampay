import cx from "classnames";
import { Cluster } from "@streamflow/stream";

import { Logo, Nav, Toggle, WalletPickerCTA } from ".";
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
        "items-center py-3 lg:mb-16 sticky top-0 bg-opacity-90 z-10 mb-2",
        isMainnet ? "bg-main" : "bg-sandbox"
      )}
    >
      <div className="flex justify-between items-center">
        <Logo src={logo} classes="w-44" />
        <Nav classes="hidden lg:block" />
        <div className="flex justify-end items-center w-44">
          <Toggle
            checked={!isMainnet}
            customChange={toggleCluster}
            labelLeft="mainnet"
            labelRight="devnet"
            classes="hidden sm:flex mr-2"
          />
          <WalletPickerCTA
            title="Connect"
            classes={cx("px-3 py-1 sm:px-6 sm:py-2", {
              hidden: wallet?.connected,
            })}
          />
        </div>
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
