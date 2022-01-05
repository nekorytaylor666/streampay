import { Stream as StreamData } from "@streamflow/timelock/dist/packages/timelock/layout";

interface Streams {
  [s: string]: StreamData;
}

interface StreamStore {
  streams: Streams;
  addStream: (id: string, stream: StreamData) => void;
  addStreams: (newStreams: Streams) => void;
  deleteStream: (id: string) => void;
  clearStreams: () => void;
}

const useStreamStore = (set: Function, get: Function): StreamStore => ({
  streams: {},
  addStream: (id, stream) => set({ streams: { ...get().streams, [id]: stream } }),
  addStreams: (newStreams) => set({ streams: { ...get().streams, ...newStreams } }),
  deleteStream: (id) => {
    const streams = { ...get().streams };
    delete streams[id];
    set({ streams });
  },
  clearStreams: () => set({ streams: {} }),
});

export default useStreamStore;
