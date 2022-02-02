import { getUnixTime } from "date-fns";
import BN from "bn.js";
// import { Stream } from "@streamflow/timelock";

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
  cliffAmount: BN,
  depositedAmount: BN,
  period: number,
  releaseRate: number
): BN {
  const currentTime = getUnixTime(new Date());
  if (currentTime < cliffTime) return new BN(0);
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
  depositedAmount: BN,
  cliffAmount: BN,
  period: number
): BN => {
  const amount = depositedAmount.sub(cliffAmount);
  const numberOfReleases = (end - cliff) / period;
  return numberOfReleases > 1 ? amount.div(new BN(numberOfReleases)) : amount;
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

// export const formatStreamData = (data: Stream, decimals: number): any => {
//   console.log("amountPerPeriod", data.amountPerPeriod.toNumber());
//   console.log("per perios", data.amountPerPeriod.div(new BN(10 ** decimals)).toNumber());
//   let depositedAmountPeriod;
//   let amountPerPeriod;
//   let withdrawnAmount;
//   let cliffAmount;

//   try {
//     depositedAmount
//   } catch {}

//   return {
//     ...data,
//     depositedAmount: data.depositedAmount.div(new BN(10 ** decimals)).toNumber(),
//     cliffAmount: data.cliffAmount.div(new BN(10 ** decimals)).toNumber(),
//     amountPerPeriod: data.amountPerPeriod.div(new BN(10 ** decimals)).toNumber(),
//     withdrawnAmount: data.withdrawnAmount.div(new BN(10 ** decimals)).toNumber(),
//   };
// };
