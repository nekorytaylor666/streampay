import create from 'zustand'
import { devtools } from 'zustand/middleware'
import useBalanceStore from './BalanceStore'
import useNetworkStore from './NetworkStore'
import useStreamStore from './StreamsStore'
import useWalletStore from './WalletStore'

const useStore = create(devtools((set, get) => ({
    ...useBalanceStore(set, get),
    ...useNetworkStore(set, get),
    ...useStreamStore(set, get),
    ...useWalletStore(set, get),
})))

window.addEventListener("beforeunload", () => {
    const state = useStore.getState()
    localStorage.cluster = state.cluster
    localStorage.programId = state.programId
    localStorage.walletType = state.walletType
})

export default useStore