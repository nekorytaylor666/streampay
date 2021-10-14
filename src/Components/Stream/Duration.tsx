import { memo } from "react";
import { format, fromUnixTime } from "date-fns";
import { BN } from "@project-serum/anchor";

function Duration(props: { start_time: BN; end_time: BN }) {
  return (
    <dt className="col-span-full text-center">
      {format(fromUnixTime(Number(props.start_time)), "yyyy-MM-dd HH:mm")}{" "}
      &ndash;{" "}
      {format(fromUnixTime(props.end_time.toNumber()), "yyyy-MM-dd HH:mm")}
    </dt>
  );
}

export default memo(Duration);
