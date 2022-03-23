import { FC } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faCircleCheck, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { ExternalLinkIcon } from "@heroicons/react/outline";

import Link from "./Link";

type ToastType = "success" | "info" | "error";

interface MsgToastProps {
  title?: string;
  message?: string;
  type: ToastType;
  url?: string;
}

const toastColor = { success: "green", error: "red", info: "yellow" };
const toastIcon = {
  success: (
    <FontAwesomeIcon icon={faCircleCheck} className="ml-1 mt-px w-5 h-5 mr-3 inline text-green" />
  ),
  error: (
    <FontAwesomeIcon icon={faCircleXmark} className="ml-1 mt-px w-5 h-5 mr-3 inline text-red" />
  ),
  info: (
    <FontAwesomeIcon icon={faCircleInfo} className="ml-1 mt-px w-5 h-5 mr-3 inline text-yellow" />
  ),
};

const MsgToast: FC<MsgToastProps> = ({ title, message, type, url }) => (
  <div className="flex">
    {toastIcon[type]}
    <div>
      <h3 className={`font-bold text-${toastColor[type]}`}>{title}</h3>
      <p className="text-white text-p2">{message}</p>
      {url && (
        <Link
          url={url}
          Icon={ExternalLinkIcon}
          classes="text-p font-bold text-green"
          title="View on Explorer"
        />
      )}
    </div>
  </div>
);

export default MsgToast;
