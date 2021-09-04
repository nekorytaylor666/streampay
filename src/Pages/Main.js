import {useState} from "react";
import {Account, CreateStreamForm, Curtain} from "../Components";
import StreamsContainer from "../Containers/StreamsContainer";

export default function Main() {
    const [loading, setLoading] = useState(false)

    return (
        <div className="mx-auto grid grid-cols-1 gap-16 max-w-lg xl:grid-cols-2 xl:max-w-5xl">
            <div className="mb-8">
                <Curtain visible={loading}/>
                <Account loading={loading} setLoading={setLoading}/>
                <hr/>
                <CreateStreamForm loading={loading} setLoading={setLoading}/>
            </div>
            <StreamsContainer/>
        </div>
    )
}