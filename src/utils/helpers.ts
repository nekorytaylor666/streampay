import type { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TokenListProvider } from "@solana/spl-token-registry";
import type { TokenInfo } from "@solana/spl-token-registry";
import { PublicKey } from "@solana/web3.js";
import type { Connection, TokenAmount } from "@solana/web3.js";
import { format } from "date-fns";
import { Cluster, LocalCluster, ClusterExtended } from "@streamflow/stream";

import useStore from "../stores";
import { StringOption } from "../types";
import { DATE_FORMAT, DEFAULT_DECIMAL_PLACES, PERIOD } from "../constants";

export function getExplorerLink(type: string, id: string): string {
  return `https://explorer.solana.com/${type}/${id}?cluster=${useStore.getState().explorerUrl()}`;
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
    address: "AhitdMW8uWA5tfkRxv4zbRw7dN4sqdqgeVHHCjFo2u9G", //ADD YOUR LOCAL TOKEN HERE
    symbol: "KIDA",
    name: "KIDALICA",
    decimals: 9, //default is 9
    logoURI: "https://streamflow.finance/public/img/icon.png",
    tags: [],
  },
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
    address: "FGHYWaEkycB1bhkQKN7GqJTzySgQzFgvdFc8RuVzmkNF", //ADD YOUR LOCAL TOKEN HERE
    symbol: "META",
    name: "META",
    decimals: 9, //default is 9
    logoURI: "https://streamflow.finance/public/img/solana.png",
    tags: [],
  },
];

export const getTokenAccounts = async (
  connection: Connection,
  wallet: SignerWalletAdapter,
  cluster: ClusterExtended
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
    .filterByClusterSlug(cluster === LocalCluster.Local ? Cluster.Devnet : cluster)
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

export const getTokenAmount = async (
  connection: Connection,
  wallet: SignerWalletAdapter,
  mint: string
) => {
  const token = await connection.getParsedTokenAccountsByOwner(wallet.publicKey as PublicKey, {
    mint: new PublicKey(mint),
  });

  return token.value[0].account.data.parsed.info.tokenAmount;
};

export const formatAmount = (amount: number, decimals: number, decimalPlaces?: number) =>
  amount.toFixed(decimalPlaces || decimals);

export const roundAmount = (amount: number, decimalPlaces = DEFAULT_DECIMAL_PLACES) => {
  const tens = 10 ** decimalPlaces;
  return Math.round(amount * tens) / tens;
};

const isMoreThanOne = (amount: number) => (amount > 1 ? "s" : "");

export const formatPeriodOfTime = (period: number): string => {
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

  const minutes = period / PERIOD.MINUTE;
  if (Math.floor(minutes)) return `${minutes > 1 ? minutes : ""} minute${isMoreThanOne(minutes)}`;

  const seconds = period / PERIOD.SECOND;
  if (Math.floor(seconds)) return `${seconds > 1 ? seconds : ""} second${isMoreThanOne(seconds)}`;

  return "";
};

export const formatCurrentDate = () => format(new Date(), DATE_FORMAT);

export const compare2Arrays = (array1: string[], array2: string[]): boolean => {
  if (array1.length !== array2.length) return false;

  array1.sort();
  array2.sort();

  for (let i = 0; i < array1.length; i++) if (array1[i] !== array2[i]) return false;

  return true;
};

export const didTokenOptionsChange = (
  previousTokens: StringOption[],
  newTokens: StringOption[]
): boolean => {
  const previousValues = previousTokens.map((token) => token.value);
  const newValues = newTokens.map((token) => token.value);

  return compare2Arrays(previousValues, newValues);
};

export const calculateEndTimeLikeOnBE = ({
  cliff,
  depositedAmount,
  cliffAmount,
  amountPerPeriod,
  period,
}: {
  cliff: number;
  depositedAmount: number;
  cliffAmount: number;
  amountPerPeriod: number;
  period: number;
}): { periods: number; endTimeFromBE: number } => {
  if (!cliff || !Number(depositedAmount) || !amountPerPeriod || !period)
    return { periods: 0, endTimeFromBE: 0 };

  const periodsLeft = Math.ceil((depositedAmount - cliffAmount) / amountPerPeriod);
  const secondsLeft = periodsLeft * period;

  return { periods: periodsLeft, endTimeFromBE: (cliff + secondsLeft) * 1000 };
};

export const getProgramAccounts = (
  connection: Connection,
  programId: string,
  offset: number,
  bytes: string
) =>
  connection?.getProgramAccounts(new PublicKey(programId), {
    filters: [
      {
        memcmp: {
          offset,
          bytes,
        },
      },
    ],
  });
