import { useCallback, useMemo } from "react";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { format } from "date-fns";

import { ERRORS, DATE_FORMAT, TIME_FORMAT, timePeriodOptions } from "../../constants";
// import { parseDateString } from "../../utils/helpers";

export interface StreamsFormData {
  amount: number;
  token: string;
  recipient: string;
  subject: string;
  startDate: string;
  startTime: string;
  depositedAmount: number;
  releaseFrequencyCounter: number;
  senderCanCancel: boolean;
  recipientCanCancel: boolean;
  ownershipTransferable: boolean;
  releaseFrequencyPeriod: number;
}

export const defaultValues = {
  amount: undefined,
  subject: "",
  recipient: "",
  startDate: format(new Date(), DATE_FORMAT),
  startTime: format(new Date(), TIME_FORMAT),
  depositedAmount: undefined,
  releaseFrequencyCounter: 1,
  releaseFrequencyPeriod: timePeriodOptions[0].value,
  senderCanCancel: true,
  recipientCanCancel: false,
  ownershipTransferable: false,
};

export const useStreamsForm = () => {
  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        amount: yup
          .number()
          .typeError(ERRORS.amount_required)
          .required(ERRORS.amount_required)
          .moreThan(0, ERRORS.amount_greater_than)
          .max(100, ""),
        subject: yup.string().required(ERRORS.subject_required).max(30, ERRORS.subject_max),
        // token: yup.string().required(ERRORS.token_required),
        recipient: yup.string().required(ERRORS.recipient_required),
        startDate: yup.string().required(ERRORS.start_date_required),
        //   .min(ERRORS.start_date_is_in_the_past)
        // .max(ERRORS), // transform(parseDateString),
        // startTime: yup.time().required(ERRORS.start_time_required),
        depositedAmount: yup
          .number()
          .typeError(ERRORS.deposited_amount_required)
          .required(ERRORS.deposited_amount_required)
          .moreThan(0, ERRORS.amount_greater_than)
          .max(100, ""),
        releaseFrequencyCounter: yup.number().required(),
        releaseFrequencyPeriod: yup.number().required(),
        senderCanCancel: yup.bool().required(),
        recipientCanCancel: yup.bool().required(),
        ownershipTransferable: yup.bool().required(),
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
