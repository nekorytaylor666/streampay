import { NavLink } from "react-router-dom";

import { Route } from "../router/RoutesConfig";

interface NavProps {
  routes: Route[];
}

const VerticalNav: React.FC<NavProps> = ({ routes }) => (
  <nav className="flex flex-col w-72 pl-6 pt-6">
    <ul className="text-gray-light">
      {routes.map((route) => (
        <li key={route.path} className="relative flex items-center mb-8">
          {route.Icon && <route.Icon fill="#718298" classes="rounded-lg bg-gray-dark" />}
          <NavLink
            to={route.path}
            className={"text-sm sm:text-base capitalize mx-2 sm:mx-3 font-semibold"}
            activeClassName="text-white"
          >
            {route.label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);

export default VerticalNav;
