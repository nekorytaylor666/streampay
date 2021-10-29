import { memo } from "react";

import { BN } from "@project-serum/anchor";
import { format, fromUnixTime } from "date-fns";

function Duration(props: { start_time: BN; end_time: BN }) {
  console.log("start", props.start_time.toString());
  console.log("end", props.end_time.toString());
  return (
    <div className='col-span-full grid grid-cols-2 gap-x-4 text-center'>
      <dd className='text-secondary'>Start</dd>
      <dd className='text-secondary'>End</dd>
      <dt>
        {format(fromUnixTime(Number(props.start_time.toString())), "ccc do MMM, yy")}
        <br />
        <span className='font-bold'>
          {format(fromUnixTime(Number(props.start_time.toString())), "HH:mm")}
        </span>
      </dt>
      <dt>
        {format(fromUnixTime(Number(props.end_time.toString())), "ccc do MMM, yy")}
        <br />
        <span className='font-bold'>
          {format(fromUnixTime(Number(props.end_time.toString())), "HH:mm")}
        </span>
      </dt>
    </div>
  );
}

export default memo(Duration);
