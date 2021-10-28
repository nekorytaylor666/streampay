import {
  CLUSTER_DEVNET,
  CLUSTER_LOCAL,
  CLUSTER_MAINNET,
} from "../Stores/NetworkStore";
import useStore, { StoreType } from "../Stores";

const networkStore = (state: StoreType) => ({
  cluster: state.cluster,
  setCluster: state.setCluster,
});

export default function SelectCluster() {
  const { setCluster } = useStore(networkStore);
  return (
    <div className="sm:absolute top-0 right-0 sm:p-4">
      <select
        id="cluster"
        name="cluster"
        className="mt-1 text-white bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
        defaultValue={CLUSTER_DEVNET}
        onChange={(e) => setCluster(e.target.value)}
      >
        <option value={CLUSTER_MAINNET}>mainnet</option>
        <option value={CLUSTER_DEVNET}>{CLUSTER_DEVNET}</option>
        {/* handy for developers, but not needed for the end user */}
        {/* <option value={CLUSTER_TESTNET}>{CLUSTER_TESTNET}</option> */}
        <option value={CLUSTER_LOCAL}>{CLUSTER_LOCAL}</option>
      </select>
    </div>
  );
}
