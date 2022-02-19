import { FC } from "react";

import Link from "./Link";

const Footer: FC = () => (
  <footer className="p-6 pb-8 text-center bg-dark text-p3">
    <p className="text-gray-light text-p3">
      Protocol code and audit report available.{" "}
      <Link
        url="https://github.com/streamflow-finance/js-sdk"
        title="Learn more"
        classes="text-p3 text-blue"
      />
    </p>
  </footer>
);

export default Footer;
