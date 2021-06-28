import {useEffect} from "react";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";
import {toast, ToastContainer} from "react-toastify";
import NotConnected from "./Pages/NotConnected";
import {Banner, Footer, Logo} from "./Components";

import 'react-toastify/dist/ReactToastify.css';
import logo from './logo.png'
import {useNetworkContext} from "./Contexts/NetworkContext";
import useBalanceStore from "./Stores/BalanceStore";
import Main from "./Pages/Main";

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div>
            <Banner/>
            <div className={"mx-auto bg-blend-darken px-4 my-4"}>
                <Logo src={logo}/>
                {connected ?
                    <Main/> :
                    <NotConnected action={() => selectedWallet.connect()}/>}
            </div>
            <ToastContainer hideProgressBar position="bottom-left" limit={4}/>
            <Footer/>
        </div>
    );
}

export default App;
