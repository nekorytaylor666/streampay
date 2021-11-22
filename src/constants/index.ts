import { StreamStatus } from "../types";

export const AIRDROP_AMOUNT = 1; // 1 SOL is the cap on the testnet

export const TX_FINALITY_CONFIRMED = "confirmed";
export const TX_FINALITY_FINALIZED = "finalized";

export const INSTRUCTION_CREATE_STREAM = 0;
export const INSTRUCTION_WITHDRAW_STREAM = 1;
export const INSTRUCTION_CANCEL_STREAM = 2;
export const INSTRUCTION_TRANSFER_RECIPIENT = 3;

export enum ProgramInstruction {
  Create,
  Withdraw,
  Cancel,
  TransferRecipient,
}
// export const INSTRUCTIONS = [INSTRUCTION_CREATE_STREAM, INSTRUCTION_WITHDRAW_STREAM, INSTRUCTION_CANCEL_STREAM, INSTRUCTION_TRANSFER_RECIPIENT];

export const EXPLORER_TYPE_TX = "tx";
export const EXPLORER_TYPE_ADDR = "address";

export const DATE_FORMAT = "yyyy-MM-dd";
export const TIME_FORMAT = "HH:mm";
export const TIME_SUFFIX = "T00:00";

export const START = "start";
export const END = "end";

//might move to a separate class if it becomes clunky
export const ERR_NO_STREAM = "Specified stream doesn't exist. Please double check with the sender.";
export const ERR_NOT_CONNECTED =
  "There was an issue with the connection - please try to refresh the page.";
export const ERR_NO_TOKEN_SELECTED = "Please select the token";
export const ERR_NO_PRIOR_CREDIT =
  "Attempt to debit an account but found no record of a prior credit.";

export const PRODUCT_VESTING = "vesting";
export const PRODUCT_STREAMS = "streams";
export const PRODUCT_MULTIPAY = "multipay";
export const PRODUCT_MULTISIG = "multisig";

export const products = [PRODUCT_VESTING, PRODUCT_STREAMS, PRODUCT_MULTIPAY, PRODUCT_MULTISIG];

//don't forget to update tailwind.config.js to safelist dynamically generated classes
export const STREAM_STATUS_COLOR = {
  [StreamStatus.scheduled]: "gray", // now < start
  [StreamStatus.streaming]: "green", // start <= now < end
  [StreamStatus.complete]: "blue", //now >= end;
  [StreamStatus.canceled]: "red",
};

export const TIMELOCK_STRUCT_OFFSET_SENDER = 48;
export const TIMELOCK_STRUCT_OFFSET_RECIPIENT = 112;

export const DEFAULT_DECIMAL_PLACES = 3;
