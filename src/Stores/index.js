import create from 'zustand'
import useBalanceStore from './BalanceStore'
import useNetworkStore from './NetworkStore'
import useStreamStore from './StreamsStore'

const useStore = create((set, get) => ({
    ...useBalanceStore(set, get),
    ...useNetworkStore(set, get),
    ...useStreamStore(set, get),
}))

window.addEventListener("beforeunload", () => {
    const state = useStore.getState()
    localStorage.cluster = state.cluster
    localStorage.programId = state.programId
    localStorage.walletType = state.walletType
})

export default useStore