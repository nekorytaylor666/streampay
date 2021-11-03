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
  <div className="col-span-full grid grid-cols-2 gap-x-4 text-center pb-2">
    {status === StreamStatus.scheduled && (
      <>
        <dd className="text-secondary text-base sm:tetx-lg">Scheduled for</dd>
        <dd className="text-secondary text-base sm:tetx-lg">Will End</dd>
      </>
    )}
    {status === StreamStatus.streaming && (
      <>
        <dd className="text-secondary text-base sm:tetx-lg">Started</dd>
        <dd className="text-secondary text-base sm:tetx-lg">Will End</dd>
      </>
    )}
    {status === StreamStatus.complete && (
      <>
        <dd className="text-secondary text-base sm:tetx-lg">Started</dd>
        <dd className="text-secondary text-base sm:tetx-lg">Ended</dd>
      </>
    )}
    {status === StreamStatus.canceled && (
      <>
        <dd className="text-secondary text-base sm:tetx-lg">Started</dd>
        <dd className="text-secondary text-base sm:tetx-lg">Canceled</dd>
      </>
    )}
    <dt className="text-sm sm:text-base">
      {format(fromUnixTime(Number(start_time.toString())), "ccc do MMM, yy")}
      <br />
      <span className="font-bold">
        {format(fromUnixTime(Number(start_time.toString())), "HH:mm")}
      </span>
    </dt>
    {!(status === StreamStatus.canceled) && (
      <>
        <dt className="text-sm sm:text-base">
          {format(fromUnixTime(Number(end_time.toString())), "ccc do MMM, yy")}
          <br />
          <span className="font-bold">
            {format(fromUnixTime(Number(end_time.toString())), "HH:mm")}
          </span>
        </dt>
      </>
    )}
  </div>
);

export default memo(Duration);
