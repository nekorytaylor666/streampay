import { FC, ReactElement } from "react";

import ReactTooltip from "react-tooltip";

interface TooltipProps {
  content: string | FC | ReactElement;
  id: string;
}

const Tooltip: FC<TooltipProps> = ({ id, content }) => (
  <ReactTooltip id={id} type="info" effect="solid" place="top" backgroundColor="rgb(19, 23, 34)">
    {content}
  </ReactTooltip>
);

export default Tooltip;
