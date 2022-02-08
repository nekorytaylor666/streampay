import { Link } from "./index";

const Footer = () => (
  <footer className="pb-4 text-center text-sm font-mono text-gray-400 mt-10 sm:mt-28">
    <small className="block mt-1">
      <Link url="https://streamflow.finance" title="StreamFlow Finance" />
    </small>
    <small className="block mt-2 text-gray-400 px-2">
      Streamflow is undergoing security audit.
    </small>
  </footer>
);

export default Footer;
