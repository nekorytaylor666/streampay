//import cx from "classnames";

import WalletPickerHome from "../components/WalletPickerHome";
//import WalletPicker from "../components/WalletPicker";
//import useStore, { StoreType } from "../stores";

/*const storeGetter = ({ cluster, wallet, setCluster }: StoreType) => ({
  cluster,
  wallet,
  setCluster,
});
*/

const HomePage = () => {
  //const { wallet } = useStore(storeGetter);

  return (
    <div className="home px-3.5 sm:px-5">
      <h1 className="text-center text-white text-2xl font-bold mb-4 head-title">
        Connect Crypto Wallet
      </h1>
      <p className="text-center text-sf-gray mb-8">
        Welcome to Streamflow Finance! Connect your crypto wallet to start using the app.
      </p>
      <WalletPickerHome />
    </div>
  );
};

export default HomePage;
