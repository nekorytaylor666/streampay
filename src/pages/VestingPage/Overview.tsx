import { format } from "date-fns";
import { ExternalLinkIcon } from "@heroicons/react/outline";

<<<<<<< HEAD
import { formatPeriodOfTime } from "../../utils/helpers";
=======
import { formatPeriodOfTime, roundAmount } from "../../utils/helpers";
>>>>>>> dev
import { Link } from "../../components";

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
    <div className="col-span-full mt-4 leading-6">
      <h3 className="font-bold text-lg text-white mb-3">Overview:</h3>
      <p className="text-gray-400 text-sm leading-6">
        First
        <span className="text-gray-100 text-sm">
          {` ${cliffAmount}% (${(((amount || 0) * cliffAmount) / 100).toFixed(2)} ${tokenSymbol}) `}
        </span>
        <br className="sm:hidden" />
        released on
        {cliff.getTime() ? (
          <span className="text-gray-100 text-sm">{` ${cliffDate} `}</span>
        ) : (
          <span> ____ </span>
        )}
        at
        <span className="text-gray-100 text-sm">{` ${cliffTime}`}</span>.
      </p>
      <p className="text-gray-400 text-sm leading-6 sm:inline-block">
        And then
        <span className="text-gray-100 text-sm">{` ${releaseRate.toFixed(3)}% (${(
          ((amount || 0) * releaseRate) /
          100
        ).toFixed(2)} ${tokenSymbol}) `}</span>
        <br className="sm:hidden" />
        released every
        {releaseFrequencyCounter ? (
          <span className="text-gray-100 text-sm">{` ${formatPeriodOfTime(releasePeriod)}. `}</span>
        ) : (
          <span> _____ </span>
        )}
        <br />
        until
        {end.getTime() ? (
          <span className="text-gray-100 text-sm">{` ${format(
            new Date(endDate + "T" + endTime),
            "ccc do MMM, yyyy - HH:mm"
          )}`}</span>
        ) : (
          <span> ____ </span>
        )}
        .
      </p>
      <p className="text-gray-400 text-xxs leading-4 mt-6">
<<<<<<< HEAD
        {`Streamflow charges 0.25% service fee (${amount * 0.0025} ${tokenSymbol}) on top of the
=======
        {`Streamflow charges 0.25% service fee (${roundAmount(
          amount * 0.0025,
          0,
          3
        )} ${tokenSymbol}) on top of the
>>>>>>> dev
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
