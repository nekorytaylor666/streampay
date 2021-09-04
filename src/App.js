import {useEffect} from "react";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";
import {toast, ToastContainer} from "react-toastify";
import {Main, NotConnected} from "./Pages";
import {Footer, Logo} from "./Components";
import {useNetworkContext} from "./Contexts/NetworkContext";
import useStore from "./Stores"
import SelectCluster from "./Components/SelectCluster";
import logo from './logo.png'
import 'react-toastify/dist/ReactToastify.css';

const storeGetter = state => state.setBalance

function App() {
    const {
        wallet,
        connected,
        setConnected,
        connection,
    } = useNetworkContext()

    const setBalance = useStore(storeGetter)

    useEffect(() => {
        if (wallet) {
            wallet.on('connect', () => {
                setConnected(true);
                connection.getBalance(wallet.publicKey)
                    .then(result => setBalance(result / LAMPORTS_PER_SOL));
                toast.success('Connected to wallet!');
            });
            wallet.on('disconnect', () => {
                setConnected(false);
                toast.info('Disconnected from wallet');
            });
            //wallet.connect();
            return () => {
                wallet.disconnect();
            };
        }
    }, [connection, wallet, setBalance, setConnected]);

    return (
        <div>
            <div className={"mx-auto bg-blend-darken px-4 my-4"}>
                <Logo src={logo}/>
                <div className="sm:absolute top-0 right-0 p-4"><SelectCluster/></div>
                {connected ? <Main/> : <NotConnected action={() => wallet.connect()}/>}
            </div>
            <ToastContainer hideProgressBar position="bottom-left" limit={3}/>
            <Footer/>
        </div>
    );
}

export default App;
