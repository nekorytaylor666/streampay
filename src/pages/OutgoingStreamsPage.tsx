import { useState, useEffect } from "react";

import Stream from "@streamflow/stream";

import useStore from "../stores";
import { StreamsList } from "../components";
import { sortStreams } from "../utils/helpers";

const OutgoingStreamsPage: React.FC = () => {
  const streams = useStore((state) => state.streams);
  const wallet = useStore((state) => state.wallet);
  const cluster = useStore((state) => state.cluster);
  const [outgoingStreams, setOutgoingStreams] = useState<[string, Stream][]>([]);

  useEffect(() => {
    if (!wallet?.connected || !wallet?.publicKey) return;

    (async () => {
      const outgoingStreams = streams.filter(
        (stream) => stream[1].sender === wallet.publicKey.toBase58()
      );
      setOutgoingStreams(sortStreams(outgoingStreams));
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, streams]);

  return (
    <div className="px-4 sm:pl-0 flex-grow py-6">
      <h3 className="sm:hidden font-bold text-white mb-6 mt-2 text-center">Outgoing Streams</h3>
      {/* @ts-ignore */}
      <StreamsList streams={outgoingStreams} />
    </div>
  );
};

export default OutgoingStreamsPage;
