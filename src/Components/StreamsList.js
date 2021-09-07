import EmptyStreams from "../Components/EmptyStreams";
import {_swal, getDecodedAccountData} from "../utils/helpers";
import {Stream} from "../Components";
import {_cancelStream, _withdrawStream} from "../Actions";
import {getUnixTime} from "date-fns";
import {STREAM_STATUS_CANCELED, TX_FINALITY_CONFIRMED} from "../constants";
import {LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import useStore from "../Stores"
import {toast} from "react-toastify";
import {useEffect} from "react";

const storeGetter = state => ({
    balance: state.balance,
    setBalance: state.setBalance,
    streams: state.streams,
    addStream: state.addStream,
    deleteStream: state.deleteStream,
    clearStreams: state.clearStreams,
    cluster: state.cluster,
    wallet: state.wallet,
    connection: state.connection(),
})

export default function StreamsContainer() {
    const {wallet, connection, balance, setBalance, streams, addStream, deleteStream, clearStreams, cluster,} = useStore(storeGetter)

    //componentWillMount
    useEffect(() => {
        clearStreams()
        const savedStreams = JSON.parse(localStorage.streams || '{}')
        const newStreams = savedStreams?.[cluster]?.[wallet?.publicKey?.toBase58()] || {}
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
                        if (result?.data) {
                            addStream(id, getDecodedAccountData(result.data));
                        } else {
                            if (id === streamID) {
                                toast.error("Stream doesn't exist. Please double check with the sender.")
                            }
                        }
                    })
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function withdrawStream(id: string) {
        const success = await _withdrawStream(id, streams[id], connection, wallet, cluster)
        if (success) {
            const newBalance = (await connection.getBalance(wallet.publicKey, TX_FINALITY_CONFIRMED)) / LAMPORTS_PER_SOL;
            const streamData = await connection.getAccountInfo(new PublicKey(id), TX_FINALITY_CONFIRMED)
            setBalance(newBalance)
            addStream(id, getDecodedAccountData(streamData.data))
        }
    }

    async function cancelStream(id: string) {
        const {amount, withdrawn} = streams[id];
        const now = new Date();
        const oldBalance = balance;
        const success = await _cancelStream(id, streams[id], connection, wallet, cluster)
        if (success) {
            const newBalance = (await connection.getBalance(wallet.publicKey, TX_FINALITY_CONFIRMED)) / LAMPORTS_PER_SOL;
            const newWithdrawn = amount - (newBalance - oldBalance);
            setBalance(balance + amount - withdrawn)
            addStream(
                id,
                {
                    ...streams[id],
                    withdrawn: newWithdrawn,
                    canceled_at: getUnixTime(now),
                    status: STREAM_STATUS_CANCELED
                }
            )
        }
    }

    async function removeStream(id: string, skipPrompt?: boolean) {
        if (!skipPrompt && await _swal()) {
            deleteStream(id)
        }
    }

    return Object.keys(streams).length > 0 ? (
        Object.entries(streams)
            .sort(([, stream1], [, stream2]) => stream2.start - stream1.start)
            .map(([id, data]) => (
                <Stream key={id} onStatusUpdate={(status) => addStream(id, {...streams[id], status})}
                        onWithdraw={() => withdrawStream(id)} onCancel={() => cancelStream(id)}
                        id={id} data={data} myAddress={wallet.publicKey.toBase58()}
                        removeStream={() => removeStream(id)}/>
            ))
    ) : <EmptyStreams/>
}
