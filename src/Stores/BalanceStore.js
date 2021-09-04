const useBalanceStore = (set: Function) => ({
    balance: 0,
    setBalance: balance => set({balance})
})

export default useBalanceStore