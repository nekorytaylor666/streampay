import {CLUSTER_LOCAL, CLUSTER_DEVNET, CLUSTER_TESTNET, CLUSTER_MAINNET} from '../Stores/NetworkStore'
import useStore from "../Stores"

const networkStore = state => ({cluster: state.cluster, setCluster: state.setCluster})

export default function SelectCluster() {
    const {cluster, setCluster} = useStore(networkStore)
    return (
        <select
            id="cluster"
            name="cluster"
            className="mt-1 text-white bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
            defaultValue={cluster}
            onChange={e => setCluster(e.target.value)}
        >
            <option value={CLUSTER_MAINNET} disabled={true}>{CLUSTER_MAINNET} — soon™</option>
            <option value={CLUSTER_DEVNET}>{CLUSTER_DEVNET}</option>
            <option value={CLUSTER_TESTNET}>{CLUSTER_TESTNET}</option>
            {/* handy for developers, but not needed for the end user */}
            <option value={CLUSTER_LOCAL} hidden={true}>{CLUSTER_LOCAL}</option>
        </select>
    )
}
