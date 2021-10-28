import useStore, { StoreType } from "../Stores";
import Dropdown from "./Dropdown";

const storeGetter = (state: StoreType) => ({
  cluster: state.cluster,
  connection: state.connection(),
  wallet: state.wallet,
  // refreshTokenAccounts: state.refreshTokenAccounts,
  // tokenAccounts: state.tokenAccounts,
  setBalance: state.setBalance,
  myTokenAccounts: state.myTokenAccounts,
  token: state.token,
  setToken: state.setToken,
});

export default function SelectToken() {
  const { token, setToken, myTokenAccounts } = useStore(storeGetter);
  if (!token || Object.entries(token).length === 0) {
    return null;
  }
  console.log("token", token);
  const icon = (
    <div
      className="bg-no-repeat bg-center bg-contain w-4 mr-2 inline-block"
      style={{
        backgroundImage: `url('${token.info.logoURI}')`,
      }}
    />
  );
  const dropdownValue = (
    <div className="flex">
      {token.info.logoURI && icon}
      <span className="flex-1">{token.info.symbol}</span>
    </div>
  );
  return (
    <div className="col-span-2 sm:col-span-1">
      <label htmlFor="token" className="block font-medium text-gray-100">
        Token
      </label>
      <Dropdown
        value={dropdownValue}
        textValue={token.info.symbol}
        options={Object.values(myTokenAccounts)} //Token[]
        generateOption={(token) => `${token.info.symbol}`}
        generateKey={(token) => token.info.address}
        onSelect={(token) => setToken(token)}
      />
    </div>
  );
}
