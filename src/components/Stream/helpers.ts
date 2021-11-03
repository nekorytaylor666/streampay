import { BN } from "@project-serum/anchor";
import { getUnixTime } from "date-fns";

import { StreamStatus } from "../../types";

//todo: add canceled
export function getStreamStatus(start: BN, end: BN, now: BN): StreamStatus {
  if (now.cmp(start) === -1) {
    return StreamStatus.scheduled;
  } else if (now.cmp(end) === -1) {
    return StreamStatus.streaming;
  } else {
    return StreamStatus.complete;
  }
}

export function getStreamed(
  start_time: number,
  end_time: number,
  deposited_amount: number,
  timestamp?: number
): BN {
  timestamp = timestamp || getUnixTime(new Date());

  if (timestamp < start_time) return new BN(0);
  if (timestamp > end_time) return new BN(deposited_amount);
  return new BN(((timestamp - start_time) / (end_time - start_time)) * deposited_amount);
}

export function updateStatus(
  current_status: StreamStatus,
  start_time: number,
  end_time: number,
  canceled_time?: number
): StreamStatus {
  if (canceled_time) {
    return StreamStatus.canceled;
  }
  const now = getUnixTime(new Date());
  if (current_status === StreamStatus.scheduled && now >= start_time) {
    return StreamStatus.streaming;
  } else if (current_status === StreamStatus.streaming && now >= end_time) {
    return StreamStatus.complete;
  } else {
    return current_status;
  }
}
