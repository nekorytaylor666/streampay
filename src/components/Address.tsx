import { useState, FC } from "react";

import { DuplicateIcon, CheckIcon } from "@heroicons/react/outline";
import cx from "classnames";

import { copyToClipboard } from "../utils/helpers";

interface AddressProps {
  address: string;
  classes: string;
}

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
        <span className="text-green mr-1">
          <CheckIcon className="h-4 inline mr-1 align-text-bottom" />
          <small>Copied!</small>
        </span>
      ) : (
        <DuplicateIcon
          className="h-4 inline mr-1 align-text-bottom hover:opacity-60 cursor-pointer"
          onClick={copy}
        />
      )}
      <span className="font-light text-base ">{address}</span>
    </span>
  );
};

export default Address;
