import {Address, ButtonPrimary, Link} from "./index";
import {getExplorerLink} from "../utils/helpers";
import {AIRDROP_AMOUNT, TX_FINALITY_CONFIRMED} from "../constants";
import {toast} from "react-toastify";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import useStore from "../Stores"
import { CLUSTER_MAINNET } from "../Stores/NetworkStore"

const storeGetter = state => ({
    balance: state.balance,
    setBalance: state.setBalance,
    isMainnet: state.cluster === CLUSTER_MAINNET,
    connection: state.connection(),
    wallet: state.wallet(),
})

export default function Account({
                                    loading,
                                    setLoading
                                }: { loading: boolean, setLoading: Dispatch<SetStateAction<boolean>> }) {

    const [airdropTxSignature, setAirdropTxSignature] = useState(undefined)
    const { connection, wallet, balance, setBalance, isMainnet } = useStore(storeGetter)

    useEffect(() => {
        if (airdropTxSignature) {
            connection.confirmTransaction(airdropTxSignature, TX_FINALITY_CONFIRMED).then(
                result => {
                    if (result.value.err) {
                        toast.error('Airdrop failed!')
                    } else {
                        setBalance(balance + AIRDROP_AMOUNT)
                        toast.success("Airdrop confirmed. Balance updated!")
                    }
                }
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [airdropTxSignature])

    async function requestAirdrop() {
        setLoading(true);
        const signature = await connection.requestAirdrop(wallet.publicKey, AIRDROP_AMOUNT * LAMPORTS_PER_SOL);
        setAirdropTxSignature(signature);
        setLoading(false);
        toast.success("Airdrop requested!")
    }

    return (
        <>
            <div className="mb-4 text-white">
                <Link url={getExplorerLink('address', wallet.publicKey.toBase58())}
                      title="My Wallet Address"/>
                <Address address={wallet.publicKey.toBase58()} className="block truncate"/>
            </div>
            <div className="mb-4 clearfix text-white">
                <strong className="block">Balance</strong>
                <span>◎{Number(balance).toFixed(4)}</span>
                <button type="button" onClick={() => wallet.disconnect()}
                        className="float-right items-center px-2.5 py-1.5 shadow-sm text-xs  font-medium rounded bg-gray-500 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Disconnect
                </button>
                <ButtonPrimary
                    type="button" onClick={requestAirdrop}
                    className={"float-right mr-2 px-2.5 py-1.5 text-xs my-0 rounded active:bg-white" + (isMainnet ? " hidden" : "")}
                    disabled={loading}
                >
                    Airdrop
                </ButtonPrimary>
            </div>
        </>
    )
}
