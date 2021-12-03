import { format } from "date-fns";

import { formatPeriodOfTime } from "../../utils/helpers";

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
}

const Overview: React.FC<OverviewProps> = ({
  amount,
  tokenSymbol,
  endDate,
  endTime,
  cliffDate,
  cliffTime,
  cliffAmount,
  releaseFrequencyCounter,
  releaseFrequencyPeriod,
}) => {
  const releasePeriod = releaseFrequencyCounter * releaseFrequencyPeriod;

  const end = new Date(endDate + "T" + endTime);
  const cliff = new Date(cliffDate + "T" + cliffTime);

  const lengthSeconds = (+end - +cliff) / 1000;
  const numPeriods = lengthSeconds / releasePeriod;
  const releaseRate = (100 - cliffAmount) / (numPeriods > 1 ? numPeriods : 1);

  return (
    <div className="col-span-full mt-4">
      <b className="font-bold block text-gray-400 text-sm leading-6">Overview:</b>
      <p className="text-gray-400 text-sm leading-6">
        First
        <span className="text-gray-100 text-sm">
          {` ${cliffAmount}% (${(((amount || 0) * cliffAmount) / 100).toFixed(2)} ${tokenSymbol}) `}
        </span>
        <br className="sm:hidden" />
        released on
        <span className="text-gray-100 text-sm">{` ${cliffDate} `}</span>at
        <span className="text-gray-100 text-sm">{` ${cliffTime}`}</span>.
      </p>
      {tokenSymbol && (
        <p className="text-gray-400 text-sm leading-6 sm:inline-block">
          And then
          <span className="text-gray-100 text-sm">{` ${releaseRate.toFixed(3)}% (${(
            ((amount || 0) * releaseRate) /
            100
          ).toFixed(2)} ${tokenSymbol}) `}</span>
          <br className="sm:hidden" />
          released every
          <span className="text-gray-100 text-sm">{` ${formatPeriodOfTime(releasePeriod)} `}</span>
          <br />
          until
          <span className="text-gray-100 text-sm">{` ${format(
            new Date(endDate + "T" + endTime),
            "ccc do MMM, yyyy - HH:mm"
          )}`}</span>
          .
        </p>
      )}
    </div>
  );
};

export default Overview;
