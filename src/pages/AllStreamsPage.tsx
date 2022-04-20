import { useMemo } from "react";

import { sortStreams } from "../utils/helpers";
import { useStreams } from "../hooks/useStream";
import { Curtain, StreamsList } from "../components";

const AllStreamsPage: React.FC = () => {
  const { data, isLoading } = useStreams();

  const streams = useMemo(() => {
    if (!data) return [];
    if (isLoading) return [];
    return sortStreams(data);
  }, [data, isLoading]);

  if (isLoading) return <Curtain visible />;

  return (
    <div className="px-4 sm:pl-0 flex-grow py-6">
      <h3 className="sm:hidden font-bold text-white text-center mb-6 mt-2">All Streams</h3>

      <StreamsList streams={streams} />
    </div>
  );
};

export default AllStreamsPage;
