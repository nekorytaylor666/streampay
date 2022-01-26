import axios from "axios";

import { COIN_MARKET_CAP_API_ENDPOINT } from "../constants/api";

export async function fetchTokenPrice(symbol: string) {
  try {
    const response = await axios.get(COIN_MARKET_CAP_API_ENDPOINT, {
      params: {
        symbol,
      },
      headers: {
        "X-CMC_PRO_API_KEY": "383197cd-c064-4342-9a5f-05fe3224c335",
      },
    });
    return response.data.data[symbol].quote.usd.price;
  } catch (error) {
    return 0;
  }
}
