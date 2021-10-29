import { createContext, useContext, useState } from 'react';

import { format } from 'date-fns';

import { DATE_FORMAT } from '../constants';
import { CreateStreamsFormType } from '../types';

const FormContext = createContext<CreateStreamsFormType>(
  undefined as unknown as CreateStreamsFormType,
);

export function FormProvider(props: { children: React.ReactNode }) {
  const now = new Date();

  const [amount, setAmount] = useState<number>(undefined as unknown as number);
  const [receiver, setReceiver] = useState<string>(undefined as unknown as string);
  const [startDate, setStartDate] = useState(format(now, DATE_FORMAT));
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState(startDate);
  const [endTime, setEndTime] = useState('');
  const [advanced, setAdvanced] = useState(false);
  const [cliffDate, setCliffDate] = useState(startDate);
  const [cliffTime, setCliffTime] = useState('00:00');
  const [cliffAmount, setCliffAmount] = useState(0);
  const [timePeriod, setTimePeriod] = useState(1);
  const [timePeriodMultiplier, setTimePeriodMultiplier] = useState(1);

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
        advanced,
        setAdvanced,
        cliffDate,
        setCliffDate,
        cliffTime,
        setCliffTime,
        cliffAmount,
        setCliffAmount,
        timePeriod,
        setTimePeriod,
        timePeriodMultiplier,
        setTimePeriodMultiplier,
      }}
    >
      {props.children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  return useContext(FormContext);
}
