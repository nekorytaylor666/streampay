import { FC, ElementType } from "react";

import cx from "classnames";

interface LinkProps {
  url: string;
  title?: string;
  classes?: string;
  Icon?: ElementType;
}

const Link: FC<LinkProps> = ({ url, title, Icon, classes }) => (
  <span className={cx("text-blue", classes)}>
    {Icon ? (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {title || url}
        <sup>
          <Icon className="w-3 h-3 inline hover:opacity-60" />
        </sup>
      </a>
    ) : (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-60 text-blue"
      >
        {title || url}
      </a>
    )}
  </span>
);

export default Link;
