import { BN } from "@project-serum/anchor";
import type { TokenInfo } from "@solana/spl-token-registry";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import type { Keypair, PublicKey, TokenAmount } from "@solana/web3.js";

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
  deposited_amount: BN;
  start_time: BN;
  end_time: BN;
  period: BN;
  cliff: BN;
  cliff_amount: BN;
  mint: PublicKey;
  recipient: PublicKey;
  new_stream_keypair: Keypair;
  cancelable_by_sender: boolean;
  cancelable_by_recipient: boolean;
  transferable_by_sender: boolean;
  transferable_by_recipient: boolean;
  release_rate: BN;
  stream_name: string;
  withdrawal_public: false;
  canTopup: boolean;
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
