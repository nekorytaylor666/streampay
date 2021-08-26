import {CLUSTER_LOCAL, CLUSTER_DEVNET, CLUSTER_TESTNET, CLUSTER_MAINNET} from '../Stores/NetworkStore'
import useNetworkStore from "../Stores/NetworkStore"

const networkStore = state => [state.cluster, state.setCluster]

export default function SelectCluster() {
    const [cluster, setCluster] = useNetworkStore(networkStore)
    return (
        <select
            id="token"
            name="token"
            className="mt-1 text-white bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
            defaultValue={cluster}
            onChange={e => setCluster(e.target.value)}
        >
            <option value={CLUSTER_MAINNET}>{CLUSTER_MAINNET} cluster</option>
            <option value={CLUSTER_DEVNET}>{CLUSTER_DEVNET} cluster</option>
            <option value={CLUSTER_TESTNET}>{CLUSTER_TESTNET} cluster</option>
            <option value={CLUSTER_LOCAL}>{CLUSTER_LOCAL} cluster</option>
        </select>
    )
}
