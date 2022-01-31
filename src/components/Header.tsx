import cx from "classnames";

import { Logo, Nav, WalletPicker, Toggle } from ".";
import logo from "../assets/icons/logo.png";
import useStore, { StoreType } from "../stores";

const storeGetter = ({ cluster, wallet, setCluster }: StoreType) => ({
  cluster,
  wallet,
  setCluster,
});

const Header = () => {
  const { wallet } = useStore(storeGetter);
  // const isMainnet = cluster === Cluster.Mainnet;

  // const toggleCluster = () => setCluster(isMainnet ? Cluster.Devnet : Cluster.Mainnet);

  return (
    <div className="items-center py-3 lg:mb-16 sticky top-0 bg-gray-900 bg-opacity-90 z-10 mb-2">
      <div className="flex justify-between items-center">
        <Logo src={logo} classes="mr-10 lg:mr-36" />
        <Nav classes="hidden lg:block" />
        <div className="flex items-center">
          <Toggle
            enabled={false}
            setEnabled={() => {}}
            labelLeft="devnet"
            labelRight="mainnet"
            classes="hidden sm:flex mr-2"
            disabled
          />
          <WalletPicker
            title="Connect"
            classes={cx("px-3 py-1 sm:px-6 sm:py-2", {
              hidden: wallet?.connected,
            })}
          />
        </div>
      </div>
      <Toggle
        enabled={false}
        setEnabled={() => {}}
        labelLeft="devnet"
        labelRight="mainnet"
        classes="flex sm:hidden justify-end mt-1"
        disabled
      />
    </div>
  );
};

export default Header;
