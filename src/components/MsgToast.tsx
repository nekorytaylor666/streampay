import { Component } from "react";

import { CheckCircleIcon } from "@heroicons/react/solid";
import { InformationCircleIcon } from "@heroicons/react/solid";
import { XCircleIcon } from "@heroicons/react/solid";

interface MsgToastProps {
  title?: string;
  message?: string;
  classes: string;
  type?: string;
}

export default class MsgToast extends Component<MsgToastProps> {
  render() {
    let icon = null;
    switch (this.props.type) {
      case "error":
        icon = <XCircleIcon className="ml-1 w-6 h-6 mr-3 inline" />;
        break;
      case "success":
        icon = <CheckCircleIcon className="ml-1 w-6 h-6 mr-3 inline" />;
        break;
      case "info":
        icon = <InformationCircleIcon className="ml-1 w-6 h-6 mr-3 inline" />;
        break;
      default:
        icon = null;
        return icon;
    }

    return (
      <div className={`flex ${this.props.classes}`}>
        {icon}
        <div>
          <h3 className="font-bold text-base">{this.props.title}</h3>
          <p className="font-normal text-sm">{this.props.message}</p>
        </div>
      </div>
    );
  }
}
