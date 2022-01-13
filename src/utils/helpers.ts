import Wallet from "@project-serum/sol-wallet-adapter";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TokenListProvider } from "@solana/spl-token-registry";
import type { TokenInfo } from "@solana/spl-token-registry";
import { PublicKey } from "@solana/web3.js";
import type { Connection, TokenAmount } from "@solana/web3.js";
import swal from "sweetalert";
import { format } from "date-fns";

import useStore from "../stores";
import { Cluster } from "../types";
import { AIRDROP_TEST_TOKEN, DATE_FORMAT, DEFAULT_DECIMAL_PLACES } from "../constants";

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

const ourTokens = [
  {
    chainId: 103, //devnet
    address: "Gssm3vfi8s65R31SBdmQRq6cKeYojGgup7whkw4VCiQj", //ADD YOUR LOCAL TOKEN HERE
    symbol: "STRM",
    name: "STREAMFLOW",
    decimals: 9, //default is 9
    logoURI: "https://streamflow.finance/public/img/icon.png",
    tags: [],
  },
  {
    chainId: 103, //devnet
    address: "B8DVFHFWFKtqXcN7Up5MyTJNsqSZTSTQw4totxGEJ3Q5", //ADD YOUR LOCAL TOKEN HERE
    symbol: "TEST",
    name: "TEST",
    decimals: 9, //default is 9
    logoURI:
      "https://raw.githubusercontent.com/millionsy/token-list/main/assets/mainnet/HDLRMKW1FDz2q5Zg778CZx26UgrtnqpUDkNNJHhmVUFr/logo.png",
    tags: [],
  },
  {
    chainId: 103, //devnet
    address: AIRDROP_TEST_TOKEN, //ADD YOUR LOCAL TOKEN HERE
    symbol: "META",
    name: "META",
    decimals: 9, //default is 9
    logoURI: "https://streamflow.finance/public/img/solana.png",
    tags: [],
  },
];

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
  } = tokenList.concat(ourTokens).reduce((previous, current) => {
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

export const formatAmount = (amount: number, decimals: number, decimalPlaces?: number) =>
  (amount / 10 ** decimals).toFixed(decimalPlaces || decimals);

export const roundAmount = (
  amount: number,
  decimals: number,
  decimalPlaces = DEFAULT_DECIMAL_PLACES
) => {
  const tens = 10 ** decimalPlaces;
  return Math.round((amount / 10 ** decimals) * tens) / tens;
};

const PERIOD = {
  SECOND: 1,
  MINUT: 60,
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000, //30 days
  YEAR: 31536000,
};

const isMoreThanOne = (amount: number) => (amount > 1 ? "s" : "");

export const formatPeriodOfTime = (period: number) => {
  if (!period) return "0 seconds";

  const years = period / PERIOD.YEAR;
  if (Math.floor(years)) return `${years > 1 ? years : ""} year${isMoreThanOne(years)}`;

  const months = period / PERIOD.MONTH;
  if (Math.floor(months)) return `${months > 1 ? months : ""} month${isMoreThanOne(months)}`;

  const weeks = period / PERIOD.WEEK;
  if (Math.floor(weeks)) return `${weeks > 1 ? weeks : ""} week${isMoreThanOne(weeks)}`;

  const days = period / PERIOD.DAY;
  if (Math.floor(days)) return `${days > 1 ? days : ""} day${isMoreThanOne(days)}`;

  const hours = period / PERIOD.HOUR;
  if (Math.floor(hours)) return `${hours > 1 ? hours : ""} hour${isMoreThanOne(hours)}`;

  const minutes = period / PERIOD.MINUT;
  if (Math.floor(minutes)) return `${minutes > 1 ? minutes : ""} minute${isMoreThanOne(minutes)}`;

  const seconds = period / PERIOD.SECOND;
  if (Math.floor(seconds)) return `${seconds > 1 ? seconds : ""} second${isMoreThanOne(seconds)}`;
};

export const formatCurrentDate = () => format(new Date(), DATE_FORMAT);
