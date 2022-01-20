import { Dispatch, SetStateAction, useState, FC } from "react";

import { Cluster } from "@streamflow/timelock/dist/layout";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import cx from "classnames";
import { toast } from "react-toastify";
import { Wallet } from "@project-serum/anchor/src/provider";
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
import { getExplorerLink, getTokenAmount } from "../utils/helpers";
import { Address, Button, Link } from ".";
import { cancel, initialize, getAirdrop } from "../actions/airdrop";

const storeGetter = ({
  cluster,
  connection,
  wallet,
  disconnectWallet,
  token,
  setMyTokenAccounts,
  myTokenAccounts,
  setToken,
}: StoreType) => ({
  isMainnet: cluster === Cluster.Mainnet,
  connection: connection(),
  wallet,
  disconnectWallet,
  token,
  setMyTokenAccounts,
  myTokenAccounts,
  setToken,
});

interface AccountProps {
  setLoading: Dispatch<SetStateAction<boolean>>;
}

const successfulAirdropMsg = (
  <>
    <p>Airdrop successful!</p>
    <p> Check STRM balance!</p>
  </>
);

const Account: FC<AccountProps> = ({ setLoading }) => {
  const {
    connection,
    wallet,
    isMainnet,
    disconnectWallet,
    token,
    setMyTokenAccounts,
    myTokenAccounts,
    setToken,
  } = useStore(storeGetter);
  const [isGimmeSolDisabled, setIsGimmeSolDisabled] = useState(false);
  const hideAirdrop =
    isMainnet || AIRDROP_WHITELIST.indexOf(wallet?.publicKey?.toBase58() as string) === -1;
  const isConnected = wallet?.connected && connection;
  const hasTokens = Object.keys(myTokenAccounts).length;

  const updateBalance = async (connection: Connection, wallet: Wallet, address: string) => {
    // @ts-ignore
    const updatedTokenAmount = await getTokenAmount(connection, wallet, address);

    setMyTokenAccounts({
      ...myTokenAccounts,
      [address]: { ...myTokenAccounts[address], uiTokenAmount: updatedTokenAmount },
    });

    if (address === token.info.address) setToken({ ...token, uiTokenAmount: updatedTokenAmount });
  };

  async function requestAirdrop() {
    if (!wallet?.publicKey || !connection) {
      toast.error(ERR_NOT_CONNECTED);
      return;
    }

    setLoading(true);
    setIsGimmeSolDisabled(true);
    toast.success("Airdrop requested!");

    try {
      const signature = await connection.requestAirdrop(
        wallet.publicKey,
        AIRDROP_AMOUNT * LAMPORTS_PER_SOL
      );

      const tx = await getAirdrop(connection, wallet as Wallet);

      Promise.all([
        connection.confirmTransaction(signature, TX_FINALITY_CONFIRMED),
        connection.confirmTransaction(tx, TX_FINALITY_CONFIRMED),
      ]).then(
        ([res1, res2]) => {
          if (res2.value.err) {
            toast.error("Airdrop failed!");
            Sentry.captureException(res2.value.err);
          } else if (res1.value.err) {
            toast.success(successfulAirdropMsg);
            toast.error("Error getting SOL!");
            Sentry.captureException(res1.value.err);
          } else toast.success(successfulAirdropMsg);

          updateBalance(connection, wallet as Wallet, AIRDROP_TEST_TOKEN);
          setTimeout(() => setIsGimmeSolDisabled(false), 7000);
        },
        () => toast.warning("Airdrop was not confirmed!")
      );

      setLoading(false);
    } catch (err) {
      setLoading(false);
      setIsGimmeSolDisabled(false);
      Sentry.captureException(err);

      if ((err as Error).message.includes("429")) toast.error("Airdrop failed! Too many requests");
      else toast.error("Airdrop failed!");
    }
  }

  const initializeOrCancelAirdrop = async (
    cb: (connection: Connection, wallet: Wallet) => Promise<boolean>
  ) => {
    if (!wallet?.publicKey || !connection) {
      toast.error(ERR_NOT_CONNECTED);
      return;
    }
    await cb(connection, wallet as Wallet);
    updateBalance(connection, wallet as Wallet, AIRDROP_TEST_TOKEN);
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
      <div className="pb-4 border-b border-gray-500 text-white grid gap-x-3 sm:gap-x-4 grid-cols-2">
        {token && (
          <>
            <p className="text-gray-200 col-span-1">
              Balance
              {tokenSymbol && <span className="font-light text-sm">{` (${tokenSymbol})`}</span>}
            </p>
          </>
        )}
        <div className={cx("col-span-1", hasTokens ? "" : "col-start-2")}>
          <Button
            onClick={disconnectWallet}
            classes="float-right items-center px-2.5 py-1.5 shadow-sm text-xs font-medium rounded bg-gray-500 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Disconnect
          </Button>
          <Button
            primary
            onClick={requestAirdrop}
            classes={cx("float-right mr-2 px-2.5 py-1.5 text-xs my-0 rounded active:bg-white", {
              hidden: isMainnet,
            })}
            disabled={isGimmeSolDisabled}
          >
            Airdrop
          </Button>
        </div>
        {token && (
          <span className="text-base text-primary">{token?.uiTokenAmount?.uiAmountString}</span>
        )}
        {isConnected && (
          <div className="clearfix text-white col-span-1 col-start-2 mt-2">
            <Button
              primary
              onClick={() => initializeOrCancelAirdrop(cancel)}
              classes={cx("float-right px-4 py-1.5 text-xs my-0 rounded active:bg-white", {
                hidden: hideAirdrop,
              })}
              disabled={isGimmeSolDisabled}
            >
              Cancel
            </Button>
            <Button
              primary
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
