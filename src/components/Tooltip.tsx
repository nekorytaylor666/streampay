import { FC } from "react";

import { QuestionMarkCircleIcon } from "@heroicons/react/outline";
import ReactTooltip from "react-tooltip";

interface TooltipProps {
  content: string;
}

const Tooltip: FC<TooltipProps> = ({ content }) => (
  <>
    <QuestionMarkCircleIcon
      className="h-3.5 w-3.5  inline mb-2 cursor-pointer text-blue"
      data-tip
      data-for="overviewTooltip"
    />
    <ReactTooltip
      id="overviewTooltip"
      type="info"
      effect="solid"
      place="top"
      backgroundColor="#18A2D9"
    >
      <span>{{ content }}</span>
    </ReactTooltip>
  </>
);
export default Tooltip;
