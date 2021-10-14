import { memo } from "react";
import { format, fromUnixTime } from "date-fns";
import { BN } from "@project-serum/anchor";

function Duration(props: { start_time: BN; end_time: BN }) {
  console.log("start", props.start_time.toString());
  console.log("end", props.end_time.toString());
  return <>"start end date"</>;
  // <dt className="col-span-full text-center">
  //   {format(
  //     fromUnixTime(Number(props.start_time.toString())),
  //     "yyyy-MM-dd HH:mm"
  //   )}{" "}
  //   &ndash;{" "}
  //   {format(
  //     fromUnixTime(Number(props.end_time.toString())),
  //     "yyyy-MM-dd HH:mm"
  //   )}
  // </dt>
}

export default memo(Duration);
