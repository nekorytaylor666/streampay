import { FC, useEffect, useState } from "react";

import { Route, Switch, useHistory, Redirect } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Cluster, StreamClient } from "@streamflow/stream";
import cx from "classnames";
import { QueryClient, QueryClientProvider } from "react-query";

import { getTokenAccounts, sortTokenAccounts } from "./utils/helpers";
import useStore, { StoreType } from "./stores";
import { trackPageView } from "./utils/marketing_helpers";
import { Footer, Header, Banner, Nav, VerticalNav, Curtain } from "./components";
import { Page404 } from "./pages";
import routes from "./router/RoutesConfig";
import PrivateRoute from "./router/PrivateRoute";

const storeGetter = ({
  wallet,
  cluster,
  loading,
  setStream,
  clusterUrl,
  StreamInstance,
  setMyTokenAccounts,
  setMyTokenAccountsSorted,
  setToken,
}: StoreType) => ({
  wallet,
  cluster,
  isMainnet: cluster === Cluster.Mainnet,
  loading,
  setStream,
  clusterUrl: clusterUrl(),
  connection: StreamInstance?.getConnection(),
  setMyTokenAccounts,
  setMyTokenAccountsSorted,
  setToken,
  StreamInstance,
});
const queryClient = new QueryClient();

const App: FC = () => {
  const history = useHistory();
  const {
    wallet,
    isMainnet,
    setStream,
    cluster,
    clusterUrl,
    loading,
    StreamInstance,
    setMyTokenAccounts,
    setMyTokenAccountsSorted,
    setToken,
    connection,
  } = useStore(storeGetter);
  const [isVerticalNavOpened, setIsVerticalNavOpened] = useState(false);

  const toggleVerticalNav = () => setIsVerticalNavOpened(!isVerticalNavOpened);

  useEffect(() => {
    trackPageView(cluster);
    // @ts-ignore
    history.listen(trackPageView);
  }, [history, cluster]);

  useEffect(() => {
    setStream(
      new StreamClient(clusterUrl, cluster, {
        commitment: "confirmed",
        disableRetryOnRateLimit: true,
      })
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster]);

  useEffect(() => {
    if (!connection || !wallet) return;
    (async () => {
      const myTokenAccounts = await getTokenAccounts(connection, wallet, cluster);
      const myTokenAccountsSorted = sortTokenAccounts(myTokenAccounts);

      setMyTokenAccounts(myTokenAccounts);
      setMyTokenAccountsSorted(myTokenAccountsSorted);
      setToken(myTokenAccountsSorted[0]);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [StreamInstance, wallet]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className={cx("min-h-screen flex flex-col", isMainnet ? "bg-main" : "bg-sandbox")}>
        <Curtain visible={loading} />
        {!isMainnet && (
          <Banner
            title="This is devnet (sandbox) environment!"
            classes="top-0 left-0 w-full"
          ></Banner>
        )}
        <div className="flex-grow flex flex-col bg-dark">
          <Header toggleVerticalNav={toggleVerticalNav} isVerticalNavOpened={isVerticalNavOpened} />
          {wallet?.connected && <Nav classes="hidden sm:block lg:hidden mb-2 mt-4" />}
          <div className={`flex ${!wallet?.connected && "justify-center"}`}>
            {wallet?.connected && isVerticalNavOpened && (
              <VerticalNav
                routes={routes.slice(3)}
                classes="flex sm:hidden fixed top-18 left-0 z-50 w-screen h-screen"
                onClick={toggleVerticalNav}
              />
            )}
            {wallet?.connected && (
              <VerticalNav routes={routes.slice(5)} classes="hidden sm:flex w-60 xl:w-64" />
            )}
            <Switch>
              {routes.map(({ path, exact, Component, isPrivate, redirect }) =>
                isPrivate ? (
                  <PrivateRoute
                    key={path}
                    exact={exact}
                    path={path}
                    isAuthenticated={wallet?.connected || false}
                  >
                    {redirect ? <Redirect to={redirect} /> : <Component />}
                  </PrivateRoute>
                ) : (
                  <Route key={path} path={path} exact={exact}>
                    {redirect ? <Redirect to={redirect} /> : <Component />}
                  </Route>
                )
              )}
              <Route component={Page404} />
            </Switch>
          </div>
        </div>
        <ToastContainer
          hideProgressBar
          position="top-right"
          limit={2}
          className="sm:w-96 sm:mt-2 sm:r-6"
          toastClassName="bg-gray-dark rounded-lg drop-shadow-lg"
        />
        <Footer />
      </div>
    </QueryClientProvider>
  );
};

export default App;
