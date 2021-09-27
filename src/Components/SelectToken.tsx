import { useEffect, useState } from "react";
import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";
import useStore, { StoreType } from "../Stores";
import Dropdown from "./Dropdown";

const storeGetter = (state: StoreType) => ({
  cluster: state.cluster,
});

export default function SelectToken({
  token,
  setToken,
}: {
  token: TokenInfo | null;
  setToken: (token: TokenInfo) => void;
}) {
  const { cluster } = useStore(storeGetter);
  const [tokenArray, setTokenArray] = useState<TokenInfo[]>([]);

  useEffect(() => {
    new TokenListProvider().resolve().then((tokens) => {
      const tokenList = tokens.filterByClusterSlug(cluster).getList();
      setTokenArray(tokenList);
      const solTokenInfo =
        tokenList.find((i) => i.symbol === "SOL") || tokenList[0];
      if (solTokenInfo) {
        setToken(solTokenInfo);
      }
    });
  }, [setToken, setTokenArray, cluster]);

  if (!token) {
    return null;
  }
  const icon = (
    <div
      className="bg-no-repeat bg-center bg-contain w-4 mr-2 inline-block"
      style={{
        backgroundImage: `url('${token.logoURI}')`,
      }}
    />
  );
  const dropdownValue = (
    <div className="flex">
      {token.logoURI && icon}
      <span className="flex-1">{token.symbol}</span>
    </div>
  );
  return (
    <div className="col-span-2 sm:col-span-1">
      <label htmlFor="token" className="block font-medium text-gray-100">
        Token
      </label>
      <Dropdown
        value={dropdownValue}
        textValue={token.symbol}
        options={tokenArray}
        generateOption={(token) => `${token.symbol} (${token.name})`}
        generateKey={(token) => token.address}
        onSelect={(token) => setToken(token)}
      />
    </div>
  );
}
