import {useEffect, useState} from "react";
import {Strategy, TokenInfo, TokenListProvider} from "@solana/spl-token-registry";
import useStore, {StoreType} from "../Stores";
import Dropdown from "./Dropdown";
import {TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {ERR_NOT_CONNECTED} from "../constants";
import {PublicKey} from "@solana/web3.js";

const storeGetter = (state: StoreType) => ({
  cluster: state.cluster,
  connection: state.connection(),
  wallet: state.wallet,
  setTokenAccounts: state.setTokenAccounts,
});

export default function SelectToken({
  token,
  setToken,
}: {
  token: TokenInfo | null;
  setToken: (token: TokenInfo) => void;
}) {
  const { cluster, connection, wallet, setTokenAccounts } =
    useStore(storeGetter);
  const [tokenArray, setTokenArray] = useState<TokenInfo[]>([]);

  if (connection === null || !wallet?.publicKey) {
    throw ERR_NOT_CONNECTED;
  }
  useEffect(  () => {
    if (wallet.publicKey) {
      connection.getTokenAccountsByOwner(wallet.publicKey, {programId: TOKEN_PROGRAM_ID}).then(result => console.log('token accs', result))
    }
    Promise.all([
      new TokenListProvider().resolve(Strategy.Static),
      connection
        .getParsedTokenAccountsByOwner(wallet.publicKey as PublicKey, {
          programId: TOKEN_PROGRAM_ID,
        })
        .then((result) => result.value),
    ]).then(([tokens, tokenAccounts]) => {
      console.log('accs', tokenAccounts);
      setTokenAccounts(
        tokenAccounts.reduce(
          (pr, cu) => ({
            ...pr,
            [cu.account.data.parsed.info.mint]: cu.pubkey,
          }),
          {}
        )
      );
      const mappedTokenAccounts = tokenAccounts.map(
        (tokAcc) => tokAcc.account.data.parsed.info.mint
      );
      console.log('mapped', mappedTokenAccounts)
        console.log('all tokens', tokens
            .filterByClusterSlug(cluster === 'local' ? 'devnet' : cluster)
            .getList())
      const tokenList = tokens
        .filterByClusterSlug(cluster === 'local' ? 'devnet' : cluster)
        .getList()
          .slice(0, 6)
        // .filter((token) => {
        //     return mappedTokenAccounts.indexOf(token.address) !== -1
        //         || token.address === "So11111111111111111111111111111111111111112"
        // });
        tokenList[0].address = "7SNK97DHqgGNdEN6hajF5cBZGAJ4zwfS1xchqnJAK8k8";
        tokenList[1].address = "2d2z47F3MsGGGauJqDL9YKu9Cq467msm6bpFvXwvjo12";
        tokenList[2].address = "EasCSKvFnVUen2adrTfdp8gTq1tE5wtpN7x3dJsj3Sad";
        tokenList[3].address = "9Rx6M7KifU2u7ZUoBS8waSPSqSf3VgkwGB9YUTHW85ft";
        tokenList[4].address = "GMvcH9nyCtdkqUAYcXFmvAaiCNwdZNMNsg3pmdKQv3Ci";
        tokenList[5].address = "J5oQxygKnh9AJLjRN9qgz1DbWakJEx3nwzRGGJN6T1Xu";
console.log('tokenlist', tokenList)
      setTokenArray(tokenList);
      const solTokenInfo =
        tokenList.find((i) => i.symbol === "SOL") || tokenList[0];
      console.log('sol token', solTokenInfo)
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
