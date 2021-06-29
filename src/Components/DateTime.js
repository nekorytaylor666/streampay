import {add, format} from "date-fns";
import {DATE_FORMAT, TIME_FORMAT} from "../constants";
import {Dispatch, SetStateAction} from "react";

export default function DateTime(props: { title: string, date: string, updateDate: Dispatch<SetStateAction<string>>, time: string, updateTime: Dispatch<SetStateAction<string>> }) {
    const {title, date, updateDate, time, updateTime} = props;

    function initializeTime() {
        const now = format(add(new Date(), {minutes: 1}), TIME_FORMAT);
        if (!time || time < now) {
            updateTime(now)
        }
    }

    return (
        <>
            <div className="col-span-3 sm:col-span-1">
                <label htmlFor={title}
                       className="block font-medium text-gray-100 capitalize">{title} Date</label>
                <div className="mt-1">
                    <input type="date" name={title} id={title}
                           value={date}
                           min={format(new Date(), DATE_FORMAT)}
                           max={format(add(new Date(), {years: 1}), DATE_FORMAT)}
                           onChange={e => updateDate(e.target.value)}
                           className="text-white bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
                           placeholder="" aria-describedby={title + `-description`} required/>
                </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
                <label htmlFor={title + `_time`}
                       className="block font-medium text-gray-100 capitalize">{title} time</label>
                <div className="mt-1">
                    <input type="time" name={title + `_time`} id={title + `_time`}
                           value={time}
                           onFocus={initializeTime}
                           onClick={initializeTime}
                           onChange={e => updateTime(e.target.value)}
                           className="text-white bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
                           placeholder="" aria-describedby={title + `_time-description`} required/>
                </div>
            </div>
        </>
    )
}