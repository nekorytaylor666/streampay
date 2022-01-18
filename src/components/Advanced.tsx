import { useState } from "react";

import { format } from "date-fns";
import { QuestionMarkCircleIcon } from "@heroicons/react/outline";
import ReactTooltip from "react-tooltip";

import { DateTime } from "./index";
import { formatPeriodOfTime } from "../utils/helpers";
import { Token } from "../types";
import { PERIOD } from "../utils/helpers";

export default function Advanced({
  visible,
  token,
  amount,
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
  token: Token;
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
  const ticker = token?.info?.symbol ? token.info.symbol.toUpperCase() : "";

  const [s, setS] = useState(timePeriodMultiplier > 1 ? "s" : "");

  if (!endDate || !endTime) {
    return (
      <span hidden={!visible} className="text-white text-base">
        Please specify start and end time.
      </span>
    );
  }

  const lengthSeconds =
    (+new Date(endDate + "T" + endTime) - +new Date(cliffDate + "T" + cliffTime)) / 1000;
  const numPeriods = lengthSeconds / (timePeriodMultiplier * timePeriod);
  const releaseRate = (100 - cliffAmount) / (numPeriods > 1 ? numPeriods : 1);
  const formattedReleasePeriod = formatPeriodOfTime(timePeriod * timePeriodMultiplier);
  const isReleasePerMonth = formattedReleasePeriod?.includes("month");
  const isReleasePerYear = formattedReleasePeriod?.includes("year");

  return (
    <div hidden={!visible}>
      <div className="my-4 grid gap-3 sm:gap-4 grid-cols-5">
        <DateTime
          title="cliff"
          date={cliffDate}
          updateDate={updateCliffDate}
          time={cliffTime}
          updateTime={updateCliffTime}
          classes="col-span-2 sm:col-span-2"
        />
        <div className="col-span-1 relative">
          <label
            htmlFor="cliff_amount"
            className="block text-base font-medium text-gray-100 capitalize"
          >
            Release
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
            className="text-white mt-1 pr-6 pl-2.5 sm:pl-3 bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
          />
          <span className="absolute text-white right-2 sm:right-3 bottom-2">%</span>
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
            onBlur={(e) => {
              if (!Number(e.target.value)) {
                updateTimePeriodMultiplier(1);
              }
            }}
            className="text-white pl-2.5 sm:pl-3 bg-gray-800 col-span-1 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
          />
          <select
            value={timePeriod}
            onChange={(e) => updateTimePeriod(Number(e.target.value))}
            className="text-white pl-2.5 sm:pl-3 bg-gray-800 col-span-2 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary pr-7"
          >
            <option value={PERIOD.SECOND}>second{s}</option>
            <option value={PERIOD.MINUTE}>minute{s}</option>
            <option value={PERIOD.HOUR}>hour{s}</option>
            <option value={PERIOD.DAY}>day{s}</option>
            <option value={PERIOD.WEEK}>week{s}</option>
            <option value={PERIOD.MONTH}>month{s}</option>
            <option value={PERIOD.YEAR}>year{s}</option>
          </select>
        </div>
      </div>
      <p hidden={!visible} className="text-gray-400 pt-2 mt-4 text-sm leading-6">
        <b className="font-bold block">Overview:</b>
        First
        <span className="text-white text-sm">
          {` ${cliffAmount}% (${((amount * cliffAmount) / 100).toFixed(2)} ${ticker}) `}
        </span>
        <br className="sm:hidden" />
        released on
        <span className="text-white text-sm">{` ${cliffDate} `}</span>at
        <span className="text-white text-sm">{` ${cliffTime}`}</span>.
      </p>
      <p hidden={!visible} className="text-gray-400 text-sm mt-2 leading-6 sm:inline-block">
        And then
        <span className="text-white text-sm">{` ${releaseRate.toFixed(3)}% (${(
          (amount * releaseRate) /
          100
        ).toFixed(2)} ${ticker}) `}</span>
        <br className="sm:hidden" />
        released every
        <span className="text-white text-sm">{` ${formattedReleasePeriod} `}</span>
        {(isReleasePerMonth || isReleasePerYear) && (
          <>
            <QuestionMarkCircleIcon
              className="h-3.5 w-3.5 inline mb-2 cursor-pointer text-primary"
              data-tip
              data-for="overviewTooltip"
            />
            <ReactTooltip
              id="overviewTooltip"
              type="info"
              effect="solid"
              place="top"
              backgroundColor="#18A2D9"
            >
              <span>
                {isReleasePerYear
                  ? "We assume that year has 365 days."
                  : "A month is equal to 30.4167 days, as this version doesn't use calendar."}
              </span>
            </ReactTooltip>
          </>
        )}
        <br />
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
