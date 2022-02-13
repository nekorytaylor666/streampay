import { Link } from "./index";

const Footer = () => (
  <footer className="pb-4 text-center text-sm font-mono text-gray-400 mt-10 sm:mt-28">
    <small className="block mt-2 text-gray-400 px-2">
      <Link url="https://streamflow.finance" title="StreamFlow" /> is undergoing security audit.
    </small>
  </footer>
);

export default Footer;
