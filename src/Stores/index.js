import create from 'zustand'
import { devtools } from 'zustand/middleware'
import useBalanceStore from './BalanceStore'
import useNetworkStore from './NetworkStore'
import useStreamStore from './StreamsStore'
import useWalletStore from './WalletStore'

const persistStoreToLocalStorage = () => {
    const state = useStore.getState()
    localStorage.cluster = state.cluster
    localStorage.programId = state.programId
    localStorage.walletType = state.walletType?.name

    const existingStreams = JSON.parse(localStorage.streams || '{}')
    const walletKey = state.wallet?.publicKey
    if (walletKey) {
        // put current streams in localStorage without overwriting
        // the exiting ones in other wallets or clusters
        // localStorage.streams[state.cluster][walletKey] = state.streams
        const mergedStreams = {
            ...existingStreams,
            [state.cluster]: {
                ...existingStreams[state.cluster],
                [walletKey.toBase58()]: state.streams
            }
        }
        localStorage.streams = JSON.stringify(mergedStreams)
    }
}

const useStore = create(devtools((set, get) => ({
    ...useBalanceStore(set, get),
    ...useNetworkStore(set, get),
    ...useStreamStore(set, get),
    ...useWalletStore(set, get),
    persistStoreToLocalStorage,
})))

window.addEventListener("beforeunload", persistStoreToLocalStorage)

export default useStore