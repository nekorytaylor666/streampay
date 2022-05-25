import { useMemo } from "react";

import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { add, format } from "date-fns";
import * as yup from "yup";

import { checkRecipientTotal, createWalletValidityTest, isAddressValid } from "../../utils/helpers";
import { ERRORS, DATE_FORMAT, TIME_FORMAT, timePeriodOptions } from "../../constants";
import useStore from "../../stores";
import { TransferCancelOptions, Recipient } from "../../types";

export interface StreamsFormData {
  releaseAmount: number;
  email: string;
  tokenSymbol: string;
  startDate: string;
  startTime: string;
  releaseFrequencyCounter: number;
  whoCanTransfer: TransferCancelOptions;
  whoCanCancel: TransferCancelOptions;
  releaseFrequencyPeriod: number;
  automaticWithdrawal: boolean;
  withdrawalFrequencyCounter: number;
  withdrawalFrequencyPeriod: number;
  referral: string;
  recipients: Recipient[];
}

const getDefaultValues = () => ({
  releaseAmount: undefined,
  tokenSymbol: "",
  startDate: format(new Date(), DATE_FORMAT),
  startTime: format(add(new Date(), { minutes: 2 }), TIME_FORMAT),
  releaseFrequencyCounter: 1,
  releaseFrequencyPeriod: timePeriodOptions[0].value,
  whoCanTransfer: TransferCancelOptions.Recipient,
  whoCanCancel: TransferCancelOptions.Sender,
  automaticWithdrawal: false,
  withdrawalFrequencyCounter: 1,
  withdrawalFrequencyPeriod: timePeriodOptions[1].value,
  referral: "",
  recipients: [
    {
      recipient: "",
      recipientEmail: "",
      name: "",
      depositedAmount: undefined,
    },
  ],
});

const encoder = new TextEncoder();

interface UseStreamFormProps {
  tokenBalance: number;
}

export const useStreamsForm = ({ tokenBalance }: UseStreamFormProps) => {
  const connection = useStore.getState().StreamInstance?.getConnection();
  const defaultValues = getDefaultValues();

  const validationSchema = useMemo(
    () =>
      yup.object().shape({
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
        whoCanTransfer: yup.string().required(),
        whoCanCancel: yup.string().required(),
        automaticWithdrawal: yup.bool().required(),
        withdrawalFrequencyCounter: yup.number().when("automaticWithdrawal", {
          is: true,
          then: yup.number().required(),
        }),
        withdrawalFrequencyPeriod: yup
          .number()
          .when("automaticWithdrawal", {
            is: true,
            then: yup.number().min(60).required(),
          })
          .test(
            "withdrawalFrequency is >= period",
            ERRORS.withdrawal_frequency_too_high,
            (period, ctx) => {
              return period && ctx.parent.automaticWithdrawal
                ? period * ctx.parent.withdrawalFrequencyCounter >=
                    ctx.parent.releaseFrequencyCounter * ctx.parent.releaseFrequencyPeriod
                : true;
            }
          ),
        referral: yup
          .string()
          .test("address_validation", ERRORS.invalid_address, async (address) =>
            isAddressValid(address || "", connection)
          ),
        recipients: yup
          .array()
          .of(
            yup.object().shape({
              depositedAmount: yup
                .number()
                .typeError(ERRORS.amount_required)
                .required(ERRORS.amount_required)
                .moreThan(0, ERRORS.amount_greater_than)
                .max(tokenBalance, ERRORS.amount_too_high),
              name: yup
                .string()
                .required(ERRORS.subject_required)
                .test("is not too long in representation", ERRORS.subject_too_long, (subject) => {
                  const view = encoder.encode(subject);
                  return view.length > 64 ? false : true;
                }),
              recipient: yup
                .string()
                .required(ERRORS.recipient_required)
                .test("address_validation", ERRORS.invalid_address, (address) =>
                  createWalletValidityTest(connection)(address)
                ),
              recipientEmail: yup.string().email(ERRORS.not_valid_email),
            })
          )
          //@ts-ignore
          .unique("Duplicate wallet", (a: Recipient) => a.recipient)
          .test("total_amount_check", ERRORS.total_bigger_than_balance, (recipients: Recipient[]) =>
            checkRecipientTotal(recipients as Recipient[], tokenBalance)
          ),
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
    trigger,
    clearErrors,
    control,
  } = useForm<StreamsFormData>({
    defaultValues,
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({ name: "recipients", control });

  return {
    register,
    watch,
    errors,
    trigger,
    setValue,
    handleSubmit,
    setError,
    clearErrors,
    fields,
    append,
    remove,
  };
};
