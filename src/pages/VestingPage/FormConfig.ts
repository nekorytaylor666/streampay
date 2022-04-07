import { useMemo } from "react";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { add, format, getUnixTime } from "date-fns";
import * as yup from "yup";

import { ERRORS, DATE_FORMAT, TIME_FORMAT, timePeriodOptions } from "../../constants";
import useStore from "../../stores";
import { TransferCancelOptions } from "../../types";
import { isAddressValid } from "../../utils/helpers";

export interface VestingFormData {
  amount: number;
  email: string;
  tokenSymbol: string;
  recipient: string;
  subject: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  releaseFrequencyCounter: number;
  releaseFrequencyPeriod: number;
  whoCanTransfer: TransferCancelOptions;
  whoCanCancel: TransferCancelOptions;
  cliffDate: string;
  cliffTime: string;
  cliffAmount: number;
  automaticWithdrawal: boolean;
  withdrawalFrequencyCounter: number;
  withdrawalFrequencyPeriod: number;
  referral: string;
}

const getDefaultValues = () => ({
  amount: undefined,
  tokenSymbol: "",
  email: "",
  recipient: "",
  subject: "",
  startDate: format(new Date(), DATE_FORMAT),
  startTime: format(add(new Date(), { minutes: 2 }), TIME_FORMAT),
  endDate: format(new Date(), DATE_FORMAT),
  endTime: format(add(new Date(), { minutes: 7 }), TIME_FORMAT),
  releaseFrequencyCounter: 1,
  releaseFrequencyPeriod: timePeriodOptions[0].value,
  whoCanCancel: TransferCancelOptions.Sender,
  whoCanTransfer: TransferCancelOptions.Recipient,
  cliffDate: format(new Date(), DATE_FORMAT),
  cliffTime: format(add(new Date(), { minutes: 2 }), TIME_FORMAT),
  cliffAmount: 0,
  automaticWithdrawal: false,
  withdrawalFrequencyCounter: 1,
  withdrawalFrequencyPeriod: timePeriodOptions[1].value,
  referral: "",
});

const encoder = new TextEncoder();

interface UseVestingFormProps {
  tokenBalance: number;
}

export const useVestingForm = ({ tokenBalance }: UseVestingFormProps) => {
  const connection = useStore.getState().StreamInstance?.getConnection();
  const defaultValues = getDefaultValues();

  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        amount: yup
          .number()
          .typeError(ERRORS.amount_required)
          .required(ERRORS.amount_required)
          .moreThan(0, ERRORS.amount_greater_than)
          .max(tokenBalance, ERRORS.amount_too_high),
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
            isAddressValid(address || "", connection, true)
          ),
        email: yup.string().email(ERRORS.not_valid_email),
        startDate: yup
          .string()
          .required(ERRORS.max_year)
          .test("is in the future", ERRORS.start_date_is_in_the_past, (date) =>
            date ? date >= format(new Date(), DATE_FORMAT) : true
          )
          .test("is not too much in the future", ERRORS.max_year, (date) =>
            date ? +date.split("-")[0] <= 9999 : true
          ),
        startTime: yup
          .string()
          .required(ERRORS.start_time_required)
          .test("is in the future", ERRORS.start_time_is_in_the_past, (time, ctx) => {
            const date = new Date(ctx.parent.startDate + "T" + (time || ""));
            const now = new Date();
            return date >= now;
          }),
        endDate: yup
          .string()
          .required(ERRORS.max_year)
          .test("is not too much in the future", ERRORS.max_year, (date) =>
            date ? +date.split("-")[0] <= 9999 : true
          )
          .test("is after start", ERRORS.end_should_be_after_start, (date, ctx) => {
            return date ? date >= ctx.parent.startDate : true;
          }),
        endTime: yup
          .string()
          .required(ERRORS.end_time_required)
          .test("is after start", ERRORS.end_should_be_after_start, (time, ctx) => {
            if (!time || ctx.parent.startDate > ctx.parent.endDate) return true;
            const start = new Date(ctx.parent.startDate + "T" + ctx.parent.startTime);
            const end = new Date(ctx.parent.endDate + "T" + time);
            return end >= start;
          }),
        releaseFrequencyCounter: yup
          .number()
          .typeError(ERRORS.required)
          .required(ERRORS.required)
          .positive(ERRORS.should_be_greater_than_0)
          .integer(),
        releaseFrequencyPeriod: yup
          .number()
          .required()
          .test(
            "is not too slow",
            ERRORS.release_frequency_is_too_slow,
            (releaseFrequencyPeriod, ctx) => {
              if (releaseFrequencyPeriod && ctx.parent.releaseFrequencyCounter) {
                const cliff = getUnixTime(
                  new Date(ctx.parent.cliffDate + "T" + ctx.parent.cliffTime)
                );
                const end = getUnixTime(new Date(ctx.parent.endDate + "T" + ctx.parent.endTime));
                const releasePeriod = end - cliff;
                const releaseFrequency =
                  releaseFrequencyPeriod * ctx.parent.releaseFrequencyCounter;
                return releaseFrequency <= releasePeriod;
              }
              return true;
            }
          ),
        whoCanTransfer: yup.string().required(),
        whoCanCancel: yup.string().required(),
        cliffDate: yup
          .string()
          .required(ERRORS.max_year)
          .test("is not too much in the future", ERRORS.max_year, (date) =>
            date ? +date.split("-")[0] <= 9999 : true
          )
          .test("is after start", ERRORS.cliff_should_be_after_start, (date, ctx) => {
            return date ? date >= ctx.parent.startDate : true;
          })
          .test("is before end", ERRORS.cliff_should_be_before_end, (date, ctx) => {
            if (ctx.parent.startDate > ctx.parent.endDate) return true;
            return date ? date <= ctx.parent.endDate : true;
          }),
        cliffTime: yup
          .string()
          .required(ERRORS.required)
          .test("is after start", ERRORS.cliff_should_be_after_start, (time, ctx) => {
            if (!time || ctx.parent.startDate > ctx.parent.cliffDate) return true;
            const start = new Date(ctx.parent.startDate + "T" + ctx.parent.startTime);
            const cliff = new Date(ctx.parent.cliffDate + "T" + time);
            return cliff >= start;
          })
          .test("is before end", ERRORS.cliff_should_be_before_end, (time, ctx) => {
            if (!time || ctx.parent.endDate < ctx.parent.cliffDate) return true;
            const end = new Date(ctx.parent.endDate + "T" + ctx.parent.endTime);
            const cliff = new Date(ctx.parent.cliffDate + "T" + time);
            return time ? cliff <= end : true;
          }),
        cliffAmount: yup
          .number()
          .typeError(ERRORS.required)
          .required(ERRORS.required)
          .min(0)
          .max(100),
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
      }),

    [connection, tokenBalance]
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<VestingFormData>({
    defaultValues,
    resolver: yupResolver(validationSchema),
  });

  return {
    register,
    watch,
    errors,
    setValue,
    trigger,
    handleSubmit,
  };
};
