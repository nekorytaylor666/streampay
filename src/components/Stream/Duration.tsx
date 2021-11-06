import { memo, FC } from "react";

import { BN } from "@project-serum/anchor";
import { format, fromUnixTime } from "date-fns";

import { StreamStatus } from "../../types";

interface DurationProps {
  start_time: BN;
  end_time: BN;
  status: string;
}

const Duration: FC<DurationProps> = ({ start_time, end_time, status }) => (
  <div className="col-span-full grid grid-cols-3 gap-x-3 text-center pb-2">
    <dd className="text-secondary text-base sm:tetx-lg">Start</dd>
    <dd className="text-secondary text-base sm:tetx-lg">Cliff</dd>
    <dd className="text-secondary text-base sm:tetx-lg">End</dd>
    <dt className="text-sm sm:text-base">
      {format(fromUnixTime(Number(start_time.toString())), "ccc do MMM, yy")}
      <br />
      <span className="font-bold">
        {format(fromUnixTime(Number(start_time.toString())), "HH:mm")}
      </span>
    </dt>
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
