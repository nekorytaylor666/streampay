import { useStreams } from "../hooks/useStream";
import { Curtain, StreamsList } from "../components";

const OutgoingStreamsPage: React.FC = () => {
  const { data, isLoading: loading } = useStreams();

  if (loading) return <Curtain visible />;

  return (
    <div className="px-4 sm:pl-0 flex-grow py-6">
      <h3 className="sm:hidden font-bold text-white mb-6 mt-2 text-center">Outgoing Streams</h3>
      <StreamsList streams={data?.outgoing ?? []} />
    </div>
  );
};

export default OutgoingStreamsPage;
