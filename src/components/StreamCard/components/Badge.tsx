import { FC } from "react";

import cx from "classnames";

interface BadgeProps {
  type: string;
  color: string;
  classes?: string;
}

const Badge: FC<BadgeProps> = ({ type, color, classes }) => (
  <div className={cx("inline", classes)}>
    <span
      className={`align-top px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 capitalize`}
    >
      <svg
        className={`mr-1 -ml-1 inline align-baseline h-2 w-2 text-${color}-400`}
        fill="currentColor"
        viewBox="0 0 8 8"
      >
        <circle cx={4} cy={4} r={3} />
      </svg>
      {type}
    </span>
  </div>
);

export default Badge;
