import { format } from "date-fns";
import { createContext, useContext, useState } from "react";
import { DATE_FORMAT } from "../constants";

const FormContext = createContext({
  amount: null as any,
  setAmount: null as any,
  receiver: null as any,
  setReceiver: null as any,
  startDate: null as any,
  setStartDate: null as any,
  startTime: null as any,
  setStartTime: null as any,
  endDate: null as any,
  setEndDate: null as any,
  endTime: null as any,
  setEndTime: null as any,
  vesting: null as any,
  setVesting: null as any,
});

export function FormProvider(props: { children: React.ReactNode }) {
  const now = new Date();

  const [amount, setAmount] = useState(undefined);
  const [receiver, setReceiver] = useState(undefined);
  const [startDate, setStartDate] = useState(format(now, DATE_FORMAT));
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState(startDate);
  const [endTime, setEndTime] = useState("");
  const [vesting, setVesting] = useState(false);

  return (
    <FormContext.Provider
      value={{
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
        setEndTime,
        vesting,
        setVesting,
      }}
    >
      {props.children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  return useContext(FormContext);
}
