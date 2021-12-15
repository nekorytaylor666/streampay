import { useEffect, useState } from "react";

import { Account, Curtain } from "../components";
import StreamsForm from "./StreamsPage/StreamsForm";
import VestingForm from "./VestingPage/VestingForm";
import StreamsList from "../components/StreamsList";
import useStore, { StoreType } from "../stores";
import { getTokenAccounts } from "../utils/helpers";

const storeGetter = (state: StoreType) => ({
  connection: state.connection(),
  setMyTokenAccounts: state.setMyTokenAccounts,
  wallet: state.wallet,
  cluster: state.cluster,
  token: state.token,
  setToken: state.setToken,
  myTokenAccounts: state.myTokenAccounts,
});

const Main = ({ page }: { page: "vesting" | "streams" }) => {
  const { wallet, connection, setMyTokenAccounts, cluster, setToken, myTokenAccounts } =
    useStore(storeGetter);
  const [loading, setLoading] = useState(false);
  const isVesting = page === "vesting";

  useEffect(() => {
    if (connection && wallet) {
      (async () => {
        const myTokenAccounts = await getTokenAccounts(connection, wallet, cluster);

        setMyTokenAccounts(myTokenAccounts);
        setToken(myTokenAccounts[Object.keys(myTokenAccounts)[0]]);
      })();
    }
  }, [wallet, connection, cluster, setMyTokenAccounts, setToken]);

  const emptyStreamsText = isVesting
    ? "Your token vesting contracts will appear here."
    : "Your streams will appear here.";

  return (
    <div className="mx-auto grid grid-cols-1 gap-x-28 max-w-lg xl:grid-cols-2 xl:max-w-6xl">
      <div className="xl:mr-12">
        <Curtain visible={loading} />
        {wallet?.connected && <Account setLoading={setLoading} />}
        {isVesting ? (
          <VestingForm loading={loading} setLoading={setLoading} />
        ) : (
          <StreamsForm loading={loading} setLoading={setLoading} />
        )}
      </div>
      <div>
        {connection && wallet?.connected && Object.keys(myTokenAccounts).length ? (
          <StreamsList connection={connection} wallet={wallet} type={page} />
        ) : (
          <p className="text-sm sm:text-base text-gray-200 text-center mt-4">{emptyStreamsText}</p>
        )}
      </div>
    </div>
  );
};

export default Main;
