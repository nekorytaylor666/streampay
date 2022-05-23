import { useState } from "react";

import { format, getUnixTime } from "date-fns";
import { QuestionMarkCircleIcon } from "@heroicons/react/outline";
import ReactTooltip from "react-tooltip";

import { formatPeriodOfTime, calculateEndTimeLikeOnBE } from "../../utils/helpers";
import { Tooltip } from "../../components";
import { calculateReleaseRate } from "../../components/StreamCard/helpers";
import { Recipient } from "../../types";
import { IcnArrowDown, IcnArrowRight } from "../../assets/icons";

interface OverviewProps {
  recipients: Recipient[];
  tokenSymbol: string;
  endDate: string;
  endTime: string;
  cliffDate: string;
  cliffTime: string;
  releaseFrequencyCounter: number;
  releaseFrequencyPeriod: number;
  decimals: number;
  cliffAmount: number;
  classes?: string;
}

interface RecipientOverviewProps {
  recipient: Recipient;
  releasePeriod: number;
  endDate: string;
  endTime: string;
  cliffDate: string;
  cliffTime: string;
  cliffAmountPercent: number;
  decimals: number;
  tokenSymbol: string;
  index: number;
}

const RecipientOverview: React.FC<RecipientOverviewProps> = ({
  recipient,
  endDate,
  endTime,
  cliffDate,
  cliffTime,
  releasePeriod,
  cliffAmountPercent,
  decimals,
  tokenSymbol,
  index,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const { depositedAmount, name } = recipient;
  const formattedReleasePeriod = formatPeriodOfTime(releasePeriod);

  const isReleasePerMonth = formattedReleasePeriod?.includes("month");
  const isReleasePerYear = formattedReleasePeriod?.includes("year");

  const end = getUnixTime(new Date(endDate + "T" + endTime));
  const cliff = getUnixTime(new Date(cliffDate + "T" + cliffTime));

  const cliffAmountCalculated = (cliffAmountPercent / 100) * depositedAmount;
  const amountPerPeriod = calculateReleaseRate(
    end,
    cliff,
    depositedAmount,
    cliffAmountCalculated,
    releasePeriod,
    decimals
  );

  const amountPerPeriodPercent = (amountPerPeriod * 100) / depositedAmount;

  const { periods, endTimeFromBE } = calculateEndTimeLikeOnBE({
    cliff,
    cliffAmount: parseFloat(cliffAmountCalculated.toFixed(decimals)),
    depositedAmount,
    period: Math.floor(releasePeriod),
    amountPerPeriod,
  });

  const showEndTimeTooltip = end && endTimeFromBE && end * 1000 !== endTimeFromBE;

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="mt-2">
      <div className="flex">
        <button
          onClick={toggleVisibility}
          className={`text-gray text-p2 font-bold ${isVisible ? "mb-2" : "mb-0"}`}
        >
          {isVisible ? (
            <IcnArrowDown classes="hover:cursor-pointer inline mr-1.5" fill="rgb(113, 130, 152)" />
          ) : (
            <IcnArrowRight fill="rgb(113, 130, 152)" classes="hover:cursor-pointer inline mr-1.5" />
          )}{" "}
          RECIPIENT {index} {name && <span>( {name} )</span>}
        </button>
      </div>
      {isVisible && (
        <>
          <p className="text-gray-light text-sm leading-6">
            First
            <span className="text-gray-light text-sm font-bold">
              {` ${cliffAmountPercent}% (${cliffAmountCalculated.toFixed(2)} ${tokenSymbol}) `}
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
            released every{" "}
            {releasePeriod ? (
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
        </>
      )}
    </div>
  );
};

const Overview: React.FC<OverviewProps> = ({
  recipients,
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

  return (
    <div className={`${classes} col-span-full mt-1 leading-6`}>
      <div className="bg-gray-dark p-5 rounded-lg">
        <label className="text-gray-light text-base font-bold block">Overview</label>
        {recipients.map((recipient, index) => (
          <RecipientOverview
            key={index}
            recipient={recipient}
            endDate={endDate}
            endTime={endTime}
            cliffDate={cliffDate}
            cliffTime={cliffTime}
            releasePeriod={releasePeriod}
            tokenSymbol={tokenSymbol}
            decimals={decimals}
            cliffAmountPercent={cliffAmountPercent}
            index={index + 1}
          />
        ))}
      </div>
    </div>
  );
};

export default Overview;
