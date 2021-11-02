import useStore, { StoreType } from "../stores";
import Dropdown from "./Dropdown";

const storeGetter = (state: StoreType) => ({
  cluster: state.cluster,
  connection: state.connection(),
  wallet: state.wallet,
  myTokenAccounts: state.myTokenAccounts,
  token: state.token,
  setToken: state.setToken,
});

const SelectToken = () => {
  const { token, setToken, myTokenAccounts, wallet } = useStore(storeGetter);
  let select;

  if (!wallet?.publicKey) {
    select = <div className="pt-2">Please connect.</div>;
  } else if (!token || Object.entries(token).length === 0) {
    select = <div className="pt-2">No SPL tokens available. :(</div>;
  } else {
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
    select = (
      <Dropdown
        value={dropdownValue}
        textValue={token.info.symbol}
        options={Object.values(myTokenAccounts)} //Token[]
        generateOption={(token) => `${token.info.symbol}`}
        generateKey={(token) => token.info.address}
        onSelect={(token) => setToken(token)}
      />
    );
  }
  return (
    <div className="col-span-2 sm:col-span-1 text-white">
      <label htmlFor="token" className="block font-medium text-gray-100">
        Token
      </label>
      {select}
    </div>
  );
};

export default SelectToken;
