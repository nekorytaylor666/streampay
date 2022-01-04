import { BN } from "@project-serum/anchor";
import type { TokenInfo } from "@solana/spl-token-registry";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
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

export type TransactionData =
  | CreateStreamData
  | WithdrawStreamData
  | TransferStreamData
  | CancelStreamData;

export interface CreateStreamData {
  net_deposited_amount: BN;
  start_time: BN;
  period: BN;
  cliff: BN;
  cliff_amount: BN;
  mint: PublicKey;
  recipient: PublicKey;
  cancelable_by_sender: boolean;
  cancelable_by_recipient: boolean;
  transferable_by_sender: boolean;
  transferable_by_recipient: boolean;
  amount_per_period: BN;
  stream_name: string;
  automatic_withdrawal: false;
  can_topup: boolean;
}

export interface TopupStreamData {
  amount: BN;
  stream: PublicKey;
}

export interface WithdrawStreamData {
  amount: BN;
  stream: PublicKey;
}

export interface TransferStreamData {
  new_recipient: PublicKey;
  stream: PublicKey;
}

export interface CancelStreamData {
  stream: PublicKey;
}

export interface TokenAccount {
  token: TokenInfo;
  account: PublicKey;
}

export interface Token {
  info: TokenInfo;
  uiTokenAmount: TokenAmount;
}

enum LocalCluster {
  local = "local",
}

export type Cluster = WalletAdapterNetwork | LocalCluster;

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
