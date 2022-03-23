import { Dispatch, SetStateAction, useState, FC } from "react";

import { Cluster, ClusterExtended } from "@streamflow/stream";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import cx from "classnames";
import { toast } from "react-toastify";
import { ExternalLinkIcon } from "@heroicons/react/outline";
import * as Sentry from "@sentry/react";

import {
  AIRDROP_AMOUNT,
  AIRDROP_TEST_TOKEN,
  AIRDROP_WHITELIST,
  ERR_NOT_CONNECTED,
  TX_FINALITY_CONFIRMED,
} from "../constants";
import useStore, { StoreType } from "../stores";
import { WalletAdapter } from "../types";
import {
  getExplorerLink,
  getTokenAccounts,
  getTokenAmount,
  sortTokenAccounts,
} from "../utils/helpers";
import { Address, Button, Link } from ".";
import { cancel, initialize, getAirdrop } from "../api/airdrop";

const storeGetter = ({
  cluster,
  Stream,
  wallet,
  disconnectWallet,
  token,
  setMyTokenAccounts,
  myTokenAccounts,
  myTokenAccountsSorted,
  setMyTokenAccountsSorted,
  setToken,
}: StoreType) => ({
  cluster,
  connection: Stream?.getConnection(),
  wallet,
  disconnectWallet,
  token,
  setMyTokenAccounts,
  setMyTokenAccountsSorted,
  myTokenAccountsSorted,
  myTokenAccounts,
  setToken,
});

interface AccountProps {
  setLoading: Dispatch<SetStateAction<boolean>>;
}

const Account: FC<AccountProps> = ({ setLoading }) => {
  const {
    connection,
    wallet,
    cluster,
    disconnectWallet,
    token,
    setMyTokenAccounts,
    setMyTokenAccountsSorted,
    myTokenAccounts,
    setToken,
  } = useStore(storeGetter);
  const isMainnet = cluster === Cluster.Mainnet;
  const [airdropDisabled, setAirdropDisabled] = useState(false);
  const hideAirdrop =
    isMainnet || AIRDROP_WHITELIST.indexOf(wallet?.publicKey?.toBase58() as string) === -1;
  const isConnected = wallet?.connected && connection;
  const hasTokens = Object.keys(myTokenAccounts).length;

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

  async function requestAirdrop() {
    if (!wallet?.publicKey || !connection) {
      toast.error(ERR_NOT_CONNECTED);
      return;
    }

    setLoading(true);
    setAirdropDisabled(true);

    try {
      const txSolAirdrop = await connection.requestAirdrop(
        wallet.publicKey,
        AIRDROP_AMOUNT * LAMPORTS_PER_SOL
      );

      const txTestTokenAirdrop = await getAirdrop(connection, wallet);

      Promise.all([
        connection.confirmTransaction(txSolAirdrop, TX_FINALITY_CONFIRMED),
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

  const initializeOrCancelAirdrop = async (
    cb: (connection: Connection, wallet: WalletAdapter) => Promise<boolean>
  ) => {
    if (!wallet?.publicKey || !connection) {
      toast.error(ERR_NOT_CONNECTED);
      return;
    }
    await cb(connection, wallet);
    updateBalance(connection, wallet, AIRDROP_TEST_TOKEN);
  };

  const walletPubKey = wallet?.publicKey?.toBase58();
  let myWalletLink = null;
  let myAddress = null;

  if (walletPubKey) {
    myWalletLink = (
      <Link
        url={getExplorerLink("address", walletPubKey)}
        title="Address"
        Icon={ExternalLinkIcon}
        classes="text-blue"
      />
    );
    myAddress = <Address address={walletPubKey} classes="block truncate" />;
  }

  const tokenSymbol = token?.info?.symbol;

  return (
    <div className="mt-4">
      <div className="mb-4 text-white">
        {myWalletLink}
        {myAddress}
      </div>
      <div className="pb-4 border-b border-gray text-white grid gap-x-3 sm:gap-x-4 grid-cols-2">
        {token && (
          <>
            <p className="text-gray-light col-span-1 sm:text-lg">
              Balance
              {tokenSymbol && <span className="font-light text-sm">{` (${tokenSymbol})`}</span>}
            </p>
          </>
        )}
        <div className={cx("col-span-1", hasTokens ? "" : "col-start-2")}>
          <Button
            onClick={disconnectWallet}
            classes="float-right items-center px-2.5 py-1.5 shadow-sm text-xs font-medium rounded bg-gray"
          >
            Disconnect
          </Button>
          <Button
            background="blue"
            onClick={requestAirdrop}
            classes={cx("float-right mr-2 px-2.5 py-1.5 text-xs my-0 rounded active:bg-white", {
              hidden: isMainnet,
            })}
            disabled={airdropDisabled}
          >
            Airdrop
          </Button>
        </div>
        {token && (
          <span className="text-base text-blue">{token?.uiTokenAmount?.uiAmountString}</span>
        )}
        {isConnected && (
          <div className="clearfix text-white col-span-1 col-start-2 mt-2">
            <Button
              background="blue"
              onClick={() => initializeOrCancelAirdrop(cancel)}
              classes={cx("float-right px-4 py-1.5 text-xs my-0 rounded active:bg-white", {
                hidden: hideAirdrop,
              })}
              disabled={airdropDisabled}
            >
              Cancel
            </Button>
            <Button
              background="blue"
              onClick={() => initializeOrCancelAirdrop(initialize)}
              classes={cx("float-right mr-2 px-3.5 py-1.5 text-xs my-0 rounded active:bg-white", {
                hidden: hideAirdrop,
              })}
            >
              Initialize
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
