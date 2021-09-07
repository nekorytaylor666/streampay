import {ToastContainer} from "react-toastify";
import {Main} from "./Pages";
import {Footer, Logo} from "./Components";
import logo from './logo.png'
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <div>
            <div className={"mx-auto bg-blend-darken px-4 my-4"}>
                <Logo src={logo}/>
                <Main/>
            </div>
            <ToastContainer hideProgressBar position="bottom-left" limit={3}/>
            <Footer/>
        </div>
    );
}

export default App;
