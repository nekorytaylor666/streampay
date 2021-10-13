import {useState} from "react";
import {getStreamed} from "./Stream";

export default function Advanced({
    visible,
    cliffDate,
    cliffTime,
    cliffAmount,
    timePeriod,
    timePeriodMultiplier,
    updateCliffDate,
    updateCliffTime,
    updateCliffAmount,
    updateTimePeriod,
    updateTimePeriodMultiplier
}: { visible: boolean, cliffDate: string, cliffTime: string, cliffAmount: number, timePeriod: number, timePeriodMultiplier: number
updateCliffDate: (value: string) => void,
updateCliffTime: (value: string) => void,
updateCliffAmount: (value: number) => void,
updateTimePeriod: (value: number) => void,
updateTimePeriodMultiplier: (value: number) => void,
}) {
    const inputClassName = "text-white p-0.5 ml-2 h-6 text-right bg-transparent border-primary border-0 border-b-2 inline focus:border-secondary focus:ring-0"
    const [s, setS] = useState(timePeriodMultiplier > 1 ? "s" : "");
  return (
    <div
      hidden={!visible}
      className="relative text-gray-200 -mx-2 p-2 rounded-md"
    >
      First
      <input
        type="number"
        value={cliffAmount.toString()}
        onChange={e => updateCliffAmount(Number(e.target.value))}
        className={inputClassName + " w-8"}
      />
        <small className="text-white">%</small> released at
      <input
        type="date"
        value={cliffDate}
        onChange={e => updateCliffDate(e.target.value)}
        className={inputClassName}
      />
      <input
        type="time"
        value={cliffTime}
        onChange={e => updateCliffTime(e.target.value)}
        className={inputClassName}
      />
      <hr className="my-5 border-0"/>
      and then
      <input
        type="number"
        value={cliffAmount}
        className={inputClassName + " w-8"}
      />{" "}
        <small className="text-white">%</small> released each
      <input
        type="number"
        min={1}
        value={timePeriodMultiplier.toString()}
        onChange={e => {updateTimePeriodMultiplier(Number(e.target.value)); setS(Number(e.target.value) > 1 ? "s" : "")}}
        className={inputClassName + " w-6"}
      />
      <select
        className={inputClassName + " pr-7 pb-0 h-auto text-left"}
        value={timePeriod}
        onChange={e => updateTimePeriod(Number(e.target.value))}
      >
        <option value={1}>second{s}</option>
        <option value={60}>minute{s}</option>
        <option value={60 * 60}>hour{s}</option>
        <option value={60 * 60 * 24}>day{s}</option>
        <option value={60 * 60 * 7}>week{s}</option>
          {/*  todo imprecise */}
          <option value={60 * 60 * 24 * 30}>month{s}</option>
        <option value={60 * 60 * 24 * 365}>year{s}</option>
      </select>
        {/*
      <br />
      <input
        type="checkbox"
        readOnly={true}
        checked={true}
        className="text-primary w-6 h-6 rounded-sm"
      />
     <span className="inline-block mt-4">Transferable</span>*/}
    </div>
  );
}
