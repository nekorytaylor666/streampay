import {add, format} from "date-fns";
import {createContext, useContext, useState} from "react";
import {DATE_FORMAT, TIME_FORMAT} from "../constants";

const FormContext = createContext(undefined)

export function FormProvider(props) {
    const now = new Date();

    const [amount, setAmount] = useState(undefined);
    const [receiver, setReceiver] = useState(undefined);
    const [startDate, setStartDate] = useState(format(now, DATE_FORMAT));
    const [startTime, setStartTime] = useState(format(add(now, {minutes: 1}), TIME_FORMAT));
    const [endDate, setEndDate] = useState(startDate);
    const [endTime, setEndTime] = useState(startTime);

    return <FormContext.Provider value={{
        amount,
        setAmount,
        receiver,
        setReceiver,
        startDate,
        setStartDate,
        startTime,
        setStartTime,
        endDate,
        setEndDate,
        endTime,
        setEndTime
    }}>{props.children}</FormContext.Provider>
}

export function useFormContext() {
    return useContext(FormContext)
}