import {createContext, useContext, useMemo, useState} from "react";
import {SOLLET_URL} from "../constants";
import {Connection} from "@solana/web3.js";
import Wallet from "@project-serum/sol-wallet-adapter";
import useStore from "../Stores"

const NetworkContext = createContext(undefined)

const networkStore = state => state.clusterUrl()

const wallets = {
    Sollet: SOLLET_URL,
}

export function NetworkProvider(props) {
    const cluster = useStore(networkStore)
    const [walletType, setWalletType] = useState('Sollet');
    const [connected, setConnected] = useState(false);

    const connection = useMemo(() => new Connection(cluster), [cluster]);
    const wallet = useMemo(() => new Wallet(wallets[walletType], cluster), [walletType, cluster]);

    return <NetworkContext.Provider value={{
        wallet,
        walletType,
        setWalletType,
        connected,
        setConnected,
        connection,
    }}>{props.children}</NetworkContext.Provider>

}

export function useNetworkContext(){
    return useContext(NetworkContext)
}
