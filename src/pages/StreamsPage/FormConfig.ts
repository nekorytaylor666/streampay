import { useMemo } from "react";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { add, format } from "date-fns";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import * as yup from "yup";

import { ERRORS, DATE_FORMAT, TIME_FORMAT, timePeriodOptions } from "../../constants";
import useStore from "../../stores";

export interface StreamsFormData {
  releaseAmount: number;
  tokenSymbol: string;
  recipient: string;
  subject: string;
  startDate: string;
  startTime: string;
  depositedAmount: number;
  releaseFrequencyCounter: number;
  senderCanCancel: boolean;
  recipientCanCancel: boolean;
  senderCanTransfer: boolean;
  recipientCanTransfer: boolean;
  releaseFrequencyPeriod: number;
}

const getDefaultValues = () => ({
  releaseAmount: undefined,
  subject: "",
  tokenSymbol: "",
  recipient: "",
  startDate: format(new Date(), DATE_FORMAT),
  startTime: format(add(new Date(), { minutes: 2 }), TIME_FORMAT),
  depositedAmount: undefined,
  releaseFrequencyCounter: 1,
  releaseFrequencyPeriod: timePeriodOptions[0].value,
  senderCanCancel: true,
  recipientCanCancel: false,
  senderCanTransfer: true,
  recipientCanTransfer: false,
});

const isRecipientAddressValid = async (address: string, connection: Connection | null) => {
  let pubKey = null;

  try {
    pubKey = new PublicKey(address || "");
  } catch {
    return false;
  }

  const recipientAddress = await connection?.getAccountInfo(pubKey);
  if (recipientAddress == null) return true;
  if (!recipientAddress.owner.equals(SystemProgram.programId)) return false;
  if (recipientAddress.executable) return false;
  return true;
};

const encoder = new TextEncoder();

interface UseStreamFormProps {
  tokenBalance: number;
}

export const useStreamsForm = ({ tokenBalance }: UseStreamFormProps) => {
  const connection = useStore.getState().connection();
  const defaultValues = getDefaultValues();

  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        depositedAmount: yup
          .number()
          .typeError(ERRORS.deposited_amount_required)
          .required(ERRORS.deposited_amount_required)
          .moreThan(0, ERRORS.amount_greater_than)
          .max(tokenBalance, ERRORS.amount_too_high),
        releaseAmount: yup
          .number()
          .typeError(ERRORS.amount_required)
          .required(ERRORS.amount_required)
          .when("depositedAmount", (depositedAmount, schema) =>
            depositedAmount
              ? schema.max(depositedAmount, ERRORS.release_amount_greater_than_deposited)
              : schema
          )
          .moreThan(0, ERRORS.amount_greater_than),
        tokenSymbol: yup.string().required(ERRORS.token_required),
        subject: yup
          .string()
          .required(ERRORS.subject_required)
          .test("is not too long in representation", ERRORS.subject_too_long, (subject) => {
            const view = encoder.encode(subject);
            return view.length > 64 ? false : true;
          }),
        recipient: yup
          .string()
          .required(ERRORS.recipient_required)
          .test("address_validation", ERRORS.invalid_address, async (address) =>
            isRecipientAddressValid(address || "", connection)
          ),
        startDate: yup
          .string()
          .required(ERRORS.max_year)
          .test("is not too much in the future", ERRORS.max_year, (date) =>
            date ? +date.split("-")[0] <= 9999 : true
          )
          .test("is in the future", ERRORS.start_date_is_in_the_past, (date) =>
            date ? date >= format(new Date(), DATE_FORMAT) : true
          ),
        startTime: yup
          .string()
          .required(ERRORS.start_time_required)
          .test("is in the future", ERRORS.start_time_is_in_the_past, (time, ctx) => {
            const date = new Date(ctx.parent.startDate + "T" + (time || ""));
            const now = new Date();
            return date >= now;
          }),
        releaseFrequencyCounter: yup
          .number()
          .typeError(ERRORS.required)
          .required(ERRORS.required)
          .positive(ERRORS.should_be_greater_than_0)
          .integer(),
        releaseFrequencyPeriod: yup.number().required(),
        senderCanCancel: yup.bool().required(),
        recipientCanCancel: yup.bool().required(),
        senderCanTransfer: yup.bool().required(),
        recipientCanTransfer: yup.bool().required(),
      }),
    [connection, tokenBalance]
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    setError,
    clearErrors,
  } = useForm<StreamsFormData>({
    defaultValues,
    resolver: yupResolver(validationSchema),
  });

  return {
    register,
    watch,
    errors,
    setValue,
    handleSubmit,
    setError,
    clearErrors,
  };
};
