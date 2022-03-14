import WalletPicker from "../components/WalletPicker";

const HomePage: React.FC = () => (
  <div className="px-4 sm:px-6 pt-10 pb-2 sm:pt-20 flex flex-col items-center">
    <h1 className="text-white font-bold mb-4">Connect Crypto Wallet</h1>
    <h3 className="text-gray-light mb-8 text-center">
      Welcome to Streamflow Finance! Connect your crypto wallet to start using the app.
    </h3>
    <WalletPicker />
  </div>
);

export default HomePage;
