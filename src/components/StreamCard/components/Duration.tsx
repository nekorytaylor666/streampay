import { memo, FC } from "react";

import { format, fromUnixTime } from "date-fns";
import cx from "classnames";

interface DurationProps {
  start: number;
  end: number;
  cliff: number;
  isAdvanced: boolean;
  isCanceled: boolean;
  canceledAt: number | undefined;
}

const Duration: FC<DurationProps> = ({ start, end, cliff, isAdvanced, isCanceled, canceledAt }) => (
  <div className="col-span-full grid grid-cols-3 gap-x-3 text-center pb-2">
    <dd className="text-secondary text-base sm:text-lg">Start</dd>
    <dd className="text-secondary text-base sm:text-lg">{isAdvanced ? "Cliff" : ""}</dd>
    <dd className={cx("text-base sm:text-lg", isCanceled ? "text-red-400" : "text-secondary")}>
      {isCanceled ? "Canceled" : "End"}
    </dd>
    <dt className="text-sm sm:text-base">
      {format(fromUnixTime(start), "ccc do MMM, yy")}
      <br />
      <span className="font-bold">{format(fromUnixTime(start), "HH:mm")}</span>
    </dt>
    <dt className="text-sm sm:text-base">
      {isAdvanced ? format(fromUnixTime(cliff), "ccc do MMM, yy") : ""}
      <br />
      <span className="font-bold">{isAdvanced ? format(fromUnixTime(cliff), "HH:mm") : ""}</span>
    </dt>
    <dt className={cx("text-sm sm:text-base", { "text-red-400": isCanceled })}>
      {format(fromUnixTime(isCanceled ? canceledAt || 0 : end), "ccc do MMM, yy")}
      <br />
      <span className={cx("font-bold", { "text-red-400": isCanceled })}>
        {format(fromUnixTime(isCanceled ? canceledAt || 0 : end), "HH:mm")}
      </span>
    </dt>
  </div>
);

export default memo(Duration);
