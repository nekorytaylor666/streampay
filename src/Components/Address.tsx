import { useState, FC } from "react";

import { DuplicateIcon, CheckIcon } from "@heroicons/react/outline";
import cx from "classnames";

import { copyToClipboard } from "../utils/helpers";

interface AddressProps {
  address: string;
  classes: string;
}

const iconClassName = "h-4 inline mr-1 cursor-pointer hover:opacity-80 align-text-bottom ";

const Address: FC<AddressProps> = ({ address, classes }) => {
  const [copied, setCopied] = useState(false);

  function copy() {
    copyToClipboard(address);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  }

  return (
    <span className={cx("block truncate", classes)}>
      {copied ? (
        <span className="text-green-300 mr-1">
          <CheckIcon className={iconClassName} />
          <small>Copied!</small>
        </span>
      ) : (
        <DuplicateIcon className={iconClassName} onClick={copy} />
      )}
      {address}
    </span>
  );
};

export default Address;
