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
