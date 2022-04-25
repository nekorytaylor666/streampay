import { useStreams } from "../hooks/useStream";
import { Curtain, StreamsList } from "../components";

const IncomingStreamsPage: React.FC = () => {
  const { data, isLoading: loading } = useStreams();

  if (loading) return <Curtain visible />;

  return (
    <div className="px-4 sm:pl-0 flex-grow py-6">
      <h3 className="sm:hidden font-bold text-white mb-6 mt-2 text-center">Incoming Streams</h3>
      <StreamsList streams={data?.incoming ?? []} />
    </div>
  );
};

export default IncomingStreamsPage;
