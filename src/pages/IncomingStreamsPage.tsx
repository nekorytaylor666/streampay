import { useState, useEffect } from "react";

import Stream from "@streamflow/stream";

import useStore from "../stores";
import { StreamsList } from "../components";
import { sortStreams } from "../utils/helpers";

const IncomingStreamsPage: React.FC = () => {
  const streams = useStore((state) => state.streams);
  const wallet = useStore((state) => state.wallet);
  const cluster = useStore((state) => state.cluster);
  const [incomingStreams, setIncomingStreams] = useState<[string, Stream][]>([]);

  useEffect(() => {
    if (!wallet?.connected || !wallet?.publicKey) return;

    (async () => {
      const incomingStreams = streams.filter(
        (stream) => stream[1].recipient === wallet.publicKey.toBase58()
      );
      setIncomingStreams(sortStreams(incomingStreams));
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, streams]);

  return (
    <div className="p-6 flex-grow">
      <h3 className="sm:hidden font-bold text-white mb-9 text-center">Incoming Streams</h3>
      {/* @ts-ignore */}
      <StreamsList streams={incomingStreams} />
    </div>
  );
};

export default IncomingStreamsPage;
