import { Connection } from "@solana/web3.js"
import { toast } from "react-toastify"
import { WalletNotFoundError } from "@solana/wallet-adapter-base"

let memoizedWallet = {}
let memoizedConnection = {}

const getWallet = (type: ?Object, clusterUrl: ?string) => {
    if (!clusterUrl || !type) {
        return null
    }
    const key = clusterUrl + type.name
    if (! memoizedWallet[key]) {
        memoizedWallet = {[key]: type.adapter()}
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
    walletType: null,
    wallet: () => {
        const state = get()
        return getWallet(state.walletType, state.clusterUrl())
    },
    connection: () => getConnection(get().clusterUrl()),

    // actions
    setWalletType: (walletType: Object) => {
        get().persistStoreToLocalStorage()
        set({walletType})
    },
    connectWallet: () => get().wallet()?.connect()
        .catch((e) => toast.error(e instanceof WalletNotFoundError ? 'Wallet extension not installed' : 'Wallet not connected, please try again'))
    ,
    disconnectWallet: () => {
        const state = get()
        state.persistStoreToLocalStorage()
        state.wallet()?.disconnect()
    },
})

export default walletStore