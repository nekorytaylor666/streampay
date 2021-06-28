import {createContext, useContext, useMemo, useState} from "react";
import {SOLLET_URL} from "../constants/constants";
import {clusterApiUrl, Connection} from "@solana/web3.js";
import Wallet from "@project-serum/sol-wallet-adapter";

const NetworkContext = createContext(undefined)

export function NetworkProvider(props) {
    const [network, ] = useState(clusterApiUrl('devnet'))
    const [providerUrl,] = useState(SOLLET_URL);
    const [selectedWallet, setSelectedWallet] = useState(undefined);
    const [connected, setConnected] = useState(false);

    const connection = useMemo(() => new Connection(network), [network]);
    const urlWallet = useMemo(() => new Wallet(providerUrl, network), [providerUrl, network]);

    return <NetworkContext.Provider value={{
        network,
        providerUrl,
        selectedWallet,
        setSelectedWallet,
        connected,
        setConnected,
        connection,
        urlWallet
    }}>{props.children}</NetworkContext.Provider>

}

export function useNetworkContext(){
    return useContext(NetworkContext)
}