import { useState, FC } from "react";

import { ClusterExtended } from "@streamflow/stream";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from "react-toastify";
import * as Sentry from "@sentry/react";

import {
  AIRDROP_AMOUNT,
  AIRDROP_TEST_TOKEN,
  ERR_NOT_CONNECTED,
  TX_FINALITY_CONFIRMED,
} from "../constants";
import useStore, { StoreType } from "../stores";
import { WalletAdapter } from "../types";
import { getTokenAccounts, getTokenAmount, sortTokenAccounts } from "../utils/helpers";
import { Button } from ".";
import { getAirdrop } from "../api/airdrop";

const storeGetter = ({
  cluster,
  connection,
  wallet,
  disconnectWallet,
  token,
  setMyTokenAccounts,
  myTokenAccounts,
  myTokenAccountsSorted,
  setMyTokenAccountsSorted,
  setToken,
  setLoading,
}: StoreType) => ({
  cluster,
  connection: connection(),
  wallet,
  disconnectWallet,
  token,
  setMyTokenAccounts,
  setMyTokenAccountsSorted,
  myTokenAccountsSorted,
  myTokenAccounts,
  setToken,
  setLoading,
});

interface AirdropProps {
  classes?: string;
}

const Airdrop: FC<AirdropProps> = ({ classes }) => {
  const {
    connection,
    wallet,
    cluster,
    token,
    setMyTokenAccounts,
    setMyTokenAccountsSorted,
    myTokenAccounts,
    setToken,
    setLoading,
  } = useStore(storeGetter);
  const [airdropDisabled, setAirdropDisabled] = useState(false);

  async function requestAirdrop() {
    if (!wallet?.publicKey || !connection) {
      toast.error(ERR_NOT_CONNECTED);
      return;
    }

    setLoading(true);
    setAirdropDisabled(true);

    try {
      const airdrop_connection = new Connection("https://api.devnet.solana.com", "confirmed");
      const txSolAirdrop = await airdrop_connection.requestAirdrop(
        wallet.publicKey,
        AIRDROP_AMOUNT * LAMPORTS_PER_SOL
      );
      const txTestTokenAirdrop = await getAirdrop(connection, wallet);

      Promise.all([
        airdrop_connection.confirmTransaction(txSolAirdrop, TX_FINALITY_CONFIRMED),
        connection.confirmTransaction(txTestTokenAirdrop, TX_FINALITY_CONFIRMED),
      ]).then(
        ([solResponse, testTokenResponse]) => {
          if (solResponse.value.err) {
            toast.error("SOL Airdrop failed!");
            Sentry.captureException(solResponse.value.err);
          } else toast.success("SOL Airdrop successful!");

          if (testTokenResponse.value.err) {
            toast.error("Token Airdrop failed!");
            Sentry.captureException(testTokenResponse.value.err);
          } else toast.success("Token Airdrop successful!");

          if (!token || !Object.keys(token).length)
            updateTokenAccounts(connection, wallet, cluster);
          else updateBalance(connection, wallet, AIRDROP_TEST_TOKEN);

          setTimeout(() => setAirdropDisabled(false), 7000);
        },
        () => toast.warning("Airdrop was not confirmed!")
      );

      setLoading(false);
    } catch (err) {
      setLoading(false);
      setAirdropDisabled(false);
      Sentry.captureException(err);

      if ((err as Error).message.includes("429")) toast.error("Airdrop failed! Too many requests");
      else toast.error("Airdrop failed!");
    }
  }

  const updateTokenAccounts = async (
    connection: Connection,
    wallet: WalletAdapter,
    cluster: ClusterExtended
  ) => {
    const myTokenAccounts = await getTokenAccounts(connection, wallet, cluster);
    const myTokenAccountsSorted = sortTokenAccounts(myTokenAccounts);

    setMyTokenAccounts(myTokenAccounts);
    setMyTokenAccountsSorted(myTokenAccountsSorted);
    setToken(myTokenAccountsSorted[0]);
  };

  const updateBalance = async (connection: Connection, wallet: WalletAdapter, address: string) => {
    const updatedTokenAmount = await getTokenAmount(connection, wallet, address);
    const updatedTokenAccounts = {
      ...myTokenAccounts,
      [address]: { ...myTokenAccounts[address], uiTokenAmount: updatedTokenAmount },
    };

    setMyTokenAccounts(updatedTokenAccounts);
    setMyTokenAccountsSorted(sortTokenAccounts(updatedTokenAccounts));

    if (address === token?.info?.address) setToken({ ...token, uiTokenAmount: updatedTokenAmount });
  };

  return (
    <Button
      background="blue"
      onClick={requestAirdrop}
      classes={`${classes} mr-2 px-2.5 py-2.5 font-bold text-xs my-0 rounded active:bg-white`}
      disabled={airdropDisabled}
    >
      Airdrop
    </Button>
  );
};

export default Airdrop;
