import { useEffect, useState } from "react";
import { Account, CreateStreamForm, Curtain } from "../Components";
import StreamsList from "../Components/StreamsList";
import EmptyStreams from "../Components/EmptyStreams";
import useStore, { StoreType } from "../Stores";
import { TokenListProvider } from "@solana/spl-token-registry";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const storeGetter = (state: StoreType) => ({
  connection: state.connection(),
  myTokenAccounts: state.myTokenAccounts,
  setMyTokenAccounts: state.setMyTokenAccounts,
  wallet: state.wallet,
  cluster: state.cluster,
  token: state.token,
  setToken: state.setToken,
  streams: state.streams,
  streamingMints: state.streamingMints,
  tokensStreaming: state.tokensStreaming,
  setTokensStreaming: state.setTokensStreaming,
});
export default function Main() {
  const { wallet, connection, setMyTokenAccounts, cluster, setToken } =
    useStore(storeGetter);
  const [loading, setLoading] = useState(false);

  //componentWillMount
  useEffect(() => {
    if (connection && wallet) {
      const fun = async () => {
        //is default Strategy (in resolve()) way to go?
        const tokenListContainer = await new TokenListProvider().resolve();

        const myTokenAccountsList =
          await connection.getParsedTokenAccountsByOwner(
            wallet.publicKey as PublicKey,
            { programId: TOKEN_PROGRAM_ID }
          );

        const myTokenAccountsObj = myTokenAccountsList.value.reduce(
          (previous, current) => {
            const { info } = current.account.data.parsed;
            return {
              ...previous,
              [info.mint]: { uiTokenAmount: info.tokenAmount },
            };
          },
          {}
        );
        //todo test adding more tokens

        //add our SPL token from the localhost:
        const ourToken = {
          chainId: 103, //devnet
          address: "3xugeoFgQES3iYij7sPAafsFTo2r84vEfe2ACycL4W3E", //ADD YOUR LOCAL TOKEN HERE
          symbol: "STRM",
          name: "STREAMFLOW",
          decimals: 9, //default is 9
          logoURI:
            "https://raw.githubusercontent.com/millionsy/token-list/main/assets/mainnet/HDLRMKW1FDz2q5Zg778CZx26UgrtnqpUDkNNJHhmVUFr/logo.png",
          tags: [],
        };
        const tokenList = tokenListContainer
          .filterByClusterSlug(cluster === "local" ? "devnet" : cluster)
          .getList();

        //for localhost development add our token with tokenList.concat([ourToken])
        const myTokenAccountsDerived = tokenList
          .concat([ourToken])
          .reduce((previous, current) => {
            if (
              Object.keys(myTokenAccountsObj).indexOf(current.address) !== -1
            ) {
              let uiTokenAmount =
                // @ts-ignore
                myTokenAccountsObj[current.address].uiTokenAmount;
              return {
                ...previous,
                [current.address]: {
                  uiTokenAmount: uiTokenAmount,
                  info: current,
                },
              };
            }
            return previous;
          }, {});

        setMyTokenAccounts(myTokenAccountsDerived);
        setToken(
          //@ts-ignore
          myTokenAccountsDerived[Object.keys(myTokenAccountsDerived)[0]]
        );

        // console.log("mints: ", streamingMints);
        // const streamingTokens = tokenList
        //   .concat([ourToken])
        //   .reduce((prev, curr) => {
        //     if (streamingMints.indexOf(curr.address) !== -1) {
        //       return {
        //         ...prev,
        //         [curr.address]: curr,
        //       };
        //     }
        //     return prev;
        //   }, {});
        // console.log("streaming tokens: ", streamingTokens);
        // setTokensStreaming(streamingTokens);
      };

      fun();
    }
    // eslint-disable-next-line
  }, [wallet, connection]);

  return (
    <div className="mx-auto grid grid-cols-1 gap-16 max-w-lg xl:grid-cols-2 xl:max-w-5xl">
      <div>
        <Curtain visible={loading} />
        {wallet?.connected && (
          <>
            <Account loading={loading} setLoading={setLoading} />
            <hr />
          </>
        )}
        <CreateStreamForm loading={loading} setLoading={setLoading} />
      </div>
      <div>{wallet?.connected ? <StreamsList /> : <EmptyStreams />}</div>
    </div>
  );
}
