import { format, getUnixTime } from "date-fns";
import { QuestionMarkCircleIcon } from "@heroicons/react/outline";
import ReactTooltip from "react-tooltip";

import {
  formatPeriodOfTime,
  roundAmount,
  calculateEndTimeLikeOnBE,
  calculateWithdrawalFees,
} from "../../utils/helpers";
import { Link, Tooltip } from "../../components";
import { calculateReleaseRate } from "../../components/StreamCard/helpers";

interface OverviewProps {
  amount: number;
  tokenSymbol: string;
  endDate: string;
  startTime: string;
  startDate: string;
  endTime: string;
  cliffDate: string;
  cliffTime: string;
  cliffAmount: number;
  releaseFrequencyCounter: number;
  releaseFrequencyPeriod: number;
  decimals: number;
  automaticWithdrawal: boolean;
  withdrawalFrequencyCounter: number;
  withdrawalFrequencyPeriod: number;
}

const Overview: React.FC<OverviewProps> = ({
  amount,
  tokenSymbol,
  startDate,
  startTime,
  endDate,
  endTime,
  cliffDate,
  cliffTime,
  cliffAmount: cliffAmountPercent,
  releaseFrequencyCounter,
  releaseFrequencyPeriod,
  decimals,
  automaticWithdrawal,
  withdrawalFrequencyPeriod,
  withdrawalFrequencyCounter,
}) => {
  const releasePeriod = releaseFrequencyCounter * releaseFrequencyPeriod;
  const start = getUnixTime(new Date(startDate + "T" + startTime));
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

  const withdrawalFees = automaticWithdrawal
    ? calculateWithdrawalFees(
        start,
        cliff,
        end,
        withdrawalFrequencyCounter * withdrawalFrequencyPeriod
      )
    : 0;

  return (
    <div className="col-span-full mt-4 leading-6">
      <div className="bg-gray-dark p-5 rounded-md">
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
      <label className="text-gray-light text-base font-bold block mt-6">Streamflow fees</label>
      <p className="text-gray-light text-xxs leading-4 mt-3">
        Streamflow charges 0.25% service fee (
        <span className="font-bold">{` ${roundAmount(amount * 0.0025)} ${tokenSymbol} `}</span>) on
        top of the specified amount, while respecting the given schedule.{" "}
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
                For this contract there will be
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
