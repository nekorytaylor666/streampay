import { useEffect } from "react";

import { Switch, Route, Redirect, useHistory } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import { trackPageView } from "./utils/marketing_helpers";
import { Footer, Header, Nav, Banner } from "./components";
import { Page404 } from "./pages";
import routes from "./RoutesConfig";

const App = () => {
  const history = useHistory();

  useEffect(() => {
    trackPageView();
    history.listen(trackPageView);
  }, [history]);

  return (
    <div className="min-h-screen flex flex-col">
      <Banner title="You are on Streamflow devnet!" classes="top-0 left-0 w-full"></Banner>
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
