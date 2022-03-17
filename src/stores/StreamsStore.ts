import { Stream as StreamData } from "@streamflow/stream";

import { sortStreams } from "../utils/helpers";

interface StreamStore {
  streams: [string, StreamData][];
  populateStreams: (streams: [string, StreamData][]) => void;
  addStream: (stream: [string, StreamData]) => void;
  addStreams: (newStreams: [string, StreamData][]) => void;
  updateStream: (updatedStream: [string, StreamData]) => void;
  deleteStream: (id: string) => void;
  clearStreams: () => void;
}

const useStreamStore = (set: Function, get: Function): StreamStore => ({
  streams: [],
  populateStreams: (streams) => set({ streams: sortStreams(streams) }),
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
