import {useEffect} from "react";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";
import {toast, ToastContainer} from "react-toastify";
import {Main, NotConnected} from "./Pages";
import {Footer, Logo} from "./Components";
import {useNetworkContext} from "./Contexts/NetworkContext";
import useBalanceStore from "./Stores/BalanceStore";
import SelectCluster from "./Components/SelectCluster";
import logo from './logo.png'
import 'react-toastify/dist/ReactToastify.css';

const mainComponent = (connected: boolean, selectedWallet: ?Wallet) => {
    if (connected) {
        return <Main/>
    }
    else {
        return <>
            <div className="sm:absolute top-0 right-0 p-4"><SelectCluster/></div>
            <NotConnected action={() => selectedWallet.connect()}/>
        </>
    }
}

function App() {
    const {
        selectedWallet,
        setSelectedWallet,
        urlWallet,
        connected,
        setConnected,
        connection,
    } = useNetworkContext()

    const {setBalance} = useBalanceStore()

    useEffect(() => {
        if (selectedWallet) {
            selectedWallet.on('connect', () => {
                setConnected(true);
                connection.getBalance(selectedWallet.publicKey)
                    .then(result => setBalance(result / LAMPORTS_PER_SOL));
                toast.success('Connected to wallet!');
            });
            selectedWallet.on('disconnect', () => {
                setConnected(false);
                // setSelectedWallet(undefined);
                toast.info('Disconnected from wallet');
            });
            //selectedWallet.connect();
            return () => {
                selectedWallet.disconnect();
            };
        }
    }, [connection, selectedWallet, setBalance, setConnected]);

    useEffect(() => {
        setSelectedWallet(urlWallet)
    }, [setSelectedWallet, urlWallet])

    return (
        <div>
            <div className={"mx-auto bg-blend-darken px-4 my-4"}>
                <Logo src={logo}/>
                {mainComponent(connected, selectedWallet)}
            </div>
            <ToastContainer hideProgressBar position="bottom-left" limit={3}/>
            <Footer/>
        </div>
    );
}

export default App;
