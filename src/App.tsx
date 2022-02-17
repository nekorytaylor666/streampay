import { useEffect } from "react";

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

const storeGetter = ({ connection, wallet, cluster, oldStreams, setOldStreams }: StoreType) => ({
  connection: connection(),
  wallet,
  isMainnet: cluster === Cluster.Mainnet,
  oldStreams,
  setOldStreams,
});

const App = () => {
  const history = useHistory();
  const { wallet, connection, isMainnet, oldStreams, setOldStreams } = useStore(storeGetter);

  useEffect(() => {
    trackPageView();
    history.listen(trackPageView);
  }, [history]);

  useEffect(() => {
    if (!isMainnet || !connection || !wallet || !wallet.publicKey) return setOldStreams(false);

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
    ]).then(([outgoing, incoming]) => setOldStreams(outgoing.length > 0 || incoming.length > 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, wallet]);

  return (
    <div className={cx("min-h-screen flex flex-col", isMainnet ? "bg-main" : "bg-sandbox")}>
      {oldStreams && (
        <Banner classes="top-0 left-0 w-full">
          <p className="text-sm sm:text-base text-white">
            Streamflow has upgraded to v2. Your v1 streams are safu, please use the{" "}
            <a
              href="https://free.streamflow.finance"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline"
            >
              Community app
            </a>{" "}
            to see them.
          </p>
        </Banner>
      )}
      {!isMainnet && (
        <Banner
          title="This is devnet (sandbox) environment!"
          classes="top-0 left-0 w-full"
        ></Banner>
      )}
      <div className="bg-blend-darken flex-grow px-3.5 sm:px-5 flex flex-col">
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
