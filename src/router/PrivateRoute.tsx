import { Route, Redirect } from "react-router-dom";

interface PrivateRouteProps {
  isAuthenticated: boolean;
  path: string;
  exact?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ isAuthenticated, children, ...rest }) => (
  <Route {...rest} render={() => (isAuthenticated ? children : <Redirect to="/" />)} />
);

export default PrivateRoute;
