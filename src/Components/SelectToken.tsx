import { useEffect, useState } from "react";
import {
  Strategy,
  TokenInfo,
  TokenListProvider,
} from "@solana/spl-token-registry";
import useStore, { StoreType } from "../Stores";
import Dropdown from "./Dropdown";
import { NATIVE_MINT, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ERR_NOT_CONNECTED } from "../constants";
import { PublicKey } from "@solana/web3.js";

const storeGetter = (state: StoreType) => ({
  cluster: state.cluster,
  connection: state.connection(),
  wallet: state.wallet,
  refreshTokenAccounts: state.refreshTokenAccounts,
  tokenAccounts: state.tokenAccounts,
  setBalance: state.setBalance,
});

export default function SelectToken({
  token,
  setToken,
}: {
  token: TokenInfo | null;
  setToken: (token: TokenInfo) => void;
}) {
  const {
    cluster,
    connection,
    wallet,
    refreshTokenAccounts,
    setBalance,
    tokenAccounts,
  } = useStore(storeGetter);
  const [tokenArray, setTokenArray] = useState<TokenInfo[]>([]);

  if (connection === null || !wallet?.publicKey) {
    throw ERR_NOT_CONNECTED;
  }
  useEffect(() => {
    new TokenListProvider().resolve(Strategy.Static).then((tokens) => {
      console.log(
        "all tokens",
        tokens
          .filterByClusterSlug(cluster === "local" ? "devnet" : cluster)
          .getList()
      );
      const tokenList = tokens
        .filterByClusterSlug(cluster === "local" ? "devnet" : cluster)
        .getList();
      // .filter((token) => {
      //     return mappedTokenAccounts.indexOf(token.address) !== -1
      //         || token.address === "So11111111111111111111111111111111111111112"
      // });
      // tokenList[0].address = "AFgvWAzeGo7QdGXta2aVxGk1NTU5fMo289gEeMv4MKph";
      // tokenList[1].address = "So11111111111111111111111111111111111111112"; //NATIVE_MINT;
      // tokenList[2].address = "3TDDUtCVyHPhbLXGYjefaPjCPGDp4cuwyhDBrPZYAbBf";
      // tokenList[3].address = "4KNdRPuMrkCiGRJvSjsMhto58DcAgkReQoKzTdHoSyRw";

      console.log("tokenlist", tokenList);
      setTokenArray(tokenList);
      // const solTokenInfo =
      //   tokenList.find((i) => i.symbol === "SOL") || tokenList[0];
      // console.log("sol token", solTokenInfo);

      refreshTokenAccounts(connection, wallet.publicKey as PublicKey).then(
        (tokenAccounts) => {
          console.log("tokenaccounts", tokenAccounts);
          setBalance(
            tokenAccounts[Object.keys(tokenAccounts)[0]].amount as number
          );
          setToken(tokenList[0]);
        }
      );

      // if (solTokenInfo) {
      //   setToken(solTokenInfo);
      // }
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
        generateOption={(token) => `${token.symbol}`}
        generateKey={(token) => token.address}
        onSelect={(token) => {
          setToken(token);
          if (tokenAccounts[token.address]) {
            setBalance(tokenAccounts[token.address].amount as number);
          } else {
            setBalance(0);
          }
        }}
      />
    </div>
  );
}
