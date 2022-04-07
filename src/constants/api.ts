import { Cluster } from "@streamflow/stream";

export const COIN_MARKET_CAP_API_DETAILS = {
  ENDPOINT: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest",
  API_KEY: "383197cd-c064-4342-9a5f-05fe3224c335",
};

export const ContractSettingsclusterUrls: { [s: string]: string } = {
  ["local"]: "http://localhost:5000",
  [Cluster.Devnet]: "https://staging-api.internal-streamflow.com",
  [Cluster.Mainnet]: "https://api.internal-streamflow.com",
};
