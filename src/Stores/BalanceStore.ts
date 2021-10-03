const useBalanceStore = (set: Function) => ({
  balance: 0,
  setBalance: (balance: number) => set({ balance }),
});

export default useBalanceStore;
