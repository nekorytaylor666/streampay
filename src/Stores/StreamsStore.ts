import { Stream } from "@streamflow/timelock/dist/layout";

const useStreamStore = (set: Function, get: Function) => ({
  streams: {} as { [s: string]: Stream },
  addStream: (id: string, stream: Stream) =>
    set({ streams: { ...get().streams, [id]: stream } }),
  deleteStream: (id: string) => {
    const streams = { ...get().streams };
    delete streams[id];
    set({ streams });
  },
  clearStreams: () => set({ streams: {} }),
});

export default useStreamStore;
