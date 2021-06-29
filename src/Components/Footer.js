import {Link} from "./index";

export default function Footer() {
    return (<footer className="mt-40 mb-4 text-center text-sm font-mono text-gray-400">
        <img src="https://solana.com/branding/horizontal/logo-horizontal-gradient-dark.png"
             className="w-40 mx-auto my-2" alt="Solana logo"/>
        <small>
            <Link url="https://streamflow.finance" title="StreamFlow" hideIcon={true}/>
            @ <Link url="https://solana.com/solanaszn" title="SolanaSZN" hideIcon={true}/>
        </small>
    </footer>)
}