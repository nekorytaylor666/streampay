import Stream, { Stream as StreamData } from "@streamflow/stream";

interface StreamStore {
  Stream: Stream | null;
  streams: [string, StreamData][];
  populateStreams: (streams: [string, StreamData][]) => void;
  setStream: (Stream: Stream) => void;
  addStream: (stream: [string, StreamData]) => void;
  addStreams: (newStreams: [string, StreamData][]) => void;
  updateStream: (updatedStream: [string, StreamData]) => void;
  deleteStream: (id: string) => void;
  clearStreams: () => void;
}

const sortStreams = (streams: [string, StreamData][]): [string, StreamData][] =>
  streams.sort(([, stream1], [, stream2]) => stream2.start - stream1.start);

const useStreamStore = (set: Function, get: Function): StreamStore => ({
  Stream: null,
  streams: [],
  populateStreams: (streams) => set({ streams: sortStreams(streams) }),
  setStream: (Stream) => set({ Stream }),
  addStream: (stream) => set({ streams: sortStreams([...get().streams, stream]) }),
  addStreams: (newStreams) => set({ streams: sortStreams([...get().streams, ...newStreams]) }),
  updateStream: (updatedStream) => {
    const streams = [...get().streams];
    const index = streams.findIndex(
      (stream: [string, StreamData]) => stream[0] === updatedStream[0]
    );

    if (index > -1) {
      streams[index] = updatedStream;
    }

    return set({ streams });
  },
  deleteStream: (id) => {
    const filteredStreams = get().streams.filter(
      (stream: [string, StreamData]) => stream[0] !== id
    );
    set({ streams: filteredStreams });
  },
  clearStreams: () => set({ streams: [] }),
});

export default useStreamStore;
