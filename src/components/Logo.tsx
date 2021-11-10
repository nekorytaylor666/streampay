import { FC } from "react";

interface LogoProps {
  src: string;
}

const Logo: FC<LogoProps> = ({ src }) => (
  <div className="text-white mt-1">
    <h1 className="text-xl sm:text-2xl">
      <img src={src} alt="StreamFlow Finance logo" className="w-10 mr-1 inline-block" />
      Stream<strong>Flow</strong>
    </h1>
  </div>
);

export default Logo;
