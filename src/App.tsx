import { ToastContainer } from "react-toastify";
import { Products } from "./Pages";
import { Footer, Logo } from "./Components";
import logo from "./logo.png";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { useFormContext } from "./Contexts/FormContext";
import { PRODUCT_STREAMS, PRODUCT_VESTING, products } from "./constants";

function App() {
  const { setVesting } = useFormContext();
  const [product, setProduct] = useState(PRODUCT_STREAMS);
  return (
    <div>
      <div className={"mx-auto bg-blend-darken px-4 my-4"}>
        <div className="text-center text-white mb-6">
          {products.map((prod) => (
            <span
              key={prod}
              onClick={() => {
                setVesting(prod === PRODUCT_VESTING);
                setProduct(prod);
              }}
              className={`cursor-pointer capitalize inline-block mx-4 
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
