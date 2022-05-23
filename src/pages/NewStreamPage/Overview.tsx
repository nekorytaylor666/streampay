import { useState } from "react";

import { format, getUnixTime } from "date-fns";
import { QuestionMarkCircleIcon } from "@heroicons/react/outline";
import ReactTooltip from "react-tooltip";

import { formatPeriodOfTime } from "../../utils/helpers";
import { Recipient } from "../../types";
import { IcnArrowDown, IcnArrowRight } from "../../assets/icons";

interface RecipientOverviewProps {
  recipient: Recipient;
  releasePeriod: number;
  startDate: string;
  startTime: string;
  releaseAmount: number;
  tokenSymbol: string;
  index: number;
}

const RecipientOverview: React.FC<RecipientOverviewProps> = ({
  recipient,
  startDate,
  startTime,
  releasePeriod,
  releaseAmount,
  tokenSymbol,
  index,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const { depositedAmount, name } = recipient;
  const formattedReleasePeriod = formatPeriodOfTime(releasePeriod);

  const isReleasePerMonth = formattedReleasePeriod?.includes("month");
  const isReleasePerYear = formattedReleasePeriod?.includes("year");

  const start = getUnixTime(new Date(startDate + "T" + startTime)); // gives us seconds
  const end = start + Math.ceil(depositedAmount / releaseAmount) * releasePeriod;

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
            {releasePeriod ? (
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
            {depositedAmount && releaseAmount > 0 && start && releasePeriod ? (
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
        </>
      )}
    </div>
  );
};

interface OverviewProps {
  recipients: Recipient[];
  tokenSymbol: string;
  startDate: string;
  startTime: string;
  releaseAmount: number;
  releaseFrequencyCounter: number;
  releaseFrequencyPeriod: number;
  classes?: string;
}

const Overview: React.FC<OverviewProps> = ({
  recipients,
  releaseAmount,
  tokenSymbol,
  startDate,
  startTime,
  releaseFrequencyCounter,
  releaseFrequencyPeriod,
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
            startDate={startDate}
            startTime={startTime}
            releaseAmount={releaseAmount}
            releasePeriod={releasePeriod}
            tokenSymbol={tokenSymbol}
            index={index + 1}
          />
        ))}
      </div>
    </div>
  );
};

export default Overview;
