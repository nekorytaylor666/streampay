import createStore from 'zustand'
import {clusterApiUrl} from "@solana/web3.js";

const networkStore = createStore(set => ({
    network: clusterApiUrl('devnet'),
    setNetwork: network => set({network})
}))

export default networkStore