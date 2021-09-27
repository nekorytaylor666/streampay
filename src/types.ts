import { TokenInfo } from "@solana/spl-token-registry";

export interface WalletType {
  name: string;
  icon: string;
  adapter: () => any;
}

export interface Stream {
  start: number;
  end: number;
  amount: number;
  withdrawn: number;
  canceled_at: number;
  status: StreamStatus;
  receiver: string;
  sender: string;
}

export interface Account {
  starttime: Buffer;
  endtime: Buffer;
  amount: Buffer;
  withdrawn: Buffer;
  sender: Buffer;
  recipient: Buffer;
}

export enum StreamStatus {
  scheduled = "scheduled",
  streaming = "streaming",
  complete = "complete",
  canceled = "canceled",
}

export interface CrerateStreamsFormType {
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
  vesting: any;
  setVesting: any;
  token: TokenInfo | null;
  setToken: (token: TokenInfo | null) => void;
}
