import { FC } from "react";

import cx from "classnames";

import { WalletAdapter } from "../types";

interface LogoProps {
  src: string;
  classes?: string;
  wallet: WalletAdapter | null;
}

const Logo: FC<LogoProps> = ({ src, classes, wallet }) => (
  <div className={cx(classes, "text-white flex-grow")}>
    <h1 className="flex text-xl sm:text-2xl">
      <img src={src} alt="Streamflow Finance logo" className="inline-block mr-3 w-10 h-10" />
      {wallet?.connected && (
        <div className="hidden sm:flex flex-col font-bold text-lg leading-5 mt-0.5">
          Streamflow
          <span className="text-sf-blue tracking-widest-1 text-xxs-2 uppercase font-normal leading-5">
            Finance
          </span>
        </div>
      )}
      {!wallet?.connected && (
        <div className="flex flex-col font-bold text-lg leading-5 mt-0.5">
          Streamflow
          <span className="text-sf-blue tracking-widest-1 text-xxs-2 uppercase font-normal leading-5">
            Finance
          </span>
        </div>
      )}
    </h1>
  </div>
);

export default Logo;
