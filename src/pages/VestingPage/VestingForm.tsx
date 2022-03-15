import { FC, useEffect, useState, useRef } from "react";

import { add, format, getUnixTime } from "date-fns";
import { PublicKey } from "@solana/web3.js";
import { toast } from "react-toastify";
import { getBN, getNumberFromBN } from "@streamflow/stream";

import { Input, Button, Select, Modal, ModalRef, Toggle } from "../../components";
import useStore, { StoreType } from "../../stores";
import { VestingFormData, useVestingForm } from "./FormConfig";
import Overview from "./Overview";
import { didTokenOptionsChange, getTokenAmount, sortTokenAccounts } from "../../utils/helpers";
import {
  DATE_FORMAT,
  ERR_NOT_CONNECTED,
  timePeriodOptions,
  TIME_FORMAT,
  TRANSACTION_VARIANT,
} from "../../constants";
import { createStream } from "../../api/transactions";
import { StringOption } from "../../types";
import { calculateReleaseRate } from "../../components/StreamCard/helpers";
import { trackTransaction } from "../../utils/marketing_helpers";

interface VestingFormProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const storeGetter = (state: StoreType) => ({
  connection: state.connection(),
  wallet: state.wallet,
  walletType: state.walletType,
  token: state.token,
  tokenPriceUsd: state.tokenPriceUsd,
  myTokenAccounts: state.myTokenAccounts,
  myTokenAccountsSorted: state.myTokenAccountsSorted,
  setMyTokenAccounts: state.setMyTokenAccounts,
  setMyTokenAccountsSorted: state.setMyTokenAccountsSorted,
  addStream: state.addStream,
  setToken: state.setToken,
  cluster: state.cluster,
});

const VestingForm: FC<VestingFormProps> = ({ loading, setLoading }) => {
  const {
    connection,
    wallet,
    walletType,
    token,
    tokenPriceUsd,
    myTokenAccounts,
    setMyTokenAccounts,
    setMyTokenAccountsSorted,
    myTokenAccountsSorted,
    addStream,
    setToken,
    cluster,
  } = useStore(storeGetter);
  const tokenBalance = token?.uiTokenAmount?.uiAmount;
  const [tokenOptions, setTokenOptions] = useState<StringOption[]>([]);

  const [advanced, setAdvanced] = useState(false);
  const modalRef = useRef<ModalRef>(null);

  const { register, handleSubmit, watch, errors, setValue, trigger } = useVestingForm({
    tokenBalance: tokenBalance || 0,
  });

  const [
    amount,
    tokenSymbol,
    startDate,
    startTime,
    endDate,
    endTime,
    cliffDate,
    cliffTime,
    cliffAmount,
    releaseFrequencyCounter,
    releaseFrequencyPeriod,
    automaticWithdrawal,
    withdrawalFrequencyCounter,
    withdrawalFrequencyPeriod,
  ] = watch([
    "amount",
    "tokenSymbol",
    "startDate",
    "startTime",
    "endDate",
    "endTime",
    "cliffDate",
    "cliffTime",
    "cliffAmount",
    "releaseFrequencyCounter",
    "releaseFrequencyPeriod",
    "automaticWithdrawal",
    "withdrawalFrequencyCounter",
    "withdrawalFrequencyPeriod",
  ]);

  const updateStartDate = () => {
    const currentDate = format(new Date(), DATE_FORMAT);
    if (startDate < currentDate) setValue("startDate", currentDate, { shouldValidate: true });
    if (endDate < currentDate) setValue("endDate", currentDate);
    if (cliffDate < currentDate) setValue("cliffDate", currentDate);
  };

  const updateStartTime = () => {
    const start = new Date(startDate + "T" + startTime);
    const cliff = new Date(cliffDate + "T" + cliffTime);
    const end = new Date(endDate + "T" + endTime);

    const in2Minutes = add(new Date(), { minutes: 2 });
    const in7Minutes = add(new Date(), { minutes: 7 });

    if (start < in2Minutes) setValue("startTime", format(in2Minutes, TIME_FORMAT));
    if (cliff < in2Minutes) setValue("cliffTime", format(in2Minutes, TIME_FORMAT));
    if (end < in7Minutes) setValue("endTime", format(in7Minutes, TIME_FORMAT));
  };

  const onStartDateChange = (value: string) => {
    if (cliffDate < value) setValue("cliffDate", value);
    if (endDate < value) setValue("endDate", value);
  };

  const onStartTimeChange = (value: string) => {
    const start = getUnixTime(new Date(startDate + "T" + value));
    const end = getUnixTime(new Date(endDate + "T" + endTime));
    const cliff = getUnixTime(new Date(cliffDate + "T" + cliffTime));

    if (end < start)
      setValue(
        "endTime",
        format(add(new Date(startDate + "T" + value), { minutes: 5 }), TIME_FORMAT)
      );
    if (cliff < start)
      setValue("cliffTime", format(new Date(startDate + "T" + value), TIME_FORMAT));
  };

  useEffect(() => {
    if (myTokenAccountsSorted) {
      const newTokenOptions = myTokenAccountsSorted.map(({ info }) => ({
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
  }, [myTokenAccountsSorted, setValue]);

  useEffect(() => {
    if (!wallet) setTokenOptions([]);
  }, [wallet]);

  const updateToken = (tokenSymbol: string) => {
    const token = Object.values(myTokenAccounts).find(({ info }) => info.symbol === tokenSymbol);
    if (token) setToken(token);
  };

  const decimals = token?.uiTokenAmount?.decimals || 0;

  const onSubmit = async (values: VestingFormData) => {
    const {
      amount,
      subject,
      recipient,
      startDate,
      startTime,
      endDate,
      endTime,
      releaseFrequencyCounter,
      releaseFrequencyPeriod,
      senderCanCancel,
      recipientCanCancel,
      senderCanTransfer,
      recipientCanTransfer,
      cliffDate,
      cliffTime,
      cliffAmount,
      referral,
    } = values;

    if (!wallet?.publicKey || !connection || !walletType) return toast.error(ERR_NOT_CONNECTED);

    setLoading(true);

    const start = getUnixTime(new Date(startDate + "T" + startTime));
    const end = getUnixTime(new Date(endDate + "T" + endTime));
    const cliff = getUnixTime(new Date(cliffDate + "T" + cliffTime));
    const cliffAmountCalculated = (cliffAmount / 100) * amount;
    const amountPerPeriod = calculateReleaseRate(
      end,
      cliff,
      amount,
      cliffAmountCalculated,
      releaseFrequencyCounter * releaseFrequencyPeriod,
      decimals
    );

    const data = {
      depositedAmount: getBN(amount, decimals),
      recipient: recipient,
      mint: token.info.address,
      start,
      name: subject,
      period: Math.floor(releaseFrequencyPeriod * releaseFrequencyCounter),
      cliff: cliff,
      cliffAmount: getBN(cliffAmountCalculated, decimals),
      amountPerPeriod: getBN(amountPerPeriod, decimals),
      cancelableBySender: senderCanCancel,
      cancelableByRecipient: recipientCanCancel,
      transferableBySender: senderCanTransfer,
      transferableByRecipient: recipientCanTransfer,
      automaticWithdrawal,
      withdrawalFrequency: automaticWithdrawal
        ? withdrawalFrequencyCounter * withdrawalFrequencyPeriod
        : 0,
      canTopup: false,
      partner: referral,
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
      const updatedTokenAccounts = {
        ...myTokenAccounts,
        [mint]: { ...myTokenAccounts[mint], uiTokenAmount: updatedTokenAmount },
      };
      setMyTokenAccounts(updatedTokenAccounts);

      const myTokenAccountsSorted = sortTokenAccounts(updatedTokenAccounts);
      setMyTokenAccountsSorted(myTokenAccountsSorted);

      setToken({ ...token, uiTokenAmount: updatedTokenAmount });

      const streamflowFeeTotal = getNumberFromBN(
        response.stream.streamflowFeeTotal,
        token.uiTokenAmount.decimals
      );

      const depositedAmount = getNumberFromBN(
        response.stream.streamflowFeeTotal,
        token.uiTokenAmount.decimals
      );
      trackTransaction(
        response.id,
        token.info.symbol,
        token.info.name,
        tokenPriceUsd,
        TRANSACTION_VARIANT.CREATE_VESTING,
        streamflowFeeTotal * tokenPriceUsd,
        streamflowFeeTotal,
        depositedAmount,
        depositedAmount * tokenPriceUsd,
        walletType.name
      );
    }
  };

  const updateReleaseFrequencyCounter = (value: string) => {
    setValue("releaseFrequencyCounter", parseInt(value));
    trigger("releaseFrequencyPeriod");
  };
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="block my-4">
        <div className="grid gap-y-5 gap-x-3 sm:gap-x-4 grid-cols-6 sm:grid-cols-2">
          <Input
            type="number"
            label="Amount"
            placeholder="0.00"
            error={errors?.amount?.message}
            classes="col-span-3 sm:col-span-1"
            {...register("amount")}
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
            type="text"
            label="Subject / Title"
            placeholder="e.g. Streamflow VC - seed round"
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
            customChange={onStartDateChange}
            onClick={updateStartDate}
            classes="col-span-3 sm:col-span-1"
            error={errors?.startDate?.message}
            required
            {...register("startDate")}
          />
          <Input
            type="time"
            label="Start Time"
            onClick={updateStartTime}
            customChange={onStartTimeChange}
            classes="col-span-3 sm:col-span-1"
            error={errors?.startDate?.message ? "" : errors?.startTime?.message}
            required
            {...register("startTime")}
          />
          <Input
            type="date"
            label="End Date"
            min={format(new Date(), DATE_FORMAT)}
            customChange={() => trigger("releaseFrequencyPeriod")}
            classes="col-span-3 sm:col-span-1"
            error={errors?.endDate?.message}
            required
            {...register("endDate")}
          />
          <Input
            type="time"
            label="End Time"
            classes="col-span-3 sm:col-span-1"
            customChange={() => trigger("releaseFrequencyPeriod")}
            error={errors?.endDate?.message ? "" : errors?.endTime?.message}
            required
            {...register("endTime")}
          />
          <div className="grid gap-x-1 sm:gap-x-2 grid-cols-2 col-span-4 sm:col-span-1">
            <label className="block text-base text-gray-light text-gray-light capitalize col-span-2">
              Release Frequency
            </label>
            <Input
              type="number"
              min={1}
              step={1}
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
              error={errors?.releaseFrequencyPeriod?.message}
            />
          </div>
          <div className="grid gap-y-5 gap-x-1 sm:gap-x-2 grid-cols-5 col-span-full">
            <Input
              type="date"
              label="Cliff Date"
              min={format(new Date(), DATE_FORMAT)}
              customChange={() => trigger("releaseFrequencyPeriod")}
              classes="col-span-2"
              error={errors?.cliffDate?.message}
              required
              {...register("cliffDate")}
            />
            <Input
              type="time"
              label="Cliff Time"
              classes="col-span-2"
              customChange={() => trigger("releaseFrequencyPeriod")}
              error={errors?.cliffDate?.message ? "" : errors?.cliffTime?.message}
              required
              {...register("cliffTime")}
            />
            <div className="relative col-span-1 sm:col-span-1">
              <Input
                type="number"
                label="Release"
                min={0}
                max={100}
                inputClasses="pr-9"
                error={errors?.cliffAmount?.message}
                {...register("cliffAmount")}
              />
              <span className="absolute text-gray-light text-base right-2 sm:right-4 bottom-2">
                %
              </span>
            </div>
          </div>
          <Toggle
            checked={automaticWithdrawal}
            labelRight="Automatic Withdrawal"
            classes="col-span-full"
            customChange={() => setValue("automaticWithdrawal", !automaticWithdrawal)}
            {...register("automaticWithdrawal")}
          />
          {automaticWithdrawal && (
            <div className="col-span-full grid grid-cols-6 gap-y-0 gap-x-1 sm:gap-x-2 sm:grid-cols-4">
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
                classes="col-span-2 sm:col-span-1"
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
            <div className="grid gap-y-5 gap-x-1 sm:gap-x-2 grid-cols-5 col-span-full">
              <div className="col-span-full grid grid-cols-6 sm:grid-cols-2 gap-y-5 gap-x-3 sm:gap-x-4">
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
              </div>
              <Input
                type="text"
                label="Referral Address"
                placeholder="Please double check the address"
                classes="col-span-full"
                error={errors?.referral?.message}
                {...register("referral")}
              />
            </div>
          )}
        </div>

        {wallet?.connected && (
          <>
            <Overview
              {...{
                amount,
                tokenSymbol,
                endDate,
                endTime,
                cliffDate,
                cliffTime,
                cliffAmount,
                releaseFrequencyCounter,
                releaseFrequencyPeriod,
                decimals,
                automaticWithdrawal,
                startTime,
                startDate,
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

export default VestingForm;