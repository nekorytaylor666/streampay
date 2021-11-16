import { useState } from "react";

import { format } from "date-fns";

import { DateTime } from "./index";
import { formatPeriodOfTime } from "../utils/helpers";

export default function Advanced({
  visible,
  endDate,
  endTime,
  cliffDate,
  cliffTime,
  cliffAmount,
  timePeriod,
  timePeriodMultiplier,
  updateCliffDate,
  updateCliffTime,
  updateCliffAmount,
  updateTimePeriod,
  updateTimePeriodMultiplier,
}: {
  visible: boolean;
  amount: number;
  endDate: string;
  endTime: string;
  cliffDate: string;
  cliffTime: string;
  cliffAmount: number;
  timePeriod: number;
  timePeriodMultiplier: number;
  updateCliffDate: (value: string) => void;
  updateCliffTime: (value: string) => void;
  updateCliffAmount: (value: number) => void;
  updateTimePeriod: (value: number) => void;
  updateTimePeriodMultiplier: (value: number) => void;
}) {
  const [s, setS] = useState(timePeriodMultiplier > 1 ? "s" : "");

  if (!endDate || !endTime) {
    return (
      <span hidden={!visible} className="text-white">
        Please specify start and end time.
      </span>
    );
  }

  const lengthSeconds =
    (+new Date(endDate + "T" + endTime) - +new Date(cliffDate + "T" + cliffTime)) / 1000;
  const numPeriods = lengthSeconds / (timePeriodMultiplier * timePeriod);
  const releaseRate = (100 - cliffAmount) / (numPeriods > 1 ? numPeriods : 1);

  return (
    <div hidden={!visible}>
      <div className="my-4 grid gap-3 sm:gap-4 grid-cols-6">
        <DateTime
          title="cliff"
          date={cliffDate}
          updateDate={updateCliffDate}
          time={cliffTime}
          updateTime={updateCliffTime}
          classes="sm:col-span-3"
        />
        <div className="col-span-2">
          <label
            htmlFor="cliff_amount"
            className="block text-base font-medium text-gray-100 capitalize"
          >
            Cliff amount
          </label>
          <input
            required={visible}
            id="cliff_amount"
            name="cliff_amount"
            type="number"
            min={0}
            max={100}
            value={cliffAmount.toString()}
            onChange={(e) => updateCliffAmount(Number(e.target.value))}
            className="text-white mt-1 bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
          />
        </div>
        <div className="col-span-4 grid gap-x-1 sm:gap-x-2 grid-cols-4">
          <label className="block text-base mb-1 font-medium text-gray-100 capitalize col-span-4">
            Release Frequency
          </label>
          <input
            type="number"
            min={1}
            value={timePeriodMultiplier.toString()}
            onChange={(e) => {
              updateTimePeriodMultiplier(Number(e.target.value));
              setS(Number(e.target.value) > 1 ? "s" : "");
            }}
            className="text-white bg-gray-800 col-span-2 sm:col-span-1 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
          />
          <select
            value={timePeriod}
            onChange={(e) => updateTimePeriod(Number(e.target.value))}
            className="text-white bg-gray-800 col-span-2 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary pr-7"
          >
            <option value={1}>second{s}</option>
            <option value={60}>minute{s}</option>
            <option value={60 * 60}>hour{s}</option>
            <option value={60 * 60 * 24}>day{s}</option>
            <option value={60 * 60 * 24 * 7}>week{s}</option>
            {/*  imprecise */}
            <option value={60 * 60 * 24 * 30}>month{s}</option>
            <option value={60 * 60 * 24 * 365}>year{s}</option>
          </select>
        </div>
      </div>
      <p hidden={!visible} className="text-gray-400 pt-2 mt-4 text-sm leading-6">
        First <span className="text-white text-sm">{` ${cliffAmount}% `}</span>released on
        <span className="text-white text-sm">{` ${cliffDate} `}</span>at
        <span className="text-white text-sm">{` ${cliffTime}`}</span>.
      </p>
      <p hidden={!visible} className="text-gray-400 text-sm leading-6 sm:inline-block">
        And then
        <span className="text-white text-sm">{` ${releaseRate.toFixed(3)}% `}</span>released every
        <span className="text-white text-sm">{` ${formatPeriodOfTime(
          timePeriod * timePeriodMultiplier
        )} `}</span>
      </p>{" "}
      <p hidden={!visible} className="text-gray-400 text-sm leading-6 sm:inline-block">
        until
        <span className="text-white text-sm">{` ${format(
          new Date(endDate + "T" + endTime),
          "ccc do MMM, yyyy - HH:mm"
        )}`}</span>
        .
      </p>
    </div>
  );
}
