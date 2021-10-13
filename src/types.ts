import { TokenInfo } from "@solana/spl-token-registry";
import { PublicKey } from "@solana/web3.js";

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

export interface CreateStreamsFormType {
  amount: number;
  setAmount: (value: number) => void;
  receiver: string;
  setReceiver: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  startTime: string;
  setStartTime: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  endTime: string;
  setEndTime: (value: string) => void;
  cliffDate: string;
  setCliffDate: (value: string) => void;
  cliffTime: string;
  setCliffTime: (value: string) => void;
  cliffAmount: number;
  setCliffAmount: (value: number) => void;
  timePeriod: number;
  setTimePeriod: (value: number) => void;
  timePeriodMultiplier: number;
  setTimePeriodMultiplier: (value: number) => void;
  advanced: any;
  setAdvanced: any;//todo add correct type.
  token: TokenInfo | null;
  setToken: (token: TokenInfo | null) => void;
}

export interface TokenAccount {
  token: TokenInfo;
  account: PublicKey;
}
