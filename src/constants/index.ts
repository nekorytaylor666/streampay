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

export const START = "start";
export const END = "end";

//might move to a separate class if it becomes clunky
export const ERR_NO_STREAM = "Specified stream doesn't exist. Please double check with the sender.";
export const ERR_NOT_CONNECTED =
  "There was an issue with the connection - please try to refresh the page.";
export const ERR_NO_TOKEN_SELECTED = "Please select the token";
export const ERR_NO_PRIOR_CREDIT =
  "You don't have enough SOL in your wallet to pay for transaction fees.";

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

export const ERRORS = {
  amount_required: "Amount is required.",
  amount_greater_than: "Please provide amount greater than 0.",
  token_required: "Token is required.",
  recipient_required: "You must choose a recipient.",
  subject_required: "Please provide subject (title).",
  subject_max: "Title can have maximum of 30 characters.",
  start_date_required: "Start date is required.",
  start_date_is_in_the_past: "Cannot start stream in the past.",
  start_time_required: "Start time is required.",
  start_time_is_in_the_past: "Should be at least two minutes in future.",
  end_date_required: "End date is required.",
  end_time_required: "End time is required.",
  deposited_amount_required: "Deposited amount is required.",
  amount_too_high: "You don't have enough tokens.",
  invalid_address: "Please enter a valid Solana wallet address.",
  adress_is_a_program: "Address cannot be a program.",
  release_amount_greater_than_deposited: "Should be <= deposited amount.",
  end_should_be_after_start: "End should happen after start.",
  cliff_should_be_after_start: "Cliff should happen after start.",
  cliff_should_be_before_end: "Cliff should happen before end.",
  required: "Required.",
};

export const getTimePeriodOptions = (plural: boolean) => [
  { value: 1, label: `second${plural ? "s" : ""}` },
  { value: 60, label: `minute${plural ? "s" : ""}` },
  { value: 3600, label: `hour${plural ? "s" : ""}` },
  { value: 86400, label: `day${plural ? "s" : ""}` },
  { value: 604800, label: `week${plural ? "s" : ""}` },
  { value: 2592000, label: `month${plural ? "s" : ""}` },
  { value: 31536000, label: `year${plural ? "s" : ""}` },
];
