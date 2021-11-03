import { memo, FC } from "react";

import { BN } from "@project-serum/anchor";
import { format, fromUnixTime } from "date-fns";

interface DurationProps {
  start_time: BN;
  end_time: BN;
}

const Duration: FC<DurationProps> = ({ start_time, end_time }) => (
  <div className="col-span-full grid grid-cols-2 gap-x-4 text-center pb-2">
    <dd className="text-secondary text-base sm:tetx-lg">Start</dd>
    <dd className="text-secondary text-base sm:tetx-lg">End</dd>
    <dt className="text-sm sm:text-base">
      {format(fromUnixTime(Number(start_time.toString())), "ccc do MMM, yy")}
      <br />
      <span className="font-bold">
        {format(fromUnixTime(Number(start_time.toString())), "HH:mm")}
      </span>
    </dt>
    <dt className="text-sm sm:text-base">
      {format(fromUnixTime(Number(end_time.toString())), "ccc do MMM, yy")}
      <br />
      <span className="font-bold">
        {format(fromUnixTime(Number(end_time.toString())), "HH:mm")}
      </span>
    </dt>
  </div>
);

export default memo(Duration);
