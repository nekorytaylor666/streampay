import { Link } from "react-router-dom";

import { IcnLogo } from "../assets/icons";

interface NoStreamsParams {
  title?: string;
  subtitle?: string;
}

const NoStreams: React.FC<NoStreamsParams> = ({ title, subtitle }) => (
  <div className="flex flex-col items-center">
    <IcnLogo fill="rgb(113, 130, 152)" classes="w-14 h-14 mt-10 bg-gray-dark rounded-lg mb-6" />{" "}
    {title && <h3 className="text-white font-semibold mb-2">{title}</h3>}
    {subtitle && <p className="text-gray-light text-p2">{subtitle}</p>}
    <Link
      className="bg-blue py-2 px-4 font-semibold my-5 text-p text-white rounded-lg hover:cursor-pointer"
      to="/new-vesting"
    >
      New Stream
    </Link>
  </div>
);

export default NoStreams;
