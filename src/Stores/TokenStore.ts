import { TokenInfo } from "@solana/spl-token-registry";
import { Connection, PublicKey, TokenAmount } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Token } from "../types";

const useTokenStore = (set: Function, get: Function) => ({
  //state
  token: {} as Token,
  myTokenAccounts: {} as { [mint: string]: Token },
  tokensStreaming: {} as { [mint: string]: TokenInfo },

  //actions
  setToken: (token: Token) => set({ token }),
  setMyTokenAccounts: (myTokenAccounts: { [mint: string]: Token }) =>
    set({ myTokenAccounts }),

  setTokensStreaming: (tokensStreaming: {
    [mint: string]: { info: TokenInfo; uiTokenAmount: TokenAmount };
  }) => set({ tokensStreaming }),
});

export default useTokenStore;
