import { getUnixTime } from "date-fns";
import BN from "bn.js";
import { Stream } from "@streamflow/timelock";

import { StreamStatus } from "../../types";

export function getStreamStatus(
  canceledAt: number | undefined,
  start: number,
  end: number,
  now: number
): StreamStatus {
  if (canceledAt) return StreamStatus.canceled;
  if (now < start) return StreamStatus.scheduled;
  if (now < end) return StreamStatus.streaming;
  return StreamStatus.complete;
}

export function getStreamed(
  endTime: number,
  cliffTime: number,
  cliffAmount: number,
  depositedAmount: number,
  period: number,
  releaseRate: number
): number {
  const currentTime = getUnixTime(new Date());
  if (currentTime < cliffTime) return 0;
  if (currentTime > endTime) return depositedAmount;

  const streamed = cliffAmount + Math.floor((currentTime - cliffTime) / period) * releaseRate;

  return streamed < depositedAmount ? streamed : depositedAmount;
}

export function updateStatus(
  currentStatus: StreamStatus,
  start: number,
  end: number,
  canceledAt: number | undefined
): StreamStatus {
  if (canceledAt) {
    return StreamStatus.canceled;
  }
  const now = getUnixTime(new Date());
  if (currentStatus === StreamStatus.scheduled && now >= start) {
    return StreamStatus.streaming;
  } else if (currentStatus === StreamStatus.streaming && now >= end) {
    return StreamStatus.complete;
  } else {
    return currentStatus;
  }
}
export const calculateReleaseRate = (
  end: number,
  cliff: number,
  depositedAmount: number,
  cliffAmount: number,
  period: number
): number => {
  const amount = depositedAmount - cliffAmount;
  const numberOfReleases = Math.floor((end - cliff) / period);
  return numberOfReleases > 1 ? Math.ceil(amount / numberOfReleases) : amount;
};

export const getNextUnlockTime = (
  cliff: number,
  period: number,
  end: number,
  cliffAmount: number
): number => {
  const currentTime = getUnixTime(new Date());
  if (currentTime <= cliff) return cliffAmount > 0 ? cliff : cliff + period;

  const numberOfPeriods = Math.ceil((currentTime - cliff) / period);
  const nextUnlockTime = cliff + numberOfPeriods * period;

  return nextUnlockTime <= end ? nextUnlockTime : end;
};

export const formatStreamData = (data: Stream, decimals: number): any => ({
  ...data,
  depositedAmount: amountInFullTokens(data.depositedAmount, decimals),
  cliffAmount: amountInFullTokens(data.cliffAmount, decimals),
  amountPerPeriod: amountInFullTokens(data.amountPerPeriod, decimals),
  withdrawnAmount: amountInFullTokens(data.withdrawnAmount, decimals),
});

export const amountInFullTokens = (amount: BN, decimals: number): number =>
  amount.gt(new BN(2 ** 53 - 1))
    ? amount.div(new BN(10 ** decimals)).toNumber()
    : amount.toNumber() / 10 ** decimals;
