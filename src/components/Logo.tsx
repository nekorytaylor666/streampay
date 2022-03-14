import { FC } from "react";

import cx from "classnames";

interface LogoProps {
  src: string;
  classes?: string;
}

const Logo: FC<LogoProps> = ({ src, classes }) => (
  <div className={cx(classes, "text-white")}>
    <h1 className="flex text-xl sm:text-2xl">
      <img src={src} alt="Streamflow Finance logo" className="inline-block mr-3 w-40px h-40px" />
      <div className="flex flex-col font-bold text-lg leading-5">
        Streamflow
        <span className="text-sf-blue tracking-widest-1 text-xxs-2 uppercase font-normal leading-5">
          Finance
        </span>
      </div>
    </h1>
  </div>
);

export default Logo;
