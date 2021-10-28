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

  //todo is this needed in a store?
  updateMyTokenAccounts: (connection: Connection, owner: PublicKey) =>
    connection
      .getParsedTokenAccountsByOwner(owner, { programId: TOKEN_PROGRAM_ID })
      .then((tokenAccountList) => {
        const tokenAccounts: { [key: string]: any } =
          tokenAccountList.value.reduce((previous, current) => {
            const { info } = current.account.data.parsed;
            console.log("parsed data", current.account.data);
            console.log("info", info);
            return {
              ...previous,
              [info.mint]: {
                uiTokenAmount: info.tokenAmount,
              },
            };
          }, {});
        set({ tokenAccounts });
        return tokenAccounts;
      }),
});

export default useTokenStore;
