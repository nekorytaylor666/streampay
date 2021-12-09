import { Switch, Route, Redirect } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import { Footer, Header, Nav } from "./components";
import { Page404 } from "./pages";
import routes from "./RoutesConfig";

const App = () => (
  <div className="min-h-screen flex flex-col">
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

export default App;
