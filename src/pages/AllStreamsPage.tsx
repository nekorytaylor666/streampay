import { useStreams } from "../hooks/useStream";
import { Curtain, StreamsList } from "../components";

const AllStreamsPage: React.FC = () => {
  const { data, isLoading } = useStreams();

  if (isLoading) return <Curtain visible />;

  return (
    <div className="px-4 sm:pl-0 flex-grow py-6">
      <h3 className="sm:hidden font-bold text-white text-center mb-6 mt-2">All Streams</h3>

      <StreamsList streams={data?.all ?? []} />
    </div>
  );
};

export default AllStreamsPage;
