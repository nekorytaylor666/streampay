import {add, format} from "date-fns";
import {DATE_FORMAT} from "../constants";

export default function DateTime(props: { title: string, date: string, updateDate: void, time: string, updateTime: void }) {
    return (
        <>
            <div className="col-span-3 sm:col-span-1">
                <label htmlFor={props.title}
                       className="block font-medium text-gray-100 capitalize">{props.title} Date</label>
                <div className="mt-1">
                    <input type="date" name={props.title} id={props.title}
                           value={props.date}
                           min={format(new Date(), DATE_FORMAT)}
                           max={format(add(new Date(), {years: 1}), DATE_FORMAT)}
                           onChange={e => updateDate(e.target.value)}
                           className="text-white bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
                           placeholder="" aria-describedby={props.title + `-description`} required/>
                </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
                <label htmlFor={props.title + `_time`}
                       className="block font-medium text-gray-100 capitalize">{props.title} time</label>
                <div className="mt-1">
                    <input type="time" name={props.title + `_time`} id={props.title + `_time`}
                           value={props.time}
                           onChange={e => updateTime(e.target.value)}
                           className="text-white bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
                           placeholder="" aria-describedby={props.title + `_time-description`} required/>
                </div>
            </div>
        </>
    )
}