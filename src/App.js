import {useEffect, useReducer} from "react";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";
import {toast, ToastContainer} from "react-toastify";
import {Main} from "./Pages";
import {Footer, Logo, SelectCluster} from "./Components";
import useStore from "./Stores"
import logo from './logo.png'
import 'react-toastify/dist/ReactToastify.css';

const storeGetter = state => ({
    wallet: state.wallet(),
    cluster: state.cluster,
    connection: state.connection(),
    setBalance: state.setBalance,
    setStreams: state.setStreams,
    connectWallet: state.connectWallet,
    disconnectWallet: state.disconnectWallet,
})

function App() {
    const {
        wallet,
        cluster,
        connection,
        setBalance,
        setStreams,
        connectWallet,
        disconnectWallet,
    } = useStore(storeGetter)

    const [, forceUpdate] = useReducer(i => ++i, 0)

    useEffect(() => {
        if (wallet) {
            wallet.on('connect', () => {
                forceUpdate()
                connection.getBalance(wallet.publicKey)
                    .then(result => setBalance(result / LAMPORTS_PER_SOL));
                toast.success('Connected to wallet!');
            });
            wallet.on('disconnect', () => {
                forceUpdate()
                toast.info('Disconnected from wallet');
            });
            setTimeout(connectWallet, 0)
            return () => {
                disconnectWallet()
            };
        }
    }, [connection, wallet, cluster, setBalance, setStreams, connectWallet, disconnectWallet]);

    return (
        <div>
            <div className={"mx-auto bg-blend-darken px-4 my-4"}>
                <Logo src={logo}/>
                <div className="sm:absolute top-0 right-0 p-4"><SelectCluster/></div>
                <Main/>
            </div>
            <ToastContainer hideProgressBar position="bottom-left" limit={3}/>
            <Footer/>
        </div>
    );
}

export default App;
