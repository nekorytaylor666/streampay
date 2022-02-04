import { format, getUnixTime } from "date-fns";
import { ExternalLinkIcon, QuestionMarkCircleIcon } from "@heroicons/react/outline";
import ReactTooltip from "react-tooltip";

import { Link } from "../../components";
import { formatPeriodOfTime, roundAmount } from "../../utils/helpers";

interface OverviewProps {
  releaseAmount: number;
  tokenSymbol: string;
  startDate: string;
  startTime: string;
  depositedAmount: number;
  releaseFrequencyCounter: number;
  releaseFrequencyPeriod: number;
}

const Overview: React.FC<OverviewProps> = ({
  depositedAmount,
  releaseAmount,
  tokenSymbol,
  startDate,
  startTime,
  releaseFrequencyCounter,
  releaseFrequencyPeriod,
}) => {
  const start = getUnixTime(new Date(startDate + "T" + startTime)); // gives us seconds
  const releasePeriod = releaseFrequencyCounter * releaseFrequencyPeriod;
  const end = (start + Math.ceil(depositedAmount / releaseAmount) * releasePeriod) * 1000; // convert to ms
  const formattedReleasePeriod = formatPeriodOfTime(releasePeriod);
  const isReleasePerMonth = formattedReleasePeriod?.includes("month");
  const isReleasePerYear = formattedReleasePeriod?.includes("year");

  return (
    <div className="col-span-full mt-4 leading-6">
      <h3 className="font-bold text-lg text-white mb-3">Overview:</h3>
      <p className="text-gray-400 text-sm leading-6">
        Stream starts on
        {start ? (
          <span className="text-gray-100 text-sm">{` ${startDate} `}</span>
        ) : (
          <span> ____ </span>
        )}
        at
        <span className="text-gray-100 text-sm">{` ${startTime}`}</span>.
      </p>
      <p className="text-gray-400 text-sm leading-6 sm:inline-block">
        <span className="text-gray-100 text-sm">{` ${releaseAmount || 0} ${tokenSymbol} `}</span>
        released every
        {releaseFrequencyCounter ? (
          <>
            <span className="text-gray-100 text-sm">{` ${formattedReleasePeriod}. `}</span>
            {(isReleasePerMonth || isReleasePerYear) && (
              <>
                <QuestionMarkCircleIcon
                  className="h-3.5 w-3.5 inline mb-2 cursor-pointer text-primary"
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
                  <span>
                    {isReleasePerYear
                      ? "We assume that year has 365 days."
                      : "A month is equal to 30.4167 days, as this version doesn't use calendar."}
                  </span>
                </ReactTooltip>
              </>
            )}
          </>
        ) : (
          <span> _____. </span>
        )}
      </p>
      <p className="text-gray-400 text-sm leading-6">
        Ends on
        {depositedAmount && releaseAmount > 0 && start && releaseFrequencyCounter ? (
          <span className="text-gray-100 text-sm">{` ${format(
            new Date(end),
            "ccc do MMM, yyyy - HH:mm"
          )}`}</span>
        ) : (
          <span> _____ </span>
        )}
        , <br className="sm:hidden" />
        unless topped up.
      </p>
      <p className="text-gray-400 text-xxs leading-4 mt-6">
        {`Streamflow charges 0.25% service fee (${roundAmount(
          depositedAmount * 0.0025
        )} ${tokenSymbol}) on top of the
        specified amount, while respecting the given schedule. `}
        <Link
          title="Learn more."
          url="https://docs.streamflow.finance/help/fees"
          Icon={ExternalLinkIcon}
          classes="text-primary inline-block"
        />
      </p>
    </div>
  );
};

export default Overview;
