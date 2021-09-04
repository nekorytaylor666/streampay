const useStreamStore = set => ({
    streams: localStorage.streams ? JSON.parse(localStorage.streams) : {},
    setStreams: streams => set({streams})
})

export default useStreamStore