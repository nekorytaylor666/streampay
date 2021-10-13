import { Link } from "./index";

export default function Footer() {
  return (
    <footer className="mt-40 mb-4 text-center text-sm font-mono text-gray-400">
      <div className="max-w-40 inline-block">
        <img
          src="https://solana.com/branding/horizontal/logo-horizontal-gradient-dark.png"
          className="h-8 mx-auto my-2"
          alt="Solana logo"
          loading="lazy"
        />
      </div>
      <div className="max-w-42 inline-block ml-6">
        <img
          src="img/serum-logo-white.svg"
          className="h-10 mx-auto mb-1"
          alt="Project Serum logo"
          loading="lazy"
        />
      </div>
      <small className="block mt-4">
        {/*Copyleft{" "}*/}
        {/*<span className="inline-block" style={{ transform: "rotate(180deg)" }}>*/}
        {/*  &copy;*/}
        {/*</span>{" "}*/}
        {/*2021,{" "}*/}
        <Link
          url="https://streamflow.finance"
          title="StreamFlow Finance"
          hideIcon={true}
        />
        {/*<br />*/}
        {/*<small>*/}
        {/*  Code available under{" "}*/}
        {/*  <Link*/}
        {/*    url="https://www.gnu.org/licenses/agpl-3.0.en.html"*/}
        {/*    title="AGPLv3"*/}
        {/*    hideIcon={true}*/}
        {/*  />*/}
        {/*</small>*/}
      </small>
    </footer>
  );
}
