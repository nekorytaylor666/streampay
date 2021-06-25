import EmptyStreams from "../Components/EmptyStreams";
import {StreamData} from "../utils/helpers";
import {Stream} from "../Components";

export default function StreamsContainer(props: { streams: StreamData[], myAddress: string,hasStreams: boolean, setStreams: void, withdrawStream: void, cancelStream: void, removeStream: void }) {
    const {streams, hasStreams, myAddress, setStreams, withdrawStream, cancelStream, removeStream} = props;
    return <div>
        <strong className="text-white text-center text-2xl block">My Streams</strong>
        {hasStreams ? (
            Object.entries(streams)
                .sort(([, stream1], [, stream2]) => stream2.start - stream1.start)
                .map(([id, data]) => (
                    <Stream onStatusUpdate={(status) => setStreams({
                        ...streams,
                        [id]: {...streams[id], status}
                    })}
                            onWithdraw={() => withdrawStream(id)} onCancel={() => cancelStream(id)}
                            id={id} data={data} myAddress={myAddress}
                            removeStream={() => removeStream(id)}/>
                ))
        ) : <EmptyStreams/>}
    </div>
}