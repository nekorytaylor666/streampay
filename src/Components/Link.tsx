import { FC } from "react";

import { ExternalLinkIcon } from "@heroicons/react/outline";

interface LinkProps {
  url: string;
  title?: string;
  hideIcon?: boolean;
}

const Link: FC<LinkProps> = ({ url, title, hideIcon }) => {
  const icon = hideIcon || (
    <sup>
      <ExternalLinkIcon className="w-3 h-3 inline" />
    </sup>
  );

  return (
    <strong className="text-gray-300 hover:text-white">
      <a href={url} target="_blank" rel="noopener noreferrer">
        {title || url}
        {icon}
      </a>
    </strong>
  );
};

export default Link;
