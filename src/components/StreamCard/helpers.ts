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
  return numberOfReleases > 1 ? amount / numberOfReleases : amount;
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

export const formatStreamData = (data: Stream, decimals: number): any => {
  const { depositedAmount, cliffAmount, amountPerPeriod, withdrawnAmount } = data;

  const depositedAmountInFullTokens = depositedAmount.gt(new BN(2 ** 53 - 1))
    ? depositedAmount.div(new BN(10 ** decimals)).toNumber()
    : depositedAmount.toNumber() / 10 ** decimals;

  const cliffAmountInFullTokens = cliffAmount.gt(new BN(2 ** 53 - 1))
    ? cliffAmount.div(new BN(10 ** decimals)).toNumber()
    : cliffAmount.toNumber() / 10 ** decimals;

  const withdrawnAmountInFullTokens = withdrawnAmount.gt(new BN(2 ** 53 - 1))
    ? withdrawnAmount.div(new BN(10 ** decimals)).toNumber()
    : withdrawnAmount.toNumber() / 10 ** decimals;

  const amountPerPeriodInFullTokens = amountPerPeriod.gt(new BN(2 ** 53 - 1))
    ? amountPerPeriod.div(new BN(10 ** decimals)).toNumber()
    : amountPerPeriod.toNumber() / 10 ** decimals;

  return {
    ...data,
    depositedAmount: depositedAmountInFullTokens,
    cliffAmount: cliffAmountInFullTokens,
    amountPerPeriod: amountPerPeriodInFullTokens,
    withdrawnAmount: withdrawnAmountInFullTokens,
  };
};
