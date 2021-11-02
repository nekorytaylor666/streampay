import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from "react-toastify";

import { AIRDROP_AMOUNT, ERR_NOT_CONNECTED, TX_FINALITY_CONFIRMED } from "../constants";
import useStore, { StoreType } from "../stores";
import { CLUSTER_MAINNET } from "../stores/NetworkStore";
import { getExplorerLink } from "../utils/helpers";
import { Address, ButtonPrimary, Link } from "./index";

const storeGetter = (state: StoreType) => ({
  isMainnet: state.cluster === CLUSTER_MAINNET,
  connection: state.connection(),
  wallet: state.wallet,
  connectWallet: state.connectWallet,
  disconnectWallet: state.disconnectWallet,
  setWalletType: state.setWalletType,
  token: state.token,
});

export default function Account({
  loading,
  setLoading,
}: {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}) {
  const [airdropTxSignature, setAirdropTxSignature] = useState<string | undefined>(undefined);
  const { connection, wallet, isMainnet, disconnectWallet, setWalletType, token } =
    useStore(storeGetter);

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
    myAddress = <Address address={walletPubKey} className="block truncate" />;
  }

  return (
    <>
      <div className="mb-4 text-white">
        {myWalletLink}
        {myAddress}
      </div>
      <div className="mb-4 clearfix text-white">
        {token && (
          <>
            <strong className="block">Balance</strong>
            {token?.uiTokenAmount?.uiAmountString} {token?.info?.symbol}
          </>
        )}
        <button
          type="button"
          onClick={() => {
            disconnectWallet();
            setWalletType(null);
          }}
          className="float-right items-center px-2.5 py-1.5 shadow-sm text-xs  font-medium rounded bg-gray-500 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Disconnect
        </button>
        {wallet?.connected && (
          <ButtonPrimary
            onClick={requestAirdrop}
            className={
              "float-right mr-2 px-2.5 py-1.5 text-xs my-0 rounded active:bg-white" +
              (isMainnet ? " hidden" : "")
            }
            disabled={loading}
          >
            Gimme SOL!
          </ButtonPrimary>
        )}
      </div>
    </>
  );
}
