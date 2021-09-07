import {ToastContainer} from "react-toastify";
import {Main} from "./Pages";
import {Footer, Logo, SelectCluster} from "./Components";
import logo from './logo.png'
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <div>
            <div className={"mx-auto bg-blend-darken px-4 my-4"}>
                <Logo src={logo}/>
                <div className="sm:absolute top-0 right-0 sm:p-4"><SelectCluster/></div>
                <Main/>
            </div>
            <ToastContainer hideProgressBar position="bottom-left" limit={3}/>
            <Footer/>
        </div>
    );
}

export default App;
