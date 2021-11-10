import { FC } from "react";

import cx from "classnames";

interface CurtainProps {
  visible: boolean;
}

const Curtain: FC<CurtainProps> = ({ visible }) => (
  <div
    className={cx(
      "fixed top-0 bottom-0 left-0 right-0 bg-gray-900 opacity-90 z-10",
      visible ? "block" : "hidden"
    )}
  >
    <div className="loader" />
  </div>
);

export default Curtain;
