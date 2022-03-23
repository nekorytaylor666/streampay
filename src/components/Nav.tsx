import { NavLink } from "react-router-dom";
import cx from "classnames";
import ReactTooltip from "react-tooltip";
import { QuestionMarkCircleIcon } from "@heroicons/react/outline";

import routes from "../router/RoutesConfig";

const Tooltip = () => (
  <div className="absolute right-1">
    <QuestionMarkCircleIcon
      className="h-3 w-3 inline mb-2 cursor-pointer text-blue"
      data-tip
      data-for="overviewTooltip"
    />
    <ReactTooltip
      id="overviewTooltip"
      type="info"
      effect="solid"
      place="bottom"
      backgroundColor="#18A2D9"
    >
      <span>Coming soon!</span>
    </ReactTooltip>
  </div>
);

interface NavProps {
  classes?: string;
}

const Nav: React.FC<NavProps> = ({ classes }) => (
  <nav className={classes}>
    <ul className="text-gray-light flex">
      {routes.slice(3, 5).map((route) => (
        <li key={route.path} className="relative">
          {route.disabled && <Tooltip />}
          <NavLink
            to={route.path}
            className={cx("text-sm sm:text-base capitalize mx-3 sm:mx-5 font-semibold", {
              "pointer-events-none": route.disabled,
            })}
            activeClassName="text-blue"
          >
            {route.label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);

export default Nav;
