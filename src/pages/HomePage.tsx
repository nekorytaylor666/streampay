import {} from "react";

import cx from "classnames";

//import WalletPicker from "../components/WalletPicker"
import WalletPickerHome from "../components/WalletPickerHome";
import useStore, { StoreType } from "../stores";

const storeGetter = ({ cluster, wallet, setCluster }: StoreType) => ({
  cluster,
  wallet,
  setCluster,
});

const HomePage = () => {
  const { wallet } = useStore(storeGetter);

  return (
    <div className="home px-3.5 sm:px-5">
      <h1 className="text-center text-white text-2xl font-bold mb-4 head-title">
        Connect Crypto Wallet
      </h1>
      <p className="text-center text-sf-gray mb-8">
        Welcome to Streamflow Finance! Connect your crypto wallet to start using the app.{" "}
      </p>
      <WalletPickerHome
        title="Connect"
        classes={cx("px-3 py-1 sm:px-6 sm:py-2 hidden", {
          hidden: wallet?.connected,
        })}
      />
    </div>
  );
};

export default HomePage;
