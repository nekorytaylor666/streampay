import { useState, useEffect } from "react";

import Stream, { StreamType, StreamDirection } from "@streamflow/stream";

import useStore from "../stores";
import { StreamsList } from "../components";
import { sortStreams } from "../utils/helpers";

const IncomingStreamsPage: React.FC = () => {
  const connection = useStore((state) => state.connection()!);
  const wallet = useStore((state) => state.wallet!);
  const cluster = useStore((state) => state.cluster);
  const [streams, setStreams] = useState<[string, Stream][]>([]);

  useEffect(() => {
    (async () => {
      const incomingStreams = await Stream.get({
        connection,
        wallet: wallet.publicKey,
        type: StreamType.All,
        direction: StreamDirection.Incoming,
        cluster,
      });
      setStreams(sortStreams(incomingStreams));
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster]);

  // @ts-ignore
  return <StreamsList streams={streams} />;
};

export default IncomingStreamsPage;
