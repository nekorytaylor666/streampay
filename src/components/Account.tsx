import { Dispatch, SetStateAction, useEffect, useState, FC } from "react";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import cx from "classnames";
import { toast } from "react-toastify";
import { Wallet } from "@project-serum/anchor/src/provider";
import { ExternalLinkIcon } from "@heroicons/react/outline";

import {
  AIRDROP_AMOUNT,
  AIRDROP_WHITELIST,
  ERR_NOT_CONNECTED,
  TX_FINALITY_CONFIRMED,
} from "../constants";
import useStore, { StoreType } from "../stores";
import { getExplorerLink } from "../utils/helpers";
import { Address, Button, Link } from ".";
import { cancel, getAirdrop, initialize } from "../actions/airdrop";

const storeGetter = ({ cluster, connection, wallet, disconnectWallet, token }: StoreType) => ({
  isMainnet: cluster === WalletAdapterNetwork.Mainnet,
  connection: connection(),
  wallet,
  disconnectWallet,
  token,
});

interface AccountProps {
  setLoading: Dispatch<SetStateAction<boolean>>;
}

const Account: FC<AccountProps> = ({ setLoading }) => {
  const [airdropTxSignature, setAirdropTxSignature] = useState<string | undefined>(undefined);
  const { connection, wallet, isMainnet, disconnectWallet, token } = useStore(storeGetter);
  const [isGimmeSolDisabled, setIsGimmeSolDisabled] = useState(false);
  const hideAirdrop =
    isMainnet || AIRDROP_WHITELIST.indexOf(wallet?.publicKey?.toBase58() as string) === -1;
  const isConnected = wallet?.connected && connection;

  useEffect(() => {
    if (airdropTxSignature && connection) {
      connection.confirmTransaction(airdropTxSignature, TX_FINALITY_CONFIRMED).then(
        (result) => {
          if (result.value.err) {
            toast.error("Airdrop failed!");
          } else {
            toast.success("Airdrop confirmed!");
          }

          setTimeout(() => setIsGimmeSolDisabled(false), 7000);
        },
        () => toast.warning("Airdrop was not confirmed!")
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airdropTxSignature]);

  async function requestAirdrop() {
    if (!wallet?.publicKey || !connection) {
      toast.error(ERR_NOT_CONNECTED);
      return;
    }
    setLoading(true);
    setIsGimmeSolDisabled(true);
    try {
      const signature = await connection.requestAirdrop(
        wallet.publicKey,
        AIRDROP_AMOUNT * LAMPORTS_PER_SOL
      );
      setAirdropTxSignature(signature);
      await getAirdrop(connection, wallet as Wallet); //returns a tx id

      //TODO: Update balance!
      setLoading(false);
      toast.success("Airdrop requested!");
    } catch (error) {
      setLoading(false);
      setIsGimmeSolDisabled(false);

      if ((error as Error).message.includes("429")) {
        toast.error("Airdrop failed! Too many requests");
      } else {
        toast.error("Airdrop failed!");
      }
    }
  }

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
        <div className="col-span-1">
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
              onClick={() => cancel(connection, wallet as Wallet)}
              classes={cx("float-right px-3 py-1.5 text-xs my-0 rounded active:bg-white", {
                hidden: hideAirdrop,
              })}
              disabled={isGimmeSolDisabled}
            >
              Cancel
            </Button>
            <Button
              primary
              onClick={() => initialize(connection, wallet as Wallet)}
              classes={cx("float-right mr-2 px-2.5 py-1.5 text-xs my-0 rounded active:bg-white", {
                hidden: hideAirdrop,
              })}
            >
              Set Airdrop
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
