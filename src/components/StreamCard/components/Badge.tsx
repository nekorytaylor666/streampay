import { FC } from "react";

interface BadgeProps {
  type: string;
  color: string;
  classes?: string;
}

const Badge: FC<BadgeProps> = ({ type, color, classes }) => (
  <div className={classes}>
    <span
      className={`px-2 py-1 rounded-lg text-xs font-medium bg-${color}-200 text-${color} capitalize`}
    >
      {type.toUpperCase()}
    </span>
  </div>
);

export default Badge;
