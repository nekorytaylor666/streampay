import { useEffect, useState } from "react";

import { Account, CreateStreamForm, Curtain } from "../components";
import EmptyStreams from "../components/EmptyStreams";
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
});

const Main = () => {
  const { wallet, connection, setMyTokenAccounts, cluster, setToken } = useStore(storeGetter);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connection && wallet) {
      (async () => {
        const myTokenAccounts = await getTokenAccounts(connection, wallet, cluster);

        setMyTokenAccounts(myTokenAccounts);
        setToken(myTokenAccounts[Object.keys(myTokenAccounts)[0]]);
      })();
    }
  }, [wallet, connection, cluster, setMyTokenAccounts, setToken]);

  return (
    <div className="mx-auto grid grid-cols-1 gap-16 max-w-lg xl:grid-cols-2 xl:max-w-5xl">
      <div>
        <Curtain visible={loading} />
        {wallet?.connected && <Account loading={loading} setLoading={setLoading} />}
        <CreateStreamForm loading={loading} setLoading={setLoading} />
      </div>
      <div>{wallet?.connected ? <StreamsList /> : <EmptyStreams />}</div>
    </div>
  );
};

export default Main;
