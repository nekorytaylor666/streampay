import { FC } from "react";

import { Link } from "./";

const Footer: FC = () => (
  <footer className="p-6 pb-8 text-center bg-dark text-p3">
    <p className="text-gray-light text-p3">
      Streamflow is{" "}
      <Link
        title="audited"
        url="https://github.com/streamflow-finance/rust-sdk/blob/main/protocol_audit.pdf"
        classes="inline-block text-p3 text-blue"
      />
      .
    </p>
  </footer>
);

export default Footer;
