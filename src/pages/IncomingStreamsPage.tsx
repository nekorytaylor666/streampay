import { useMemo } from "react";

import { useStreams } from "../hooks/useStream";
import useStore from "../stores";
import { Curtain, StreamsList } from "../components";
import { sortStreams } from "../utils/helpers";

const IncomingStreamsPage: React.FC = () => {
  const { data: streams, isLoading: loading } = useStreams();
  const wallet = useStore((state) => state.wallet);

  const incomingStreams = useMemo(() => {
    if (!wallet?.connected || !wallet?.publicKey) return [];
    if (loading) return [];
    if (!streams) return [];
    const filteredStreams = streams.filter(
      (stream) => stream[1].recipient === wallet?.publicKey.toBase58()
    );
    return sortStreams(filteredStreams);
  }, [streams, wallet?.publicKey, wallet?.connected, loading]);

  if (loading) return <Curtain visible />;

  return (
    <div className="px-4 sm:pl-0 flex-grow py-6">
      <h3 className="sm:hidden font-bold text-white mb-6 mt-2 text-center">Incoming Streams</h3>
      <StreamsList streams={incomingStreams} />
    </div>
  );
};

export default IncomingStreamsPage;
