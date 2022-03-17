import { useState } from "react";

import { Curtain } from "../components";
import NewStreamForm from "./NewStreamPage/NewStreamForm";
import VestingForm from "./VestingPage/VestingForm";
// import useStore, { StoreType } from "../stores";
// import { getTokenAccounts, sortTokenAccounts } from "../utils/helpers";

// const storeGetter = (state: StoreType) => ({
//   connection: state.connection(),
//   setMyTokenAccounts: state.setMyTokenAccounts,
//   myTokenAccountsSorted: state.myTokenAccountsSorted,
//   setMyTokenAccountsSorted: state.setMyTokenAccountsSorted,
//   wallet: state.wallet,
//   cluster: state.cluster,
//   token: state.token,
//   setToken: state.setToken,
//   myTokenAccounts: state.myTokenAccounts,
// });

const Main = ({ page }: { page: "vesting" | "streams" }) => {
  // const { wallet, connection, setMyTokenAccounts, cluster, setToken, setMyTokenAccountsSorted } =
  //   useStore(storeGetter);
  const [loading, setLoading] = useState(false);
  const isVesting = page === "vesting";

  // useEffect(() => {
  //   if (connection && wallet) {
  //     (async () => {
  //       const myTokenAccounts = await getTokenAccounts(connection, wallet, cluster);
  //       const myTokenAccountsSorted = sortTokenAccounts(myTokenAccounts);

  //       setMyTokenAccounts(myTokenAccounts);
  //       setMyTokenAccountsSorted(myTokenAccountsSorted);
  //       setToken(myTokenAccountsSorted[0]);
  //     })();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [wallet, connection, cluster, setMyTokenAccounts, setToken]);

  return (
    <div className="grid-cols-1 max-w-lg gap-x-2 lg:gap-x-20 lg:grid-cols-2 lg:max-w-6xl pt-4 hidden sm:grid">
      <Curtain visible={loading} />
      {isVesting ? (
        <VestingForm loading={loading} setLoading={setLoading} />
      ) : (
        <NewStreamForm loading={loading} setLoading={setLoading} />
      )}
    </div>
  );
};

export default Main;
