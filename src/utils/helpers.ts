import Wallet from "@project-serum/sol-wallet-adapter";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TokenListProvider } from "@solana/spl-token-registry";
import type { TokenInfo } from "@solana/spl-token-registry";
import { PublicKey } from "@solana/web3.js";
import type { Connection, TokenAmount } from "@solana/web3.js";
import swal from "sweetalert";

import useStore from "../stores";
import { Cluster } from "../types";

export function getExplorerLink(type: string, id: string): string {
  return `https://explorer.solana.com/${type}/${id}?cluster=${useStore.getState().explorerUrl()}`;
}

export function _swal(): Promise<void> {
  return swal({
    dangerMode: true,
    text: "Are you sure?",
    icon: "warning",
    buttons: { cancel: true, confirm: true },
  });
}

export function copyToClipboard(value: string): void {
  const el = document.createElement("textarea");
  el.value = value;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

// export function streamCreated(id: string) {
// const url = window.location.origin + "#" + id;
// swal({
//   buttons: { confirm: { text: "Copy Stream URL" } },
//   icon: "success",
//   title: "Stream created!",
//   //sweet alert accepts pure HTML Node, so some wrapping must be done https://sweetalert.js.org/guides/#using-dom-nodes-as-content
//   content: {
//     element: "a",
//     attributes: {
//       className: "text-primary block truncate max-w-full",
//       href: url,
//       target: "_blank",
//       innerHTML: url,
//     },
//   },
// }).then((clicked) => {
//   if (clicked) {
//     copyToClipboard(url);
//     swal("Link copied to clipboard!", "Send it to the recipient!", "success");
//   }
// });
// }

const ourToken = {
  chainId: 103, //devnet
  address: "3xugeoFgQES3iYij7sPAafsFTo2r84vEfe2ACycL4W3E", //ADD YOUR LOCAL TOKEN HERE
  symbol: "STRM",
  name: "STREAMFLOW",
  decimals: 9, //default is 9
  logoURI:
    "https://raw.githubusercontent.com/millionsy/token-list/main/assets/mainnet/HDLRMKW1FDz2q5Zg778CZx26UgrtnqpUDkNNJHhmVUFr/logo.png",
  tags: [],
};

export const getTokenAccounts = async (
  connection: Connection,
  wallet: Wallet,
  cluster: Cluster
) => {
  // is default Strategy (in resolve()) way to go?
  const tokenListContainer = await new TokenListProvider().resolve();

  const myTokenAccounts = await connection.getParsedTokenAccountsByOwner(
    wallet.publicKey as PublicKey,
    { programId: TOKEN_PROGRAM_ID }
  );

  const myTokenAccountsObj: { [mint: string]: { uiTokenAmount: TokenAmount } } =
    myTokenAccounts.value.reduce((previous, current) => {
      const { mint, tokenAmount } = current.account.data.parsed.info;

      return {
        ...previous,
        [mint]: { uiTokenAmount: tokenAmount },
      };
    }, {});

  const tokenList = tokenListContainer
    .filterByClusterSlug(cluster === "local" ? "devnet" : cluster)
    .getList();

  //for localhost development add our token with tokenList.concat([ourToken])
  const myTokenAccountsDerived: {
    [mint: string]: { uiTokenAmount: TokenAmount; info: TokenInfo };
  } = tokenList.concat([ourToken]).reduce((previous, current) => {
    if (Object.keys(myTokenAccountsObj).indexOf(current.address) !== -1) {
      const { uiTokenAmount } = myTokenAccountsObj[current.address];

      return {
        ...previous,
        [current.address]: {
          uiTokenAmount,
          info: current,
        },
      };
    }

    return previous;
  }, {});

  return myTokenAccountsDerived;
};

export const getTokenAmount = async (connection: Connection, wallet: Wallet, mint: string) => {
  const token = await connection.getParsedTokenAccountsByOwner(wallet.publicKey as PublicKey, {
    mint: new PublicKey(mint),
  });

  return token.value[0].account.data.parsed.info.tokenAmount;
};

export const formatAmmount = (amount: number, decimals: number, decimalPlaces?: number) =>
  (amount / 10 ** decimals).toFixed(decimalPlaces || decimals);
