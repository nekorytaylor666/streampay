import { Stream as StreamData } from "@streamflow/timelock/dist/layout";

interface StreamStore {
  streams: [string, StreamData][];
  addStream: (stream: [string, StreamData]) => void;
  addStreams: (newStreams: [string, StreamData][]) => void;
  updateStream: (updatedStream: [string, StreamData]) => void;
  deleteStream: (id: string) => void;
  clearStreams: () => void;
}

const sortStreams = (streams: [string, StreamData][]): [string, StreamData][] =>
  streams.sort(
    ([, stream1], [, stream2]) => stream2.start_time.toNumber() - stream1.start_time.toNumber()
  );

const useStreamStore = (set: Function, get: Function): StreamStore => ({
  streams: [],
  addStream: (stream) => set({ streams: sortStreams([...get().streams, stream]) }),
  updateStream: (updatedStream) => {
    const streams = get().streams;
    const index = streams.findIndex(
      (stream: [string, StreamData]) => stream[0] === updatedStream[0]
    );
    if (index > -1) {
      streams[index] = updatedStream;
    }

    return set({ streams });
  },
  addStreams: (newStreams) => set({ streams: sortStreams([...get().streams, ...newStreams]) }),
  deleteStream: (id) => {
    const filteredStreams = get().streams.filter(
      (stream: [string, StreamData]) => stream[0] !== id
    );
    set({ streams: sortStreams(filteredStreams) });
  },
  clearStreams: () => set({ streams: [] }),
});

export default useStreamStore;
