import { TokenStreamData } from "@streamflow/timelock/dist/layout";

const useStreamStore = (set: Function, get: Function) => ({
  streams: {} as { [s: string]: TokenStreamData },
  addStream: (id: string, stream: TokenStreamData) =>
    set({ streams: { ...get().streams, [id]: stream } }),
  deleteStream: (id: string) => {
    const streams = { ...get().streams };
    delete streams[id];
    set({ streams });
  },
  clearStreams: () => set({ streams: {} }),
});

export default useStreamStore;