import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import { Footer, Header, Nav } from "./components";
import routes from "./RoutesConfig";

const App = () => (
  <div className="min-h-screen flex flex-col">
    <div className="bg-blend-darken flex-grow px-3.5 sm:px-5">
      <Router>
        <Header />
        <Nav classes="block lg:hidden" />
        <Switch>
          {routes.map(({ path, exact, redirect, Component }) => (
            <Route
              key={path}
              path={path}
              exact={exact}
              render={() => (redirect ? <Redirect to={redirect} /> : <Component />)}
            />
          ))}
        </Switch>
      </Router>
    </div>
    <ToastContainer hideProgressBar position="bottom-left" limit={5} />
    <Footer />
  </div>
);

export default App;
