import { Component } from "react";

import { XIcon } from "@heroicons/react/outline";
import cx from "classnames";

import Link from "./Link";

interface BannerProps {
  title?: string;
  message?: string;
  classes?: string;
  navigateTo?: string;
}
interface BannerState {
  hidden: boolean;
}

//could be functional component, but we decided to let it manage its own state (open/close)
export default class Banner extends Component<BannerProps, BannerState> {
  state = {
    hidden: false,
  };

  render() {
    return (
      <div className={cx(this.props.classes, `bg-primary ${this.state.hidden && "hidden"}`)}>
        <div className="mx-auto py-2 px-3 sm:px-6 lg:px-8">
          <div className="pr-16 sm:text-center sm:px-16">
            {this.props.navigateTo ? (
              <Link
                classes="text-white font-semibold"
                url={this.props.navigateTo}
                title={this.props.title}
              ></Link>
            ) : (
              <p> {this.props.title}</p>
            )}
          </div>
          <div className="absolute inset-y-0 right-0 pt-1 pr-1 flex items-start sm:pt-1 sm:pr-2 sm:items-start">
            <button
              type="button"
              onClick={() => this.setState({ hidden: true })}
              className="flex py-2 px-2.5 rounded-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-white"
            >
              <span className="sr-only">Dismiss</span>
              <XIcon className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}
