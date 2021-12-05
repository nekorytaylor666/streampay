import { Link } from "./index";

const Footer = () => (
  <footer className="pb-4 text-center text-sm font-mono text-gray-400 mt-10 sm:mt-28">
    <div className="flex justify-center items-center mx-auto">
      <img
        src="https://solana.com/branding/horizontal/logo-horizontal-gradient-dark.png"
        className="h-6 md:h-8 mr-8"
        alt="Solana logo"
        loading="lazy"
      />

      <img
        src="img/serum-logo-white.svg"
        className="h-8 md:h-10"
        alt="Project Serum logo"
        loading="lazy"
      />
    </div>
    <small className="block mt-1">
      <Link url="https://streamflow.finance" title="StreamFlow Finance" />
    </small>
    <small className="block mt-2 text-gray-400 px-2">
      This is (still) unaudited software. Please proceed with caution.
    </small>
  </footer>
);

export default Footer;
