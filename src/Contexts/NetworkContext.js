import {createContext, useContext, useMemo, useState} from "react";
import {SOLLET_URL} from "../constants";
import {Connection} from "@solana/web3.js";
import Wallet from "@project-serum/sol-wallet-adapter";
import useNetworkStore from "../Stores/NetworkStore"

const NetworkContext = createContext(undefined)

const networkStore = state => state.clusterUrl()

export function NetworkProvider(props) {
    const cluster = useNetworkStore(networkStore)
    const [providerUrl,] = useState(SOLLET_URL);
    const [selectedWallet, setSelectedWallet] = useState(undefined);
    const [connected, setConnected] = useState(false);

    const connection = useMemo(() => new Connection(cluster), [cluster]);
    const urlWallet = useMemo(() => new Wallet(providerUrl, cluster), [providerUrl, cluster]);

    return <NetworkContext.Provider value={{
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
