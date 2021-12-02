import { useMemo } from "react";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { add, format } from "date-fns";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import * as yup from "yup";

import { ERRORS, DATE_FORMAT, TIME_FORMAT, getTimePeriodOptions } from "../../constants";
import useStore from "../../stores";

export interface VestingFormData {
  amount: number;
  tokenSymbol: string;
  recipient: string;
  subject: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  releaseFrequencyCounter: number;
  releaseFrequencyPeriod: number;
  senderCanCancel: boolean;
  recipientCanCancel: boolean;
  ownershipTransferable: boolean;
  cliffDate: string;
  cliffTime: string;
  cliffAmount: number;
}

const getDefaultValues = () => ({
  amount: undefined,
  tokenSymbol: "",
  recipient: "",
  subject: "",
  startDate: format(new Date(), DATE_FORMAT),
  startTime: format(add(new Date(), { minutes: 2 }), TIME_FORMAT),
  endDate: format(new Date(), DATE_FORMAT),
  endTime: format(add(new Date(), { minutes: 7 }), TIME_FORMAT),
  releaseFrequencyCounter: 1,
  releaseFrequencyPeriod: getTimePeriodOptions(false)[0].value,
  senderCanCancel: true,
  recipientCanCancel: false,
  ownershipTransferable: false,
  cliffDate: format(new Date(), DATE_FORMAT),
  cliffTime: format(add(new Date(), { minutes: 2 }), TIME_FORMAT),
  cliffAmount: 0,
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

interface UseVestingFormProps {
  tokenBalance: number;
}

export const useVestingForm = ({ tokenBalance }: UseVestingFormProps) => {
  const connection = useStore.getState().connection();
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
        subject: yup.string().required(ERRORS.subject_required).max(30, ERRORS.subject_max),
        recipient: yup
          .string()
          .required(ERRORS.recipient_required)
          .test("address_validation", ERRORS.invalid_address, async (address) =>
            isRecipientAddressValid(address || "", connection)
          ),
        startDate: yup
          .string()
          .required(ERRORS.start_date_required)
          .test("is in a future", ERRORS.start_date_is_in_the_past, (date) =>
            date ? date >= format(new Date(), DATE_FORMAT) : true
          ),
        startTime: yup
          .string()
          .required(ERRORS.start_time_required)
          .test("is in a future", ERRORS.start_time_is_in_the_past, (time, ctx) => {
            const date = new Date(ctx.parent.startDate + "T" + (time || ""));
            const now = new Date();
            return date >= now;
          }),
        endDate: yup
          .string()
          .required(ERRORS.end_date_required)
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
        releaseFrequencyCounter: yup.number().required(),
        releaseFrequencyPeriod: yup.number().required(),
        senderCanCancel: yup.bool().required(),
        recipientCanCancel: yup.bool().required(),
        ownershipTransferable: yup.bool().required(),
        cliffDate: yup
          .string()
          .required()
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
            console.log("start date", ctx.parent.startDate);
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
      }),
    [connection, tokenBalance]
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<VestingFormData>({
    defaultValues,
    resolver: yupResolver(validationSchema),
  });

  return {
    register,
    watch,
    errors,
    setValue,
    handleSubmit,
  };
};
