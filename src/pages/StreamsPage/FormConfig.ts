import { useCallback, useMemo } from "react";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { ERRORS } from "../../constants";

export interface StreamsFormData {
  amount: number;
  token: string;
  recipient: string;
  //   startDate: string;
  //   startTime: string;
  //   depositedAmount: number;
  //   releaseFrequencyCounter: number;
  //   releaseFrequencyPeriod: string;
}

export const defaultValues = {
  amount: undefined,
};

export const useStreamsForm = () => {
  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        amount: yup.number().required(ERRORS.amount_required).min(0).max(100),
        // token: yup.string().required(ERRORS.token_required),
        // recipient: yup.string().required(ERRORS.recipient_required),
        // startDate: yup.string(),
        // startTime: yup.string(),
        // depositedAmount: yup.string(),
      }),
    []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StreamsFormData>({
    defaultValues,
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = useCallback((formValues: StreamsFormData) => {
    console.log(formValues);
  }, []);

  return {
    register,
    errors,
    onSubmit: handleSubmit(onSubmit),
  };
};
