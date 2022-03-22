import { format, getUnixTime } from "date-fns";
import { QuestionMarkCircleIcon } from "@heroicons/react/outline";
import ReactTooltip from "react-tooltip";

import { formatPeriodOfTime, roundAmount, calculateEndTimeLikeOnBE } from "../../utils/helpers";
import { Link, Tooltip } from "../../components";
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

  classes?: string;
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
  classes,
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
    cliffAmount: parseFloat(cliffAmount.toFixed(decimals)),
    depositedAmount: amount,
    period: Math.floor(releasePeriod),
    amountPerPeriod,
  });

  const showEndTimeTooltip = end && endTimeFromBE && end * 1000 !== endTimeFromBE;

  return (
    <div className={`${classes} col-span-full mt-1 leading-6`}>
      <div className="bg-gray-dark p-5 rounded-lg">
        <label className="text-gray-light text-base font-bold block mb-3">Overview</label>
        <p className="text-gray-light text-sm leading-6">
          First
          <span className="text-gray-light text-sm font-bold">
            {` ${cliffAmountPercent}% (${cliffAmount.toFixed(2)} ${tokenSymbol}) `}
          </span>
          <br className="sm:hidden" />
          released on
          {cliff ? (
            <span className="text-gray-light text-sm font-bold">{` ${cliffDate} `}</span>
          ) : (
            <span> ____ </span>
          )}
          at
          <span className="text-gray-light text-sm font-bold">{` ${cliffTime}`}</span>.
        </p>
        <p className="text-gray-light text-sm leading-6 sm:inline-block">
          And then
          <span className="text-gray-light text-sm font-bold">{` ${amountPerPeriodPercent.toFixed(
            2
          )}% (${amountPerPeriod.toFixed(2)} ${tokenSymbol}) `}</span>
          <br className="sm:hidden" />
          released every
          {releaseFrequencyCounter ? (
            <>
              <span className="text-gray-light text-sm font-bold">{` ${formattedReleasePeriod}. `}</span>
              {(isReleasePerMonth || isReleasePerYear) && (
                <Tooltip
                  id="overviewInfo"
                  content={
                    isReleasePerYear
                      ? "We assume that year has 365 days."
                      : "A month is approximated to 30.4167 days."
                  }
                />
              )}
            </>
          ) : (
            <span> _____ </span>
          )}
          <br />
          until
          {endTimeFromBE ? (
            <>
              <span className="text-gray-light text-sm font-bold">{` ${format(
                new Date(endTimeFromBE),
                "ccc do MMM, yyyy - HH:mm"
              )}. `}</span>
              {!!showEndTimeTooltip && (
                <>
                  <QuestionMarkCircleIcon
                    className="h-3.5 w-3.5 inline mb-2 cursor-pointer text-blue"
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
            <span className="text-gray-light text-sm font-bold">{` ${format(
              new Date(end * 1000),
              "ccc do MMM, yyyy - HH:mm"
            )}. `}</span>
          )}
        </p>
      </div>
      <label className="text-white text-base font-bold block mt-6">Streamflow Finance Fee</label>
      <p className="text-gray-light text-xs leading-4 mt-3">
        Streamflow charges 0.25% service fee (
        <span className="font-bold">{` ${roundAmount(amount * 0.0025)} ${tokenSymbol} `}</span>) on
        top of the specified amount, while respecting the given schedule.{" "}
      </p>
      <Link
        title="Learn more."
        url="https://docs.streamflow.finance/help/fees"
        classes="inline-block text-p3 text-blue"
      />
      <p className="text-white text-xs block mt-6">
        Need a custom deal?{" "}
        <Link
          title="Contact us"
          url="https://discordapp.com/channels/851921970169511976/888391406576627732"
          classes="inline-block text-p3 text-blue"
        />
      </p>
    </div>
  );
};

export default Overview;
