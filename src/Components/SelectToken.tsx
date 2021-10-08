import { useEffect, useState } from "react";
import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";
import useStore, { StoreType } from "../Stores";
import Dropdown from "./Dropdown";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ERR_NOT_CONNECTED } from "../constants";
import { PublicKey } from "@solana/web3.js";

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
  let senderPK: PublicKey = wallet.publicKey;
  useEffect(() => {
    Promise.all([
      new TokenListProvider().resolve(),
      connection
        .getParsedTokenAccountsByOwner(senderPK, {
          programId: TOKEN_PROGRAM_ID,
        })
        .then((result) => result.value),
    ]).then(([tokens, tokenAccounts]) => {
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
      const tokenList = tokens
        .filterByClusterSlug(cluster)
        .getList()
        .filter((token) => mappedTokenAccounts.includes(token.address));
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
