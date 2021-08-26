import createStore from 'zustand'
import {clusterApiUrl} from "@solana/web3.js"
import { devtools } from 'zustand/middleware'

export const CLUSTER_LOCAL = 'local'
export const CLUSTER_DEVNET = 'devnet'
export const CLUSTER_TESTNET = 'testnet'
export const CLUSTER_MAINNET = 'mainnet-beta'

const clusterUrls = {
    [CLUSTER_LOCAL]: () => 'http://127.0.0.1:8899',
    [CLUSTER_DEVNET]: () => clusterApiUrl(CLUSTER_DEVNET),
    [CLUSTER_TESTNET]: () => clusterApiUrl(CLUSTER_TESTNET),
    [CLUSTER_MAINNET]: () => clusterApiUrl(CLUSTER_MAINNET),
}

const programIds = {
    [CLUSTER_LOCAL]: () => prompt("Program ID?"),
    [CLUSTER_DEVNET]: () => "2DvvSEde36Ch3B52g9hKWDYbfmJimLpJwVBV9Cknypi4",
    [CLUSTER_TESTNET]: () => "8tQZMH3NWtoiNDYwTpSZ3GVrRKbMVi2S5Xjy6UcbG5rR",
    [CLUSTER_MAINNET]: () => null, // TODO: publish the program to mainnet
}

const networkStore = createStore(devtools((set: Function, get: Function) => ({
    // state
    cluster: localStorage.cluster || CLUSTER_DEVNET,
    programId: programIds[localStorage.cluster || CLUSTER_DEVNET](),

    // actions
    clusterUrl: () => clusterUrls[get().cluster](),
    explorerUrl: () => {
        const cluster = get().cluster
        return cluster === CLUSTER_LOCAL ? `custom&customUrl=${encodeURIComponent(get().clusterUrl)}` : cluster
    },
    setCluster: (cluster: string) => {
        const programId = programIds[cluster]()
        if (programId) {
            set({cluster, programId})
        }
        else {
            set({cluster: CLUSTER_DEVNET, programId: programIds[CLUSTER_DEVNET]()})
        }
    }
})))

window.addEventListener("beforeunload", () => {
    const state = networkStore.getState()
    localStorage.cluster = state.cluster
    localStorage.programId = state.programId
})

export default networkStore