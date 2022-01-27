import { StreamStatus } from "../types";

export const AIRDROP_AMOUNT = 1; // 1 SOL is the cap on the testnet
export const AIRDROP_PDA = "DRCLpDJUNiMeKuRP9dcnGuibjTMjDGFwbZEXsq1RRgiR";
export const AIRDROP_TEST_TOKEN = "Gssm3vfi8s65R31SBdmQRq6cKeYojGgup7whkw4VCiQj";
export const AIRDROP_WHITELIST = [
  "3r1cS6LS7Q5e2XzMhjV4jwuJEyMsPnTFSSEU8HitWYFc",
  "9CTuPR1xDwyAnQmtAY7PawFDta7yjhkyZhLkXXsUQWFS",
  "8HRZui7gdzueWfB1Bgj2GesaPMJFyqLEk4y67TnNXcJd",
  "4pYeM1AhyqCXy63xtwfMtytz8keWxBD2gHWHqdwacK3C",
];

export const TX_FINALITY_CONFIRMED = "confirmed";
export const TX_FINALITY_FINALIZED = "finalized";

export const INSTRUCTION_CREATE_STREAM = 0;
export const INSTRUCTION_WITHDRAW_STREAM = 1;
export const INSTRUCTION_CANCEL_STREAM = 2;
export const INSTRUCTION_TRANSFER_RECIPIENT = 3;

export enum ProgramInstruction {
  Create,
  Withdraw,
  Topup,
  Cancel,
  TransferRecipient,
}

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

export const DEFAULT_DECIMAL_PLACES = 3;

export const ERRORS = {
  amount_required: "Amount is required.",
  amount_greater_than: "Please provide amount greater than 0.",
  token_required: "Token is required.",
  recipient_required: "You must choose a recipient.",
  subject_required: "Please provide a subject (title).",
  subject_max: "Title can have maximum of 30 characters.",
  start_date_required: "Start date is required.",
  start_date_is_in_the_past: "Cannot start stream in the past.",
  start_time_required: "Start time is required.",
  start_time_is_in_the_past: "Should start in future.",
  end_date_required: "End date is required.",
  end_time_required: "End time is required.",
  deposited_amount_required: "Deposited amount is required.",
  amount_too_high: "You don't have enough tokens.",
  invalid_address: "Please enter a valid Solana wallet address.",
  address_is_a_program: "Address cannot be a program.",
  release_amount_greater_than_deposited: "Should be <= deposited amount.",
  end_should_be_after_start: "End should happen after start.",
  cliff_should_be_after_start: "Cliff should happen after start.",
  cliff_should_be_before_end: "Cliff should happen before end.",
  required: "Required.",
  release_frequency_is_too_slow:
    "Should be smaller or equal to difference between END and CLIFF time.",
  should_be_greater_than_0: "Should be greater than 0.",
  max_year: "Year should be less than 9999.",
};

export const PERIOD = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 3600,
  DAY: 24 * 3600,
  WEEK: 7 * 24 * 3600,
  MONTH: Math.ceil(30.4167 * 24 * 3600), //30.4167 days
  YEAR: 365 * 24 * 3600, // 365 days
};

export const timePeriodOptions = [
  { value: PERIOD.SECOND, label: "second" },
  { value: PERIOD.MINUTE, label: "minute" },
  { value: PERIOD.HOUR, label: "hour" },
  { value: PERIOD.DAY, label: "day" },
  { value: PERIOD.WEEK, label: "week" },
  { value: PERIOD.MONTH, label: "month" },
  { value: PERIOD.YEAR, label: "year" },
];

export const EVENT_CATEGORY = {
  WALLET: "wallet",
  STREAM: "stream",
  VESTING: "vesting",
};

export const EVENT_ACTION = {
  TRANSFERRED: "transferred",
  CANCELED: "canceled",
  TOPPED_UP: "topped_up",
  WITHDRAWN: "withdrawn",
  CONNECTED: "connected",
};

export const EVENT_LABEL = {
  NONE: "none",
};

export const EVENT_TYPE = {
  EVENT: "event",
  PAGEVIEW: "pageview",
  PURCHASE: "purchase",
};

export const TRANSACTION_VARIANT = {
  CREATED: "created",
  TOPPED_UP: "topped_up",
};

export const PRODUCT_BRAND = {
  V1: "v1",
  V2: "v2",
};

export const STREAMFLOW_WEB_AFFILIATION = "streamflow_web";
export const DEFAULT_PURCHASE_CURRENCY = "USD";
export const USD_PEGGED_COINS = ["USDT", "USDC"];
