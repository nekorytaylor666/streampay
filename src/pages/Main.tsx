import { useEffect, useState } from "react";

import { Curtain } from "../components";
import StreamsForm from "./StreamsPage/StreamsForm";
import VestingForm from "./VestingPage/VestingForm";
import StreamsList from "../components/StreamsList";
import useStore, { StoreType } from "../stores";
import { getTokenAccounts, sortTokenAccounts } from "../utils/helpers";

const storeGetter = (state: StoreType) => ({
  connection: state.connection(),
  setMyTokenAccounts: state.setMyTokenAccounts,
  myTokenAccountsSorted: state.myTokenAccountsSorted,
  setMyTokenAccountsSorted: state.setMyTokenAccountsSorted,
  wallet: state.wallet,
  cluster: state.cluster,
  token: state.token,
  setToken: state.setToken,
  myTokenAccounts: state.myTokenAccounts,
});

const Main = ({ page }: { page: "vesting" | "streams" }) => {
  const {
    wallet,
    connection,
    setMyTokenAccounts,
    cluster,
    setToken,
    myTokenAccounts,
    setMyTokenAccountsSorted,
  } = useStore(storeGetter);
  const [loading, setLoading] = useState(false);
  const isVesting = page === "vesting";

  useEffect(() => {
    if (connection && wallet) {
      (async () => {
        const myTokenAccounts = await getTokenAccounts(connection, wallet, cluster);
        const myTokenAccountsSorted = sortTokenAccounts(myTokenAccounts);

        setMyTokenAccounts(myTokenAccounts);
        setMyTokenAccountsSorted(myTokenAccountsSorted);
        setToken(myTokenAccountsSorted[0]);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, connection, cluster, setMyTokenAccounts, setToken]);

  const waitForStreamsText = isVesting
    ? "Your token vesting contracts will appear here once you connect."
    : "Your streams will appear here once you connect.";

  const emptyStreamsText = isVesting
    ? "There are still no vesting contracts associated with this wallet."
    : "There are still no streams associated with this wallet.";

  return (
    <div className="grid grid-cols-1 max-w-lg gap-x-2 lg:gap-x-20 lg:grid-cols-2 lg:max-w-6xl pt-4">
      <div className="xl:mr-12">
        <Curtain visible={loading} />
        {isVesting ? (
          <VestingForm loading={loading} setLoading={setLoading} />
        ) : (
          <StreamsForm loading={loading} setLoading={setLoading} />
        )}
      </div>
      <div>
        {connection && wallet?.connected ? (
          Object.keys(myTokenAccounts).length ? (
            <StreamsList connection={connection} wallet={wallet} type={page} />
          ) : (
            <p className="text-sm sm:text-base text-gray-light text-center mt-4">
              {emptyStreamsText}
            </p>
          )
        ) : (
          <p className="text-sm sm:text-base text-gray-light text-center mt-4">
            {waitForStreamsText}
          </p>
        )}
      </div>
    </div>
  );
};

export default Main;
