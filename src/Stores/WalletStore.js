import { SOLLET_URL } from '../constants'
import { Connection } from "@solana/web3.js"
import Wallet from "@project-serum/sol-wallet-adapter"

const wallets = {
    Sollet: SOLLET_URL,
}

let memoizedWallet = {}
let memoizedConnection = {}

const walletTypeWithFallback = (type: ?string, fallback?: ?string = null) => !type || !(type in wallets) ? fallback : type

const getWallet = (type: ?string, clusterUrl: ?string) => {
    if (!clusterUrl || !walletTypeWithFallback(type)) {
        return null
    }
    const key = clusterUrl + type
    if (! memoizedWallet[key]) {
        memoizedWallet = {[key]: new Wallet(wallets[type], clusterUrl)}
    }
    return memoizedWallet[key]
}

const getConnection = (clusterUrl: ?string) => {
    if (!clusterUrl) {
        return null
    }
    const key = clusterUrl
    if (! memoizedConnection[key]) {
        memoizedConnection = {[key]: new Connection(clusterUrl)}
    }
    return memoizedConnection[key]
}

const walletStore = (set: Function, get: Function) => ({
    // state
    walletType: walletTypeWithFallback(localStorage.walletType, 'Sollet'),
    wallet: () => {
        const state = get()
        return getWallet(state.walletType, state.clusterUrl())
    },
    connection: () => getConnection(get().clusterUrl()),

    // actions
    setWalletType: (walletType: string) => {
        get().persistStoreToLocalStorage()
        set({walletType})
    },
    disconnectWallet: () => {
        const state = get()
        state.persistStoreToLocalStorage()
        state.wallet()?.disconnect()
    },
})

export default walletStore