import { FC, useEffect, useState } from "react";

import { Route, Switch, useHistory, Redirect } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { Cluster } from "@streamflow/stream";
import cx from "classnames";

import { trackPageView } from "./utils/marketing_helpers";
import { Footer, Header, Banner, Nav, VerticalNav, Curtain } from "./components";
import { Page404 } from "./pages";
import routes from "./router/RoutesConfig";
import PrivateRoute from "./router/PrivateRoute";
import useStore, { StoreType } from "./stores";

const storeGetter = ({ connection, wallet, cluster, loading }: StoreType) => ({
  connection: connection(),
  wallet,
  cluster,
  isMainnet: cluster === Cluster.Mainnet,
  loading,
});

const App: FC = () => {
  const history = useHistory();
  const { wallet, isMainnet, cluster, loading } = useStore(storeGetter);
  const [isVerticalNavOpened, setIsVerticalNavOpened] = useState(false);

  const toggleVerticalNav = () => setIsVerticalNavOpened(!isVerticalNavOpened);

  useEffect(() => {
    trackPageView(cluster);
    // @ts-ignore
    history.listen(trackPageView);
  }, [history, cluster]);

  return (
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
            <VerticalNav routes={routes.slice(5)} classes="hidden sm:flex w-72" />
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
  );
};

export default App;
