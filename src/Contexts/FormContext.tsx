import { format } from "date-fns";
import { createContext, useContext, useState } from "react";
import { CrerateStreamsFormType } from "../types";
import { DATE_FORMAT } from "../constants";
import { TokenInfo } from "@solana/spl-token-registry";

const FormContext = createContext<CrerateStreamsFormType>(
  undefined as unknown as CrerateStreamsFormType
);

export function FormProvider(props: { children: React.ReactNode }) {
  const now = new Date();

  const [amount, setAmount] = useState<number>(undefined as unknown as number);
  const [receiver, setReceiver] = useState<string>(
    undefined as unknown as string
  );
  const [startDate, setStartDate] = useState(format(now, DATE_FORMAT));
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState(startDate);
  const [endTime, setEndTime] = useState("");
  const [vesting, setVesting] = useState(false);
  const [token, setToken] = useState<TokenInfo | null>(null);

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
        token,
        setToken,
      }}
    >
      {props.children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  return useContext(FormContext);
}
