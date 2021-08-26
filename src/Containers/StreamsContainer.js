import EmptyStreams from "../Components/EmptyStreams";
import {_swal, getDecodedAccountData} from "../utils/helpers";
import {getStreamed, Stream} from "../Components";
import {_cancelStream, _withdrawStream} from "../Actions";
import {getUnixTime} from "date-fns";
import {STREAM_STATUS_CANCELED} from "../constants";
import {useNetworkContext} from "../Contexts/NetworkContext";
import useBalanceStore from "../Stores/BalanceStore";
import useStreamStore from "../Stores/StreamsStore";
import {PublicKey} from "@solana/web3.js";
import {toast} from "react-toastify";
import {useEffect} from "react";
import useNetworkStore from "../Stores/NetworkStore"

const networkStore = state => state.cluster

export default function StreamsContainer() {

    const { selectedWallet, connection } = useNetworkContext()
    const cluster = useNetworkStore(networkStore)
    const {balance, setBalance} = useBalanceStore()
    const [streams, setStreams] = useStreamStore(state => [state.streams, state.setStreams])

    //componentWillMount
    useEffect(() => {
        const newStreams = {...streams}
        const streamID = window.location.hash.substring(1);

        if (streamID) {
            try {
                new PublicKey(streamID);
                newStreams[streamID] = undefined; // We're setting the data few lines below
            } catch (e) {
                toast.error("Stream doesn't exist. Please double check with the sender.")
            }
        }

        for (const id in newStreams) {
            if (newStreams.hasOwnProperty(id)) {
                //first, the cleanup
                let pk = undefined
                try {
                    pk = new PublicKey(id);
                } catch (e) {
                    toast.error(e.message + id)
                    //removeStream(id, true);
                }

                if (pk) {
                    connection.getAccountInfo(new PublicKey(id)).then(result => {
                        const temp = {...streams}
                        if (result?.data) {
                            temp[id] = getDecodedAccountData(result.data);
                        } else {
                            if (id === streamID) {
                                toast.error("Stream doesn't exist. Please double check with the sender.")
                            }
                            delete temp[id]
                        }
                        setStreams(temp)
                    })
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        localStorage.streams = JSON.stringify(streams);
    }, [streams])

    async function withdrawStream(id: string) {
        const {start, end, amount} = streams[id];
        const success = await _withdrawStream(id, streams[id], connection, selectedWallet, cluster)
        if (success) {
            const withdrawn = getStreamed(start, end, amount)
            setBalance(balance + withdrawn)
            setStreams({...streams, [id]: {...streams[id], withdrawn}})
        }
    }

    async function cancelStream(id: string) {
        const {start, end, amount} = streams[id];
        const now = new Date();
        const withdrawn = getStreamed(start, end, amount);
        const success = await _cancelStream(id, streams[id], connection, selectedWallet, cluster)
        if (success) {
            setBalance(balance + amount - withdrawn)
            setStreams({
                ...streams,
                [id]: {...streams[id], withdrawn, canceled_at: getUnixTime(now), status: STREAM_STATUS_CANCELED}
            })
        }
    }

    async function removeStream(id: string, skipPrompt?: boolean) {
        if (!skipPrompt && await _swal()) {
            const newStreams = {...streams}
            delete newStreams[id];
            setStreams(newStreams)
        }
    }

    return <div>
        <strong className="text-white text-center text-2xl block">My Streams</strong>
        {Object.keys(streams).length > 0 ? (
            Object.entries(streams)
                .sort(([, stream1], [, stream2]) => stream2.start - stream1.start)
                .map(([id, data]) => (
                    <Stream key={id} onStatusUpdate={(status) => setStreams({
                        ...streams,
                        [id]: {...streams[id], status}
                    })}
                            onWithdraw={() => withdrawStream(id)} onCancel={() => cancelStream(id)}
                            id={id} data={data} myAddress={selectedWallet.publicKey.toBase58()}
                            removeStream={() => removeStream(id)}/>
                ))
        ) : <EmptyStreams/>}
    </div>
}
