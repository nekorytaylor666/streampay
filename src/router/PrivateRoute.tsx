import { FC, ElementType } from "react";

import { Route, Redirect } from "react-router-dom";

interface PrivateRouteProps {
  Component: ElementType;
  isAuthenticated: boolean;
  path: string;
  exact?: boolean;
}

const PrivateRoute: FC<PrivateRouteProps> = ({ Component, isAuthenticated, ...rest }) => (
  <Route {...rest} render={() => (isAuthenticated ? <Component /> : <Redirect to="/" />)} />
);

export default PrivateRoute;
