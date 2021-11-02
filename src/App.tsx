import { Dispatch, SetStateAction, useState } from "react";

import "react-toastify/dist/ReactToastify.css";
import cx from "classnames";
import { ToastContainer } from "react-toastify";

import { WalletPicker, Footer, Logo, Toggle } from "./components";
import { PRODUCT_VESTING, products } from "./constants";
import { useFormContext } from "./contexts/FormContext";
import logo from "./logo.png";
import { Products } from "./pages";
import useStore, { StoreType } from "./stores";
import { CLUSTER_MAINNET, CLUSTER_DEVNET } from "./stores/NetworkStore";

const storeGetter = (state: StoreType) => ({
  cluster: state.cluster,
  setCluster: state.setCluster,
  wallet: state.wallet,
});

function App() {
  const { setAdvanced } = useFormContext();
  const [product, setProduct] = useState(PRODUCT_VESTING);

  const { cluster, setCluster, wallet } = useStore(storeGetter);

  const toggleCluster = (
    isMainnet: boolean
  ): Dispatch<SetStateAction<{ cluster: string; programId: string }>> => {
    return isMainnet ? setCluster(CLUSTER_MAINNET) : setCluster(CLUSTER_DEVNET);
  };

  const renderProducts = () =>
    products.map((prod) => (
      <span
        key={prod}
        onClick={() => {
          setAdvanced(prod === PRODUCT_VESTING);
          setProduct(prod);
        }}
        className={`cursor-pointer text-sm sm:text-base capitalize flex-1 sm:inline-block mx-3 sm:mx-5
                              ${prod === product ? "text-white" : "text-gray-400"}`}
      >
        {prod}
      </span>
    ));

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-blend-darken flex-grow px-3.5 sm:px-5">
        <div className="flex justify-between items-center py-4 lg:mb-20 sticky top-0 bg-gray-900 bg-opacity-90 z-10">
          <Logo src={logo} />
          <div className="hidden lg:block text-center text-white flex">{renderProducts()}</div>
          <div className="flex items-center">
            <Toggle
              enabled={cluster === CLUSTER_MAINNET}
              setEnabled={toggleCluster}
              label="devnet"
              classes="hidden sm:flex mr-2"
            />
            <WalletPicker
              title="Connect"
              classes={cx("px-3 py-1 sm:px-6 sm:py-2 sm:mr-3", {
                hidden: wallet?.connected,
              })}
            />
          </div>
        </div>
        <div className="block lg:hidden text-center text-white flex mb-8 max-w-max mx-auto">
          {renderProducts()}
        </div>
        <Products product={product} />
      </div>
      <ToastContainer hideProgressBar position="bottom-left" limit={5} />
      <Footer />
    </div>
  );
}

export default App;
