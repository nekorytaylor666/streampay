import { TokenStreamData } from "@streamflow/timelock/dist/layout";

const useStreamStore = (set: Function, get: Function) => ({
  streams: {} as { [s: string]: TokenStreamData },
  // streamingMints: [] as string[], // use in future
  addStream: (id: string, stream: TokenStreamData) =>
    set({ streams: { ...get().streams, [id]: stream } }),
  // addStreamingMint: (mint: string) => { //todo in future concat!!!
  //   set({ streamingMints: [mint] });
  // },
  deleteStream: (id: string) => {
    const streams = { ...get().streams };
    delete streams[id];
    set({ streams });
  },
  clearStreams: () => set({ streams: {} }),
});

export default useStreamStore;
