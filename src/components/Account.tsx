import { Dispatch, SetStateAction, useEffect, useState, FC } from "react";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import cx from "classnames";
import { toast } from "react-toastify";

import { AIRDROP_AMOUNT, ERR_NOT_CONNECTED, TX_FINALITY_CONFIRMED } from "../constants";
import useStore, { StoreType } from "../stores";
import { getExplorerLink } from "../utils/helpers";
import { Address, ButtonPrimary, Link } from "./";

const storeGetter = ({ cluster, connection, wallet, disconnectWallet, token }: StoreType) => ({
  isMainnet: cluster === WalletAdapterNetwork.Mainnet,
  connection: connection(),
  wallet,
  disconnectWallet,
  token,
});

interface AccountProps {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

const Account: FC<AccountProps> = ({ loading, setLoading }) => {
  const [airdropTxSignature, setAirdropTxSignature] = useState<string | undefined>(undefined);
  const { connection, wallet, isMainnet, disconnectWallet, token } = useStore(storeGetter);

  useEffect(() => {
    if (airdropTxSignature && connection) {
      connection.confirmTransaction(airdropTxSignature, TX_FINALITY_CONFIRMED).then((result) => {
        if (result.value.err) {
          toast.error("Airdrop failed!");
        } else {
          toast.success("Airdrop confirmed!");
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airdropTxSignature]);

  async function requestAirdrop() {
    if (!wallet?.publicKey || !connection) {
      toast.error(ERR_NOT_CONNECTED);
      return;
    }
    setLoading(true);
    const signature = await connection.requestAirdrop(
      wallet.publicKey,
      AIRDROP_AMOUNT * LAMPORTS_PER_SOL
    );

    setAirdropTxSignature(signature);
    setLoading(false);
    toast.success("Airdrop requested!");
  }

  const walletPubKey = wallet?.publicKey?.toBase58();
  let myWalletLink = null;
  let myAddress = null;

  if (walletPubKey) {
    myWalletLink = <Link url={getExplorerLink("address", walletPubKey)} title="Address" />;
    myAddress = <Address address={walletPubKey} classes="block truncate" />;
  }

  const tokenSymbol = token?.info?.symbol;

  return (
    <>
      <div className="mb-4 text-white">
        {myWalletLink}
        {myAddress}
      </div>
      <div className="pb-4 border-b border-gray-500 clearfix text-white">
        {token && (
          <>
            <p className="font-bold">
              Balance
              {tokenSymbol && <span className="font-light text-sm">{`( ${tokenSymbol} )`}</span>}
            </p>
            {token?.uiTokenAmount?.uiAmountString}
          </>
        )}
        <button
          onClick={disconnectWallet}
          className="float-right items-center px-2.5 py-1.5 shadow-sm text-xs  font-medium rounded bg-gray-500 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Disconnect
        </button>
        {wallet?.connected && (
          <ButtonPrimary
            onClick={requestAirdrop}
            className={cx("float-right mr-2 px-2.5 py-1.5 text-xs my-0 rounded active:bg-white", {
              hidden: isMainnet,
            })}
            disabled={loading}
          >
            Gimme SOL!
          </ButtonPrimary>
        )}
      </div>
    </>
  );
};

export default Account;
