import { useState, useEffect } from "react";

import Stream from "@streamflow/stream";

import { useStreams } from "../hooks/useStream";
import useStore from "../stores";
import { StreamsList } from "../components";
import { sortStreams } from "../utils/helpers";

const IncomingStreamsPage: React.FC = () => {
  const { streams } = useStreams();
  const wallet = useStore((state) => state.wallet);
  const cluster = useStore((state) => state.cluster);
  const setLoading = useStore((state) => state.setLoading);
  const [incomingStreams, setIncomingStreams] = useState<[string, Stream][]>([]);

  useEffect(() => {
    if (!wallet?.connected || !wallet?.publicKey) return;
    setLoading(true);

    (async () => {
      const incomingStreams = streams.filter(
        (stream) => stream[1].recipient === wallet.publicKey.toBase58()
      );
      setIncomingStreams(sortStreams(incomingStreams));
      setLoading(false);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, streams]);

  return (
    <div className="px-4 sm:pl-0 flex-grow py-6">
      <h3 className="sm:hidden font-bold text-white mb-6 mt-2 text-center">Incoming Streams</h3>
      {/* @ts-ignore */}
      <StreamsList streams={incomingStreams} />
    </div>
  );
};

export default IncomingStreamsPage;
