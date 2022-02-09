import { useEffect, useState } from "react";

import { Switch, Route, Redirect, useHistory } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Cluster } from "@streamflow/stream";
import cx from "classnames";

import { trackPageView } from "./utils/marketing_helpers";
import { Footer, Header, Nav, Banner } from "./components";
import { Page404 } from "./pages";
import routes from "./RoutesConfig";
import { getProgramAccounts } from "./utils/helpers";
import {
  COMMUNITY_PROGRAM_ID,
  STREAMS_COMMUNITY_OFFSET_SENDER,
  STREAMS_COMMUNITY_OFFSET_RECIPIENT,
} from "./constants";
import useStore, { StoreType } from "./stores";

const storeGetter = ({ connection, wallet, cluster }: StoreType) => ({
  connection: connection(),
  wallet,
  isMainnet: cluster === Cluster.Mainnet,
});

const App = () => {
  const history = useHistory();
  const { wallet, connection, isMainnet } = useStore(storeGetter);
  const [showCommunityBanner, setShowCommunityBanner] = useState(false);

  useEffect(() => {
    trackPageView();
    history.listen(trackPageView);
  }, [history]);

  useEffect(() => {
    if (!isMainnet || !connection || !wallet || !wallet.publicKey)
      return setShowCommunityBanner(false);

    const publicKey = wallet.publicKey?.toBase58();

    Promise.all([
      getProgramAccounts(
        connection,
        COMMUNITY_PROGRAM_ID,
        STREAMS_COMMUNITY_OFFSET_SENDER,
        publicKey
      ),
      getProgramAccounts(
        connection,
        COMMUNITY_PROGRAM_ID,
        STREAMS_COMMUNITY_OFFSET_RECIPIENT,
        publicKey
      ),
    ]).then(([outgoing, incoming]) =>
      setShowCommunityBanner(outgoing.length > 0 || incoming.length > 0)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, wallet]);

  return (
    <div className={cx("min-h-screen flex flex-col", isMainnet ? "bg-main" : "bg-sandbox")}>
      {showCommunityBanner && (
        <Banner classes="top-0 left-0 w-full">
          <p className="text-sm text-white">
            Streamflow has upgraded to v2. Your existing streams are safu, please use the{" "}
            <a
              href="https://free.streamflow.finance"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline"
            >
              Community version
            </a>{" "}
            to interact with them.
          </p>
        </Banner>
      )}
      {!isMainnet && (
        <Banner
          title="This is devnet (sandbox) environment!"
          classes="top-0 left-0 w-full"
        ></Banner>
      )}
      <div className="bg-blend-darken flex-grow flex flex-col">
        <Header />
        <Nav classes="block lg:hidden mb-2" />
        <Switch>
          {routes.map(({ path, exact, redirect, Component }) => (
            <Route
              key={path}
              path={path}
              exact={exact}
              render={() => (redirect ? <Redirect to={redirect} /> : <Component />)}
            />
          ))}
          <Route component={Page404} />
        </Switch>
      </div>
      <ToastContainer hideProgressBar position="bottom-left" limit={5} />
      <Footer />
    </div>
  );
};

export default App;
