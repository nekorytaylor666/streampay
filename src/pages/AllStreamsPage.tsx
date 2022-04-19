import { useStreams } from "../hooks/useStream";
import { StreamsList } from "../components";

const AllStreamsPage: React.FC = () => {
  const { streams } = useStreams();
  return (
    <div className="px-4 sm:pl-0 flex-grow py-6">
      <h3 className="sm:hidden font-bold text-white text-center mb-6 mt-2">All Streams</h3>
      <StreamsList streams={streams} />
    </div>
  );
};

export default AllStreamsPage;
