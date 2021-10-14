import { ToastContainer } from "react-toastify";
import { Products } from "./Pages";
import { Footer, Logo } from "./Components";
import logo from "./logo.png";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { useFormContext } from "./Contexts/FormContext";
import { PRODUCT_VESTING, products } from "./constants";

function App() {
  const { setAdvanced } = useFormContext();
  const [product, setProduct] = useState(PRODUCT_VESTING);
  return (
    <div>
      <div className={"mx-auto bg-blend-darken px-4 my-4"}>
        <div className="text-center text-white mb-6 flex sm:block">
          {products.map((prod) => (
            <span
              key={prod}
              onClick={() => {
                setAdvanced(prod === PRODUCT_VESTING);
                setProduct(prod);
              }}
              className={`cursor-pointer capitalize flex-1 sm:inline-block sm:mx-4
                              ${
                                prod === product
                                  ? "text-white"
                                  : "text-gray-400"
                              }`}
            >
              {prod}
            </span>
          ))}
        </div>
        <Logo src={logo} />
        <Products product={product} />
      </div>
      <ToastContainer hideProgressBar position="bottom-left" limit={5} />
      <Footer />
    </div>
  );
}

export default App;
