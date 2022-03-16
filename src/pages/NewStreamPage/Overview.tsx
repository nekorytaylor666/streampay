import { format, getUnixTime } from "date-fns";
import { QuestionMarkCircleIcon } from "@heroicons/react/outline";
import ReactTooltip from "react-tooltip";

import { Link } from "../../components";
import { formatPeriodOfTime, roundAmount, calculateWithdrawalFees } from "../../utils/helpers";

interface OverviewProps {
  releaseAmount: number;
  tokenSymbol: string;
  startDate: string;
  startTime: string;
  depositedAmount: number;
  releaseFrequencyCounter: number;
  releaseFrequencyPeriod: number;
  automaticWithdrawal: boolean;
  withdrawalFrequencyCounter: number;
  withdrawalFrequencyPeriod: number;
}

const Overview: React.FC<OverviewProps> = ({
  depositedAmount,
  releaseAmount,
  tokenSymbol,
  startDate,
  startTime,
  releaseFrequencyCounter,
  releaseFrequencyPeriod,
  automaticWithdrawal,
  withdrawalFrequencyCounter,
  withdrawalFrequencyPeriod,
}) => {
  const start = getUnixTime(new Date(startDate + "T" + startTime)); // gives us seconds
  const releasePeriod = releaseFrequencyCounter * releaseFrequencyPeriod;
  const end = start + Math.ceil(depositedAmount / releaseAmount) * releasePeriod;
  const formattedReleasePeriod = formatPeriodOfTime(releasePeriod);
  const isReleasePerMonth = formattedReleasePeriod?.includes("month");
  const isReleasePerYear = formattedReleasePeriod?.includes("year");

  const withdrawalFees = automaticWithdrawal
    ? calculateWithdrawalFees(
        start,
        start,
        end,
        withdrawalFrequencyCounter * withdrawalFrequencyPeriod
      )
    : 0;

  return (
    <div className="col-span-full mt-4 leading-6">
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
      <label className="text-gray-light text-base font-bold block mt-6">Streamflow fees</label>
      <p className="text-gray-light text-xxs leading-4 mt-3">
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
      {automaticWithdrawal && (
        <>
          <p className="text-gray-light text-xxs leading-4 mt-3">
            When automatic withdrawal is enabled there are additional fees ( 5000 lamports ) per
            every withdrawal.{" "}
            {withdrawalFees > 0 && (
              <>
                For this stream there will be
                <span className="font-bold">{` ${withdrawalFees.toFixed(6)} SOL`}</span> in
                withdrawal fees.
              </>
            )}
          </p>
          <p className="text-gray-light text-xxs leading-4 mt-1">
            Feature might not always work as expected - some withdrawal requests might fail due to
            potential infrastructure issues in solana network.
          </p>
        </>
      )}
    </div>
  );
};

export default Overview;
