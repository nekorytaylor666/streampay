import { FC, useEffect, useState, useRef } from "react";

import { add, format, getUnixTime } from "date-fns";
import { PublicKey } from "@solana/web3.js";
import { toast } from "react-toastify";
import { BN, getBN, getNumberFromBN } from "@streamflow/stream";

import { Input, Button, Select, Modal, ModalRef, Toggle } from "../../components";
import useStore, { StoreType } from "../../stores";
import { StreamsFormData, useStreamsForm } from "./FormConfig";
import { createStream } from "../../api/transactions";
import { didTokenOptionsChange, getTokenAmount } from "../../utils/helpers";
import {
  DATE_FORMAT,
  TIME_FORMAT,
  ERR_NOT_CONNECTED,
  timePeriodOptions,
  ERRORS,
  TRANSACTION_VARIANT,
} from "../../constants";
import { StringOption } from "../../types";
import Overview from "./Overview";
import { trackTransaction } from "../../utils/marketing_helpers";

interface StreamsFormProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const storeGetter = (state: StoreType) => ({
  connection: state.connection(),
  wallet: state.wallet,
  walletType: state.walletType,
  cluster: state.cluster,
  token: state.token,
  tokenPriceUsd: state.tokenPriceUsd,
  myTokenAccounts: state.myTokenAccounts,
  setMyTokenAccounts: state.setMyTokenAccounts,
  addStream: state.addStream,
  setToken: state.setToken,
});

const StreamsForm: FC<StreamsFormProps> = ({ loading, setLoading }) => {
  const {
    connection,
    wallet,
    walletType,
    token,
    tokenPriceUsd,
    myTokenAccounts,
    setMyTokenAccounts,
    addStream,
    setToken,
    cluster,
  } = useStore(storeGetter);
  const tokenBalance = token?.uiTokenAmount?.uiAmount;
  const [tokenOptions, setTokenOptions] = useState<StringOption[]>([]);

  const [advanced, setAdvanced] = useState(false);
  const modalRef = useRef<ModalRef>(null);

  const { register, handleSubmit, watch, errors, setValue, setError, clearErrors, trigger } =
    useStreamsForm({
      tokenBalance: tokenBalance || 0,
    });

  const [
    depositedAmount,
    releaseAmount,
    tokenSymbol,
    startDate,
    startTime,
    releaseFrequencyCounter,
    releaseFrequencyPeriod,
    automaticWithdrawal,
    withdrawalFrequencyCounter,
    withdrawalFrequencyPeriod,
  ] = watch([
    "depositedAmount",
    "releaseAmount",
    "tokenSymbol",
    "startDate",
    "startTime",
    "releaseFrequencyCounter",
    "releaseFrequencyPeriod",
    "automaticWithdrawal",
    "withdrawalFrequencyCounter",
    "withdrawalFrequencyPeriod",
  ]);

  const updateStartDate = () => {
    const currentDate = format(new Date(), DATE_FORMAT);
    if (startDate < currentDate) setValue("startDate", currentDate);
  };

  const updateStartTime = () => {
    const start = new Date(startDate + "T" + startTime);
    const in2Minutes = add(new Date(), { minutes: 2 });
    if (start < in2Minutes) setValue("startTime", format(in2Minutes, TIME_FORMAT));
  };

  useEffect(() => {
    if (myTokenAccounts) {
      const newTokenOptions = Object.values(myTokenAccounts)
        .sort((token1, token2) => (token1.info.name < token2.info.name ? 1 : -1))
        .map(({ info }) => ({
          value: info.symbol,
          label: info.symbol,
          icon: info.logoURI,
        }));

      if (newTokenOptions.length && !didTokenOptionsChange(tokenOptions, newTokenOptions)) {
        setTokenOptions(newTokenOptions);
        setValue("tokenSymbol", newTokenOptions[0].value);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myTokenAccounts, setValue]);

  useEffect(() => {
    if (!wallet) setTokenOptions([]);
  }, [wallet]);

  const updateToken = (tokenSymbol: string) => {
    const token = Object.values(myTokenAccounts).find(({ info }) => info.symbol === tokenSymbol);
    if (token) setToken(token);
  };

  const updateReleaseFrequencyCounter = (value: string) => {
    setValue("releaseFrequencyCounter", parseInt(value));
  };

  const updateReleaseAmountError = (value: string) => {
    if (value && releaseAmount) {
      return +value < +releaseAmount
        ? setError("releaseAmount", {
            type: "error message",
            message: ERRORS.release_amount_greater_than_deposited,
          })
        : clearErrors("releaseAmount");
    }
  };

  const onSubmit = async (values: StreamsFormData) => {
    const {
      releaseAmount,
      subject,
      recipient,
      startDate,
      startTime,
      depositedAmount,
      releaseFrequencyCounter,
      releaseFrequencyPeriod,
      senderCanCancel,
      recipientCanCancel,
      senderCanTransfer,
      recipientCanTransfer,
    } = values;

    if (!wallet?.publicKey || !connection || !walletType) return toast.error(ERR_NOT_CONNECTED);

    setLoading(true);

    const start = getUnixTime(new Date(startDate + "T" + startTime));

    const data = {
      depositedAmount: getBN(depositedAmount, token.uiTokenAmount.decimals),
      recipient: recipient,
      mint: token.info.address,
      start,
      period: releaseFrequencyCounter * releaseFrequencyPeriod,
      cliff: start,
      cliffAmount: new BN(0),
      amountPerPeriod: getBN(releaseAmount, token.uiTokenAmount.decimals),
      name: subject,
      cancelableBySender: senderCanCancel,
      cancelableByRecipient: recipientCanCancel,
      transferableBySender: senderCanTransfer,
      transferableByRecipient: recipientCanTransfer,
      automaticWithdrawal,
      withdrawalFrequency: automaticWithdrawal
        ? withdrawalFrequencyCounter * withdrawalFrequencyPeriod
        : 0,
      canTopup: true,
    };

    const recipientAccount = await connection?.getAccountInfo(new PublicKey(recipient));
    if (!recipientAccount) {
      const shouldContinue = await modalRef?.current?.show();
      if (!shouldContinue) return setLoading(false);
    }

    const response = await createStream(data, connection, wallet, cluster);
    setLoading(false);
    if (response) {
      addStream([response.id, response.stream]);
      const mint = token.info.address;

      const updatedTokenAmount = await getTokenAmount(connection, wallet, mint);
      setMyTokenAccounts({
        ...myTokenAccounts,
        [mint]: { ...myTokenAccounts[mint], uiTokenAmount: updatedTokenAmount },
      });
      setToken({ ...token, uiTokenAmount: updatedTokenAmount });
      const streamflowFeeTotal = getNumberFromBN(
        response.stream.streamflowFeeTotal,
        token.uiTokenAmount.decimals
      );

      trackTransaction(
        response.id,
        token.info.symbol,
        token.info.name,
        TRANSACTION_VARIANT.CREATE_STREAM,
        streamflowFeeTotal * tokenPriceUsd,
        streamflowFeeTotal,
        depositedAmount,
        depositedAmount * tokenPriceUsd,
        walletType.name
      );
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="block my-4">
        <div className="grid gap-y-5 gap-x-3 sm:gap-x-4 grid-cols-6 sm:grid-cols-2">
          <Input
            type="number"
            label="Amount to stream"
            customChange={updateReleaseAmountError}
            placeholder="0.00"
            classes="col-span-3 sm:col-span-1"
            error={errors?.depositedAmount?.message}
            {...register("depositedAmount")}
          />
          {wallet && tokenOptions.length ? (
            <Select
              label="Token"
              options={tokenOptions}
              error={errors?.tokenSymbol?.message}
              customChange={updateToken}
              {...register("tokenSymbol")}
              classes="col-span-3 sm:col-span-1"
            />
          ) : (
            <div className="col-span-3 sm:col-span-1">
              <label className="text-gray-light text-base cursor-pointer mb-1 block">Token</label>
              <p className="text-base font-medium text-blue">No tokens available.</p>
            </div>
          )}
          <Input
            type="number"
            label="Release Amount"
            placeholder="0.00"
            error={errors?.releaseAmount?.message}
            classes="col-span-3 sm:col-span-1"
            {...register("releaseAmount")}
          />
          <div className="grid gap-x-1 sm:gap-x-2 grid-cols-5 sm:grid-cols-2 col-span-3 sm:col-span-1">
            <label className="block text-base text-gray-light text-gray-light capitalize col-span-full">
              Release Frequency
            </label>
            <Input
              type="number"
              min={1}
              step={1}
              classes="col-span-2 sm:col-span-1"
              error={
                errors?.releaseFrequencyCounter?.message || errors?.releaseFrequencyPeriod?.message
              }
              customChange={updateReleaseFrequencyCounter}
              {...register("releaseFrequencyCounter")}
            />
            <Select
              options={timePeriodOptions}
              plural={releaseFrequencyCounter > 1}
              {...register("releaseFrequencyPeriod")}
              classes="col-span-3 sm:col-span-1"
              error={errors?.releaseFrequencyPeriod?.message}
            />
          </div>
          <Input
            type="text"
            label="Subject / Title"
            placeholder="e.g. StreamFlow VC - seed round"
            classes="col-span-full"
            error={errors?.subject?.message}
            {...register("subject")}
          />
          <Input
            type="text"
            label="Recipient Account"
            placeholder="Please double check the address"
            classes="col-span-full"
            error={errors?.recipient?.message}
            {...register("recipient")}
          />
          <Input
            type="date"
            label="Start Date"
            min={format(new Date(), DATE_FORMAT)}
            onClick={updateStartDate}
            classes="col-span-3 sm:col-span-1"
            error={errors?.startDate?.message || ""}
            required
            {...register("startDate")}
          />
          <Input
            type="time"
            label="Start Time"
            classes="col-span-3 sm:col-span-1"
            error={errors?.startDate?.message ? "" : errors?.startTime?.message}
            onClick={updateStartTime}
            required
            {...register("startTime")}
          />
          <Toggle
            checked={automaticWithdrawal}
            labelRight="Automatic Withdrawal"
            classes="col-span-full mt-4"
            customChange={() => setValue("automaticWithdrawal", !automaticWithdrawal)}
            {...register("automaticWithdrawal")}
          />
          {automaticWithdrawal && (
            <div className="grid gap-x-1 sm:gap-x-2 grid-cols-5 sm:grid-cols-2 col-span-4 sm:col-span-1">
              <label className="block text-base text-gray-light text-gray-light capitalize col-span-full">
                Withdrawal Frequency
              </label>
              <Input
                type="number"
                min={1}
                step={1}
                classes="col-span-2 sm:col-span-1"
                customChange={() => trigger("withdrawalFrequencyPeriod")}
                error={
                  errors?.withdrawalFrequencyCounter?.message ||
                  errors?.withdrawalFrequencyPeriod?.message
                }
                {...register("withdrawalFrequencyCounter")}
              />
              <Select
                options={timePeriodOptions.slice(1)}
                plural={withdrawalFrequencyCounter > 1}
                {...register("withdrawalFrequencyPeriod")}
                classes="col-span-3 sm:col-span-1"
                error={errors?.withdrawalFrequencyPeriod?.message}
              />
            </div>
          )}
          <Toggle
            checked={advanced}
            customChange={setAdvanced}
            labelRight="Advanced"
            classes="col-span-full"
          />
          {advanced && (
            <>
              <div className="col-span-4 sm:col-span-1">
                <label className="text-gray-light text-base cursor-pointer mb-1 block">
                  Who can transfer the stream?
                </label>
                <div className="bg-field rounded-md grid grid-cols-2 gap-x-2 px-2.5 sm:px-3 py-2">
                  <Input
                    type="checkbox"
                    label="sender"
                    classes="col-span-1"
                    {...register("senderCanTransfer")}
                  />
                  <Input
                    type="checkbox"
                    label="recipient"
                    classes="col-span-1"
                    {...register("recipientCanTransfer")}
                  />
                </div>
              </div>
              <div className="col-span-4 sm:col-span-1">
                <label className="text-gray-light text-base cursor-pointer col-span-1 mb-1 block">
                  Who can cancel?
                </label>
                <div className="bg-field rounded-md grid grid-cols-2 gap-x-2 px-2.5 sm:px-3 py-2">
                  <Input
                    type="checkbox"
                    label="sender"
                    classes="col-span-1"
                    {...register("senderCanCancel")}
                  />
                  <Input
                    type="checkbox"
                    label="recipient"
                    classes="col-span-1"
                    {...register("recipientCanCancel")}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        {wallet?.connected && (
          <>
            <Overview
              {...{
                depositedAmount,
                releaseAmount,
                tokenSymbol,
                startDate,
                startTime,
                releaseFrequencyCounter,
                releaseFrequencyPeriod,
                automaticWithdrawal,
                withdrawalFrequencyCounter,
                withdrawalFrequencyPeriod,
              }}
            />
            <Button
              type="submit"
              background="blue"
              classes="px-20 py-4 font-bold text-2xl my-5 mx-auto"
              disabled={loading}
            >
              Create
            </Button>
          </>
        )}
      </form>
      <Modal
        ref={modalRef}
        title="Seems like the recipient address has empty balance."
        text="Please check that the address is correct before proceeding."
        type="info"
        confirm={{ color: "red", text: "Continue" }}
      />
    </>
  );
};

export default StreamsForm;
