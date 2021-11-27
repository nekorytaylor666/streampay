import { useCallback, useMemo } from "react";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { add, format } from "date-fns";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import * as yup from "yup";

import { ERRORS, DATE_FORMAT, TIME_FORMAT, timePeriodOptions } from "../../constants";
import useStore, { StoreType } from "../../stores";

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

const getDefaultValues = (tokenOptions: any) => ({
  amount: undefined,
  subject: "",
  token: tokenOptions[0].value,
  recipient: "",
  startDate: format(new Date(), DATE_FORMAT),
  startTime: format(add(new Date(), { minutes: 2 }), TIME_FORMAT),
  depositedAmount: undefined,
  releaseFrequencyCounter: 1,
  releaseFrequencyPeriod: timePeriodOptions[0].value,
  senderCanCancel: true,
  recipientCanCancel: false,
  ownershipTransferable: false,
});

const isRecipientAddressInvalid = async (address: string, connection: Connection | null) => {
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

export const useStreamsForm = () => {
  const { connection, myTokenAccounts } = useStore((state: StoreType) => ({
    connection: state.connection(),
    myTokenAccounts: state.myTokenAccounts,
  }));
  const tokenOptions = Object.values(myTokenAccounts).map(({ info }) => ({
    value: info.symbol,
    label: info.symbol,
    // icon: info.logoURI,
  }));
  const defaultValues = getDefaultValues(tokenOptions);

  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        amount: yup
          .number()
          .typeError(ERRORS.amount_required)
          .required(ERRORS.amount_required)
          .moreThan(0, ERRORS.amount_greater_than)
          .max(100, ""),
        token: yup.string().required(ERRORS.token_required),
        subject: yup.string().required(ERRORS.subject_required).max(30, ERRORS.subject_max),
        // token: yup.string().required(ERRORS.token_required),
        recipient: yup
          .string()
          .required(ERRORS.recipient_required)
          .test("address_validation", ERRORS.invalid_address, async (address) =>
            isRecipientAddressInvalid(address || "", connection)
          ),
        startDate: yup
          .string()
          .required(ERRORS.start_date_required)
          .test("is in a future", ERRORS.start_date_is_in_the_past, (date) =>
            date ? date >= format(new Date(), DATE_FORMAT) : true
          )
          .test("is in a year", ERRORS.start_data_too_ahead, (date) =>
            date ? date <= format(add(new Date(), { years: 1 }), DATE_FORMAT) : true
          ),
        startTime: yup
          .string()
          .required(ERRORS.start_time_required)
          .test("is in a future", ERRORS.start_date_is_in_the_past, (time, ctx) => {
            const date = new Date(ctx.parent.startDate + "T" + (time || ""));
            const now = new Date();
            return date >= now;
          }),

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
    [connection]
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
