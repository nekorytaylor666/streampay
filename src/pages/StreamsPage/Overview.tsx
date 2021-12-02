import { format, getUnixTime } from "date-fns";

import { formatPeriodOfTime } from "../../utils/helpers";

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
  const releasePeriod = releaseFrequencyCounter * releaseFrequencyPeriod;

  const start = getUnixTime(new Date(startDate + "T" + startTime));
  const end = start + Math.ceil(depositedAmount / releaseAmount) * releasePeriod;

  return (
    <div className="col-span-full mt-4">
      <p className="text-gray-400 text-sm leading-6">
        <b className="font-bold block">Overview:</b>
        Stream starts on
        <span className="text-white text-sm">{` ${startDate} `}</span>at
        <span className="text-white text-sm">{` ${startTime}`}</span>.
      </p>
      {releaseAmount && depositedAmount && tokenSymbol && (
        <>
          <p className="text-gray-400 text-sm leading-6 sm:inline-block">
            <span className="text-white text-sm">{` ${releaseAmount} ${tokenSymbol} `}</span>
            <br className="sm:hidden" />
            released every
            <span className="text-white text-sm">{` ${formatPeriodOfTime(releasePeriod)}. `}</span>
          </p>
          <br />
          <p className="text-gray-400 text-sm leading-6 sm:inline-block">
            Ends on
            <span className="text-white text-sm">{` ${format(
              new Date(end),
              "ccc do MMM, yyyy - HH:mm"
            )}`}</span>
            , unless topped up.
          </p>
        </>
      )}
    </div>
  );
};

export default Overview;
