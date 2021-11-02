import { FC } from "react";

import { NavLink } from "react-router-dom";

import routes from "../RoutesConfig";

interface NavProps {
  classes?: string;
}

const Nav: FC<NavProps> = ({ classes }) => (
  <nav className={classes}>
    <ul className="text-center text-gray-400 flex justify-center">
      {routes.slice(1).map((route) => (
        <li key={route.path}>
          <NavLink
            to={route.path}
            className="text-sm sm:text-base capitalize mx-3 sm:mx-5"
            activeClassName="text-white"
          >
            {route.label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);

export default Nav;
