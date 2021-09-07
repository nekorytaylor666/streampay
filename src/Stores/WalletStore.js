import { Connection } from "@solana/web3.js"
import { toast } from "react-toastify"
import { WalletNotFoundError } from "@solana/wallet-adapter-base"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"

let memoizedConnection = {}

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
    wallet: null,
    connection: () => getConnection(get().clusterUrl()),

    // actions
    setWalletType: (walletType: ?Object) => {
        const state = get()
        if (walletType?.name === state.walletType?.name) {
            return
        }
        state.persistStoreToLocalStorage()

        const wallet = walletType?.adapter()
        if (wallet) {
            wallet.on('connect', () => {
                set({walletType, wallet})
                state.connection().getBalance(wallet.publicKey).then(result => state.setBalance(result / LAMPORTS_PER_SOL))
                toast.success('Connected to wallet!')
            })
            wallet.on('disconnect', () => {
                set({walletType: null, wallet: null})
                toast.info('Disconnected from wallet')
            })
            wallet.connect()
        }
        else {
            set({walletType, wallet})
        }
    },
    connectWallet: () => get().wallet?.connect()
        .catch((e) => {
            get().setWalletType(null)
            toast.error(e instanceof WalletNotFoundError ? 'Wallet extension not installed' : 'Wallet not connected, please try again')
        }),
    disconnectWallet: () => {
        const state = get()
        // state.persistStoreToLocalStorage()
        state.wallet?.disconnect()
    },
})

export default walletStore