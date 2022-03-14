import type { TokenInfo } from "@solana/spl-token-registry";
import type { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import type { PublicKey, TokenAmount } from "@solana/web3.js";
import { Stream } from "@streamflow/stream";

export interface WalletType {
  name: string;
  icon: string;
  adapter: () => any;
}

export enum StreamStatus {
  scheduled = "scheduled",
  streaming = "streaming",
  complete = "completed",
  canceled = "canceled",
}

export interface TokenAccount {
  token: TokenInfo;
  account: PublicKey;
}

export interface Token {
  info: TokenInfo;
  uiTokenAmount: TokenAmount;
}

export interface StringOption {
  value: string;
  label: string;
  icon?: string;
}

export interface NumberOption {
  value: number;
  label: string;
  icon?: string;
}

export interface WalletAdapter extends SignerWalletAdapter {
  publicKey: PublicKey;
}

export type StreamFE = Omit<
  Stream,
  "depositedAmount" | "cliffAmount" | "amountPerPeriod" | "withdrawnAmount"
> & {
  depositedAmount: number;
  cliffAmount: number;
  amountPerPeriod: number;
  withdrawnAmount: number;
};

export enum StreamType {
  Stream = "Stream",
  Vesting = "Vesting",
}
