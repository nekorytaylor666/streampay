import create from "zustand";

const useBalanceStore = create(set => ({
    balance: 0,
    setBalance: balance => set({balance})
}))

export default useBalanceStore