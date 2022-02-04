import { format, getUnixTime } from "date-fns";
import { ExternalLinkIcon, QuestionMarkCircleIcon } from "@heroicons/react/outline";
import ReactTooltip from "react-tooltip";

import { formatPeriodOfTime, roundAmount, calculateEndTimeLikeOnBE } from "../../utils/helpers";
import { Link } from "../../components";
import { calculateReleaseRate } from "../../components/StreamCard/helpers";

interface OverviewProps {
  amount: number;
  tokenSymbol: string;
  endDate: string;
  endTime: string;
  cliffDate: string;
  cliffTime: string;
  cliffAmount: number;
  releaseFrequencyCounter: number;
  releaseFrequencyPeriod: number;
  decimals: number;
}

const Overview: React.FC<OverviewProps> = ({
  amount,
  tokenSymbol,
  endDate,
  endTime,
  cliffDate,
  cliffTime,
  cliffAmount: cliffAmountPercent,
  releaseFrequencyCounter,
  releaseFrequencyPeriod,
  decimals,
}) => {
  const releasePeriod = releaseFrequencyCounter * releaseFrequencyPeriod;
  const end = getUnixTime(new Date(endDate + "T" + endTime));
  const cliff = getUnixTime(new Date(cliffDate + "T" + cliffTime));
  const cliffAmount = (cliffAmountPercent * amount) / 100;
  const amountPerPeriod = calculateReleaseRate(
    end,
    cliff,
    amount,
    cliffAmount,
    releasePeriod,
    decimals
  );

  const amountPerPeriodPercent = (amountPerPeriod * 100) / amount;
  const formattedReleasePeriod = formatPeriodOfTime(releasePeriod);
  const isReleasePerMonth = formattedReleasePeriod?.includes("month");
  const isReleasePerYear = formattedReleasePeriod?.includes("year");
  const { periods, endTimeFromBE } = calculateEndTimeLikeOnBE({
    cliff,
    cliffAmount,
    depositedAmount: amount,
    period: Math.floor(releasePeriod),
    amountPerPeriod,
  });

  const showEndTimeTooltip = end && endTimeFromBE && end * 1000 !== endTimeFromBE;

  return (
    <div className="col-span-full mt-4 leading-6">
      <h3 className="font-bold text-lg text-white mb-3">Overview:</h3>
      <p className="text-gray-400 text-sm leading-6">
        First
        <span className="text-gray-100 text-sm">
          {` ${cliffAmountPercent}% (${cliffAmount.toFixed(3)} ${tokenSymbol}) `}
        </span>
        <br className="sm:hidden" />
        released on
        {cliff ? (
          <span className="text-gray-100 text-sm">{` ${cliffDate} `}</span>
        ) : (
          <span> ____ </span>
        )}
        at
        <span className="text-gray-100 text-sm">{` ${cliffTime}`}</span>.
      </p>
      <p className="text-gray-400 text-sm leading-6 sm:inline-block">
        And then
        <span className="text-gray-100 text-sm">{` ${amountPerPeriodPercent.toFixed(
          3
        )}% (${amountPerPeriod.toFixed(3)} ${tokenSymbol}) `}</span>
        <br className="sm:hidden" />
        released every
        {releaseFrequencyCounter ? (
          <>
            <span className="text-gray-100 text-sm">{` ${formattedReleasePeriod}. `}</span>
            {(isReleasePerMonth || isReleasePerYear) && (
              <>
                <QuestionMarkCircleIcon
                  className="h-3.5 w-3.5  inline mb-2 cursor-pointer text-primary"
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
          <span> _____ </span>
        )}
        <br />
        until
        {endTimeFromBE ? (
          <>
            <span className="text-gray-100 text-sm">{` ${format(
              new Date(endTimeFromBE),
              "ccc do MMM, yyyy - HH:mm"
            )}. `}</span>
            {!!showEndTimeTooltip && (
              <>
                <QuestionMarkCircleIcon
                  className="h-3.5 w-3.5 inline mb-2 cursor-pointer text-primary"
                  data-tip
                  data-for="endTimeTooltip"
                />
                <ReactTooltip
                  id="endTimeTooltip"
                  type="info"
                  effect="solid"
                  place="top"
                  backgroundColor="#18A2D9"
                >
                  <span className="inline-block">
                    {`Stream ends after ${periods} ${periods > 1 ? "periods" : "period"}`}{" "}
                  </span>
                  <span className="inline-block">{`( ${periods} x ${formattedReleasePeriod} ). `}</span>
                </ReactTooltip>
              </>
            )}
          </>
        ) : (
          <span className="text-gray-100 text-sm">{` ${format(
            new Date(end * 1000),
            "ccc do MMM, yyyy - HH:mm"
          )}. `}</span>
        )}
      </p>
      <p className="text-gray-400 text-xxs leading-4 mt-6">
        {`Streamflow charges 0.25% service fee (${roundAmount(
          amount * 0.0025,
          0,
          3
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
