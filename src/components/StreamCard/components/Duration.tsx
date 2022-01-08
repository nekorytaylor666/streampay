import { memo, FC } from "react";

import { BN } from "@project-serum/anchor";
import { format, fromUnixTime } from "date-fns";
import cx from "classnames";

interface DurationProps {
  start_time: BN;
  end_time: BN;
  canceled_at: BN;
  cliff: BN;
  isAdvanced: boolean;
  isCanceled: boolean;
}

const Duration: FC<DurationProps> = ({
  start_time,
  end_time,
  cliff,
  isAdvanced,
  isCanceled,
  canceled_at,
}) => (
  <div className="col-span-full grid grid-cols-3 gap-x-3 text-center pb-2">
    <dd className="text-secondary text-base sm:text-lg">Start</dd>
    <dd className="text-secondary text-base sm:text-lg">{isAdvanced ? "Cliff" : ""}</dd>
    <dd className={cx("text-base sm:text-lg", isCanceled ? "text-red-400" : "text-secondary")}>
      {isCanceled ? "Canceled" : "End"}
    </dd>
    <dt className="text-sm sm:text-base">
      {format(fromUnixTime(start_time.toNumber()), "ccc do MMM, yy")}
      <br />
      <span className="font-bold">{format(fromUnixTime(start_time.toNumber()), "HH:mm")}</span>
    </dt>
    <dt className="text-sm sm:text-base">
      {isAdvanced ? format(fromUnixTime(cliff.toNumber()), "ccc do MMM, yy") : ""}
      <br />
      <span className="font-bold">
        {isAdvanced ? format(fromUnixTime(cliff.toNumber()), "HH:mm") : ""}
      </span>
    </dt>
    <dt className={cx("text-sm sm:text-base", { "text-red-400": isCanceled })}>
      {format(
        fromUnixTime(isCanceled ? canceled_at.toNumber() : end_time.toNumber()),
        "ccc do MMM, yy"
      )}
      <br />
      <span className={cx("font-bold", { "text-red-400": isCanceled })}>
        {format(fromUnixTime(isCanceled ? canceled_at.toNumber() : end_time.toNumber()), "HH:mm")}
      </span>
    </dt>
  </div>
);

export default memo(Duration);
