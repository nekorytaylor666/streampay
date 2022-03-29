import { useState, useEffect } from "react";

import Stream from "@streamflow/stream";

import useStore from "../stores";
import { StreamsList } from "../components";
import { sortStreams } from "../utils/helpers";

const IncomingStreamsPage: React.FC = () => {
  const StreamInstance = useStore((state) => state.StreamInstance);
  const streams = useStore((state) => state.streams);
  const connection = StreamInstance?.getConnection();
  const wallet = useStore((state) => state.wallet);
  const cluster = useStore((state) => state.cluster);
  const setLoading = useStore((state) => state.setLoading);
  const populateStreams = useStore((state) => state.populateStreams);
  const clearStreams = useStore((state) => state.clearStreams);
  const [incomingStreams, setIncomingStreams] = useState<[string, Stream][]>([]);

  useEffect(() => {
    if (!wallet?.connected || !wallet?.publicKey || !StreamInstance || !connection) return;

    clearStreams();
    setLoading(true);

    (async () => {
      const allStreams = await StreamInstance.get({
        wallet: wallet.publicKey,
      });

      setLoading(false);
      populateStreams(allStreams);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster]);

  useEffect(() => {
    if (!wallet?.connected || !wallet?.publicKey) return;

    const incomingStreams = streams.filter(
      (stream) => stream[1].recipient === wallet.publicKey.toBase58()
    );
    setIncomingStreams(sortStreams(incomingStreams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streams]);

  return (
    <div className="px-4 sm:pl-0 flex-grow py-6">
      <h3 className="sm:hidden font-bold text-white mb-6 mt-2 text-center">Incoming Streams</h3>
      {/* @ts-ignore */}
      <StreamsList streams={incomingStreams} />
    </div>
  );
};

export default IncomingStreamsPage;
