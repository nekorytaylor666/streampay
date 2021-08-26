import {Amount, ButtonPrimary, DateTime, Recipient, SelectToken,} from "./index";
import {useFormContext} from "../Contexts/FormContext";
import {getUnixTime} from "date-fns";
import {streamCreated, StreamData} from "../utils/helpers";
import {_createStream} from "../Actions";
import useBalanceStore from "../Stores/BalanceStore";
import {Keypair} from "@solana/web3.js";
import {Dispatch, SetStateAction} from "react";
import {useNetworkContext} from "../Contexts/NetworkContext";
import useStreamStore from "../Stores/StreamsStore";
import useNetworkStore from "../Stores/NetworkStore"

const networkStore = state => state.cluster

export default function CreateStreamForm({loading, setLoading} : {loading: boolean, setLoading: Dispatch<SetStateAction<boolean>>}) {
    const pda = Keypair.generate();
    const {
        amount,
        setAmount,
        receiver,
        setReceiver,
        startDate,
        setStartDate,
        startTime,
        setStartTime,
        endDate,
        setEndDate,
        endTime,
        setEndTime
    } = useFormContext()

    const {
        connection, selectedWallet
    } = useNetworkContext();

    const cluster = useNetworkStore(networkStore)

    const {balance, setBalance} = useBalanceStore()
    const {streams, setStreams} = useStreamStore()

    function validate(element) {
        const {name, value} = element;
        let start;
        let msg = "";
        switch (name) {
            case "start":
                msg = new Date(value) < new Date((new Date()).toDateString()) ? "Cannot start the stream in the past." : "";
                break;
            case "start_time":
                start = new Date(startDate + "T" + value);
                msg = start < new Date() ? "Cannot start the stream in the past." : "";
                break;
            case "end":
                msg = new Date(value) < new Date(startDate) ? "Umm... end date before the start date?" : "";
                break;
            case "end_time":
                start = new Date(startDate + "T" + startTime);
                const end = new Date(endDate + "T" + value);
                msg = end < start ? "Err... end time before the start time?" : "";
                break;
            default:
        }
        element.setCustomValidity(msg);
    }

    async function createStream() {
        const form = document.getElementById('form');
        for (const elem of form.elements) {
            validate(elem);
        }

        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        const start = getUnixTime(new Date(startDate + "T" + startTime));
        let end = getUnixTime(new Date(endDate + "T" + endTime));

        // Make sure that end time is always AFTER start time
        if (end === start) {
            end = start + 1;
        }

        setLoading(true);
        const data = new StreamData(selectedWallet.publicKey.toBase58(), receiver, amount, start, end);
        const success = await _createStream(data, connection, selectedWallet, cluster, pda)
        setLoading(false);
        if (success) {
            streamCreated(pda.publicKey.toBase58())
            // const newBalance = await connection.getBalance(selectedWallet.publicKey);
            setBalance(balance - amount)
            setStreams({...streams, [pda.publicKey.toBase58()]: data})
        }
    }

    return (
        <form onSubmit={createStream} id="form">
            <div className="my-4 grid gap-4 grid-cols-5 sm:grid-cols-2">
                <Amount onChange={setAmount} value={amount} max={balance}/>
                <SelectToken/>
                <Recipient onChange={setReceiver} value={receiver}/>
                <DateTime
                    title="start"
                    date={startDate}
                    updateDate={setStartDate}
                    time={startTime}
                    updateTime={setStartTime}
                />
                <DateTime
                    title="end"
                    date={endDate}
                    updateDate={setEndDate}
                    time={endTime}
                    updateTime={setEndTime}
                />
            </div>
            <ButtonPrimary
                className="font-bold text-2xl my-5"
                onClick={createStream}
                type="button"
                disabled={loading}
            >
                Stream!
            </ButtonPrimary>
        </form>
    );
}
