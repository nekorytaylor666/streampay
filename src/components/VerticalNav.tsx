import { NavLink, useLocation } from "react-router-dom";

import { Route } from "../router/RoutesConfig";

interface NavProps {
  routes: Route[];
}

const VerticalNav: React.FC<NavProps> = ({ routes }) => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="hidden sm:flex flex-col w-72 pl-6 pt-6">
      <ul className="text-gray-light">
        {routes.map((route) => (
          <li key={route.path} className="relative flex items-center mb-8">
            <NavLink
              to={route.path}
              className={(isActive) =>
                `text-sm sm:text-base capitalize mr-2 sm:mr-3 font-semibold flex items-center relative ${
                  isActive ? "text-blue" : "text-gray-light"
                } ${route.disabled ? "pointer-events-none text-gray" : ""}`
              }
              activeClassName="text-blue"
            >
              {route.Icon && (
                <route.Icon
                  fill={path === route.path ? "#fff" : "#718298"}
                  classes={`rounded-lg mr-3 ${path === route.path ? "bg-blue" : "bg-gray-dark"}`}
                />
              )}
              {route.label}
              {route.disabled && <p className="text-xxs ml-1 mb-1 text-orange-700">Soon</p>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default VerticalNav;
