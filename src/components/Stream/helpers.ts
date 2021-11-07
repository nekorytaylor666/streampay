import { BN } from "@project-serum/anchor";
import { getUnixTime } from "date-fns";

import { StreamStatus } from "../../types";

export function getStreamStatus(canceledAt: BN, start: BN, end: BN, now: BN): StreamStatus {
  if (canceledAt.toNumber()) return StreamStatus.canceled;
  if (now.cmp(start) === -1) return StreamStatus.scheduled;
  if (now.cmp(end) === -1) return StreamStatus.streaming;
  return StreamStatus.complete;
}

export function getStreamed(
  startTime: number,
  endTime: number,
  cliffTime: number,
  cliffAmount: number,
  depositedAmount: number,
  period: number
): BN {
  const currentTime = getUnixTime(new Date());

  if (currentTime < startTime) return new BN(0);
  if (currentTime > endTime) return new BN(depositedAmount);

  if (cliffAmount) {
    const rate = calculateReleaseRate(endTime, cliffTime, depositedAmount, cliffAmount, period);
    return new BN(cliffAmount + Math.floor((currentTime - cliffTime) / period) * rate);
  }

  return new BN(((currentTime - startTime) / (endTime - startTime)) * depositedAmount);
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
export const calculateReleaseRate = (
  endTime: number,
  cliffTime: number,
  depositedAmount: number,
  cliffAmount: number,
  period: number
) => {
  const amount = depositedAmount - cliffAmount;
  const numberOfReleases = (endTime - cliffTime) / period;

  return amount / numberOfReleases;
};

export const getNextUnlockTime = (cliffTime: number, period: number) => {
  const currentTime = getUnixTime(new Date());
  const numberOfPeriods = Math.ceil((currentTime - cliffTime) / period);

  return cliffTime + numberOfPeriods * period;
};
