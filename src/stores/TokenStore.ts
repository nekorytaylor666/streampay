import type { TokenInfo } from "@solana/spl-token-registry";
import type { TokenAmount } from "@solana/web3.js";

import { Token } from "../types";
import { fetchTokenPrice } from "../api";

const useTokenStore = (set: Function) => ({
  //state
  token: {} as Token,
  tokenPriceUsd: 1 as number,
  myTokenAccounts: {} as { [mint: string]: Token },
  myTokenAccountsSorted: [] as Token[],
  tokensStreaming: {} as { [mint: string]: TokenInfo },

  //actions
  setToken: async (token: Token) => {
    const tokenPriceUsd = await fetchTokenPrice(token?.info.symbol);
    set({ token, tokenPriceUsd });
  },
  setMyTokenAccounts: (myTokenAccounts: { [mint: string]: Token }) => set({ myTokenAccounts }),
  setMyTokenAccountsSorted: (myTokenAccountsSorted: Token[]) => set({ myTokenAccountsSorted }),
  setTokensStreaming: (tokensStreaming: {
    [mint: string]: { info: TokenInfo; uiTokenAmount: TokenAmount };
  }) => set({ tokensStreaming }),
});

export default useTokenStore;
