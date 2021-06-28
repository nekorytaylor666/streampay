import {add, format} from "date-fns";
import {createContext, useContext, useState} from "react";

const FormContext = createContext(undefined)

export function FormProvider(props) {
    const now = new Date();

    const [amount, setAmount] = useState(undefined);
    const [receiver, setReceiver] = useState(undefined);
    const [startDate, setStartDate] = useState(format(now, "yyyy-MM-dd"));
    const [startTime, setStartTime] = useState(format(add(now, {minutes: 1}), "HH:mm"));
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