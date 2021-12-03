import { FC } from "react";

import cx from "classnames";

interface LinkProps {
  url: string;
  title?: string;
  classes?: string;
  Icon?: any;
}

const Link: FC<LinkProps> = ({ url, title, Icon, classes }) => (
  <p className={cx("text-gray-200", classes)}>
    {Icon ? (
      <>
        {title || url}
        <a href={url} target="_blank" rel="noopener noreferrer">
          <sup>
            <Icon className="w-3 h-3 inline hover:opacity-60" />
          </sup>
        </a>
      </>
    ) : (
      <a href={url} target="_blank" rel="noopener noreferrer" className="hover:opacity-60">
        {title || url}
      </a>
    )}
  </p>
);

export default Link;
