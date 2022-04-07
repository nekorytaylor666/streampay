import { format, getUnixTime } from "date-fns";
import { QuestionMarkCircleIcon } from "@heroicons/react/outline";
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
  classes?: string;
}

const Overview: React.FC<OverviewProps> = ({
  depositedAmount,
  releaseAmount,
  tokenSymbol,
  startDate,
  startTime,
  releaseFrequencyCounter,
  releaseFrequencyPeriod,
  classes,
}) => {
  const start = getUnixTime(new Date(startDate + "T" + startTime)); // gives us seconds
  const releasePeriod = releaseFrequencyCounter * releaseFrequencyPeriod;
  const end = start + Math.ceil(depositedAmount / releaseAmount) * releasePeriod;
  const formattedReleasePeriod = formatPeriodOfTime(releasePeriod);
  const isReleasePerMonth = formattedReleasePeriod?.includes("month");
  const isReleasePerYear = formattedReleasePeriod?.includes("year");

  return (
    <div className={`${classes} col-span-full mt-4 leading-6 mb-7`}>
      <div className="bg-gray-dark p-5 rounded-md">
        <label className="text-gray-light text-base font-bold block mb-3">Overview</label>
        <p className="text-gray-light text-sm leading-6">
          Stream starts on
          {start ? (
            <span className="text-gray-light text-sm font-bold">{` ${startDate} `}</span>
          ) : (
            <span> ____ </span>
          )}
          at
          <span className="text-gray-light text-sm font-bold">{` ${startTime}`}</span>.
        </p>
        <p className="text-gray-light text-sm leading-6 sm:inline-block">
          <span className="text-gray-light text-sm font-bold">{` ${
            releaseAmount || 0
          } ${tokenSymbol} `}</span>
          released every
          {releaseFrequencyCounter ? (
            <>
              <span className="text-gray-light text-sm font-bold">{` ${formattedReleasePeriod}. `}</span>
              {(isReleasePerMonth || isReleasePerYear) && (
                <>
                  <QuestionMarkCircleIcon
                    className="h-3.5 w-3.5 inline mb-2 cursor-pointer text-blue"
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
                        : "A month is approximated to 30.4167 days."}
                    </span>
                  </ReactTooltip>
                </>
              )}
            </>
          ) : (
            <span> _____. </span>
          )}
        </p>
        <p className="text-gray-light text-sm leading-6">
          Ends on
          {depositedAmount && releaseAmount > 0 && start && releaseFrequencyCounter ? (
            <span className="text-gray-light text-sm font-bold">{` ${format(
              new Date(end * 1000),
              "ccc do MMM, yyyy - HH:mm"
            )}`}</span>
          ) : (
            <span> _____ </span>
          )}
          , <br className="sm:hidden" />
          unless topped up.
        </p>
      </div>
      <label className="text-white text-base font-bold block mt-6">Streamflow Finance fees</label>
      <p className="text-gray-light text-xs leading-4 mt-3">
        Streamflow charges 0.25% service fee (
        <span className="font-bold">{` ${roundAmount(
          depositedAmount * 0.0025
        )} ${tokenSymbol} `}</span>
        ) on top of the specified amount, while respecting the given schedule.{" "}
        <Link
          title="Learn more."
          url="https://docs.streamflow.finance/help/fees"
          classes="inline-block text-p3 text-blue"
        />
      </p>
      <p className="text-white text-xs block mt-6">
        Need a custom deal?{" "}
        <Link
          title="Contact us"
          url="discord.gg/9yyr8UBZjr"
          classes="inline-block text-p3 text-blue"
        />
      </p>
    </div>
  );
};

export default Overview;
