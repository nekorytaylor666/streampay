import type { TokenInfo } from "@solana/spl-token-registry";
import type { PublicKey, TokenAmount } from "@solana/web3.js";

export interface WalletType {
  name: string;
  icon: string;
  adapter: () => any;
}

export enum StreamStatus {
  scheduled = "scheduled",
  streaming = "streaming",
  complete = "complete",
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
