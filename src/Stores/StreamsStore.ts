import { Stream } from "../types";

const useStreamStore = (set: Function, get: Function) => ({
  streams: {} as { [s: string]: Stream },
  addStream: (id: string, stream: Object) =>
    set({ streams: { ...get().streams, [id]: stream } }),
  deleteStream: (id: string) => {
    const streams = { ...get().streams };
    delete streams[id];
    set({ streams });
  },
  clearStreams: () => set({ streams: {} }),
});

export default useStreamStore;
