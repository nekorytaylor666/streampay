import { useMemo } from "react";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { add, format } from "date-fns";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import * as yup from "yup";

import { ERRORS, DATE_FORMAT, TIME_FORMAT, getTimePeriodOptions } from "../../constants";
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
  ownershipTransferable: boolean;
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
  releaseFrequencyPeriod: getTimePeriodOptions(false)[0].value,
  senderCanCancel: true,
  recipientCanCancel: false,
  ownershipTransferable: false,
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
          .moreThan(0, ERRORS.amount_greater_than)
          .when("depositedAmount", (depositedAmount, schema) =>
            depositedAmount
              ? schema.max(depositedAmount, ERRORS.release_amount_greater_than_deposited)
              : schema
          ),
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
        releaseFrequencyCounter: yup.number().required(),
        releaseFrequencyPeriod: yup.number().required(),
        senderCanCancel: yup.bool().required(),
        recipientCanCancel: yup.bool().required(),
        ownershipTransferable: yup.bool().required(),
      }),
    [connection, tokenBalance]
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
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
  };
};
