import {useEffect, useReducer} from "react";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";
import {toast, ToastContainer} from "react-toastify";
import {Main, NotConnected} from "./Pages";
import {Footer, Logo} from "./Components";
import useStore from "./Stores"
import SelectCluster from "./Components/SelectCluster";
import logo from './logo.png'
import 'react-toastify/dist/ReactToastify.css';

const storeGetter = state => ({
    wallet: state.wallet(),
    connection: state.connection(),
    setBalance: state.setBalance,
})

let reconnectWallet = false

function App() {
    const {
        wallet,
        connection,
        setBalance,
    } = useStore(storeGetter)

    const [, forceUpdate] = useReducer(i => ++i, 0)

    useEffect(() => {
        if (wallet) {
            wallet.on('connect', () => {
                reconnectWallet = false
                forceUpdate()
                connection.getBalance(wallet.publicKey)
                    .then(result => setBalance(result / LAMPORTS_PER_SOL));
                toast.success('Connected to wallet!');
            });
            wallet.on('disconnect', () => {
                forceUpdate()
                toast.info('Disconnected from wallet');
            });
            if (reconnectWallet) {
                setTimeout(() => wallet.connect(), 0)
            }
            return () => {
                reconnectWallet = true
                wallet.disconnect();
            };
        }
    }, [connection, wallet, setBalance]);

    return (
        <div>
            <div className={"mx-auto bg-blend-darken px-4 my-4"}>
                <Logo src={logo}/>
                <div className="sm:absolute top-0 right-0 p-4"><SelectCluster/></div>
                {wallet.connected ? <Main/> : <NotConnected action={() => wallet?.connect()}/>}
            </div>
            <ToastContainer hideProgressBar position="bottom-left" limit={3}/>
            <Footer/>
        </div>
    );
}

export default App;
