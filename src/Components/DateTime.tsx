import { add, format } from "date-fns";

import { DATE_FORMAT, END, TIME_FORMAT, TIME_SUFFIX } from "../constants";
import { useFormContext } from "../Contexts/FormContext";

export default function DateTime(props: {
  title: string;
  date: string;
  updateDate: (value: string) => void;
  time: string;
  updateTime: (value: string) => void;
}) {
  const { title, date, updateDate, time, updateTime } = props;
  const { startDate, startTime } = useFormContext();

  function getMinDate(): string {
    if (title === END && startDate) {
      return format(new Date(startDate + TIME_SUFFIX), DATE_FORMAT);
    } else {
      return format(new Date(), DATE_FORMAT);
    }
  }

  function initializeTime() {
    const now = format(add(new Date(), { minutes: 2 }), TIME_FORMAT);

    if (title === END) {
      const minEndDate = startDate ? new Date(startDate + TIME_SUFFIX) : new Date();

      if (!startDate || !date || date < startDate) {
        updateDate(format(minEndDate, DATE_FORMAT));
      }

      if (startDate && startDate === date && startTime && time <= startTime) {
        updateTime(format(add(new Date(startDate + "T" + startTime), { minutes: 5 }), TIME_FORMAT));
      } else if (!startTime) {
        updateTime(now);
      }
    } else if (!time || time < now) {
      updateTime(now);
    }
  }

  return (
    <>
      <div className="col-span-3 sm:col-span-1">
        <label htmlFor={title} className="block font-medium text-gray-100 capitalize">
          {title} Date
        </label>
        <div className="mt-1">
          <input
            type="date"
            name={title}
            id={title}
            value={date}
            min={getMinDate()}
            max={format(add(new Date(), { years: 1 }), DATE_FORMAT)}
            onFocus={initializeTime}
            onClick={initializeTime}
            onChange={(e) => updateDate(e.target.value)}
            className="text-white bg-gray-800 border-primary block w-full h-10.5 border-black rounded-md focus:ring-secondary focus:border-secondary"
            placeholder=""
            aria-describedby={title + `-description`}
            required
          />
        </div>
      </div>
      <div className="col-span-2 sm:col-span-1">
        <label htmlFor={title + `_time`} className="block font-medium text-gray-100 capitalize">
          {title} time
        </label>
        <div className="mt-1">
          <input
            type="time"
            name={title + `_time`}
            id={title + `_time`}
            value={time}
            onFocus={initializeTime}
            onClick={initializeTime}
            onChange={(e) => updateTime(e.target.value)}
            className="text-white bg-gray-800 border-primary block w-full h-10.5 border-black rounded-md focus:ring-secondary focus:border-secondary"
            placeholder=""
            aria-describedby={title + `_time-description`}
            required
          />
        </div>
      </div>
    </>
  );
}
