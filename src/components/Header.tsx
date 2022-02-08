import cx from "classnames";

import { Logo, Nav, WalletPicker } from ".";
import logo from "../assets/icons/logo.png";
import useStore, { StoreType } from "../stores";

const storeGetter = ({ cluster, wallet, setCluster }: StoreType) => ({
  cluster,
  wallet,
  setCluster,
});

const Header = () => {
  const { wallet } = useStore(storeGetter);

  return (
    <div className="items-center py-3 lg:mb-16 sticky top-0 bg-gray-900 bg-opacity-90 z-10 mb-2">
      <div className="flex justify-between items-center">
        <Logo src={logo} classes="w-44" />
        <Nav classes="hidden lg:block" />
        <div className="flex justify-end items-center w-44">
          <WalletPicker
            title="Connect"
            classes={cx("px-3 py-1 sm:px-6 sm:py-2", {
              hidden: wallet?.connected,
            })}
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
