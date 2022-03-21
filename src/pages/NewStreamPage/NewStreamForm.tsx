import { FC, useEffect, useState, useRef } from "react";

import { add, format, getUnixTime } from "date-fns";
import { PublicKey } from "@solana/web3.js";
import { toast } from "react-toastify";
import { BN, getBN, getNumberFromBN } from "@streamflow/stream";

import { Input, Button, Select, Modal, ModalRef, Toggle, Balance } from "../../components";
import useStore, { StoreType } from "../../stores";
import { StreamsFormData, useStreamsForm } from "./FormConfig";
import { createStream } from "../../api/transactions";
import {
  calculateWithdrawalFees,
  didTokenOptionsChange,
  getTokenAmount,
  sortTokenAccounts,
} from "../../utils/helpers";
import {
  DATE_FORMAT,
  TIME_FORMAT,
  ERR_NOT_CONNECTED,
  timePeriodOptions,
  ERRORS,
  TRANSACTION_VARIANT,
  transferCancelOptions,
} from "../../constants";
import { StringOption, TransferCancelOptions } from "../../types";
import Overview from "./Overview";
import { trackTransaction } from "../../utils/marketing_helpers";
import Description from "./Description";

interface NewStreamFormProps {
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
  myTokenAccountsSorted: state.myTokenAccountsSorted,
  setMyTokenAccountsSorted: state.setMyTokenAccountsSorted,
  addStream: state.addStream,
  setToken: state.setToken,
});

const NewStreamForm: FC<NewStreamFormProps> = ({ loading, setLoading }) => {
  const {
    connection,
    wallet,
    walletType,
    token,
    tokenPriceUsd,
    myTokenAccounts,
    setMyTokenAccounts,
    myTokenAccountsSorted,
    setMyTokenAccountsSorted,
    addStream,
    setToken,
    cluster,
  } = useStore(storeGetter);
  const tokenBalance = token?.uiTokenAmount?.uiAmount;
  const [tokenOptions, setTokenOptions] = useState<StringOption[]>([]);

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
      whoCanTransfer,
      whoCanCancel,
      referral,
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
      cancelableBySender:
        whoCanCancel === TransferCancelOptions.Sender ||
        whoCanCancel === TransferCancelOptions.Both,
      cancelableByRecipient:
        whoCanCancel === TransferCancelOptions.Recipient ||
        whoCanCancel === TransferCancelOptions.Both,
      transferableBySender:
        whoCanTransfer === TransferCancelOptions.Sender ||
        whoCanTransfer === TransferCancelOptions.Both,
      transferableByRecipient:
        whoCanTransfer === TransferCancelOptions.Recipient ||
        whoCanTransfer === TransferCancelOptions.Both,
      automaticWithdrawal,
      withdrawalFrequency: automaticWithdrawal
        ? withdrawalFrequencyCounter * withdrawalFrequencyPeriod
        : 0,
      canTopup: true,
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

      trackTransaction(
        response.id,
        token.info.symbol,
        token.info.name,
        tokenPriceUsd,
        TRANSACTION_VARIANT.CREATE_STREAM,
        streamflowFeeTotal * tokenPriceUsd,
        streamflowFeeTotal,
        depositedAmount,
        depositedAmount * tokenPriceUsd,
        walletType.name
      );
    }
  };

  const start = getUnixTime(new Date(startDate + "T" + startTime)); // gives us seconds
  const releasePeriod = releaseFrequencyCounter * releaseFrequencyPeriod;
  const end = start + Math.ceil(depositedAmount / releaseAmount) * releasePeriod;

  const withdrawalFees = automaticWithdrawal
    ? calculateWithdrawalFees(
        start,
        start,
        end,
        withdrawalFrequencyCounter * withdrawalFrequencyPeriod
      )
    : 0;

  return (
    <>
      <div className="xl:mr-12 px-4 sm:px-0 pt-4">
        <Description classes="sm:hidden" />
        <Balance classes="sm:hidden" />
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="block mt-4 mb-8">
          <div className="grid gap-y-5 gap-x-3 grid-cols-6 sm:grid-cols-2">
            <Input
              type="number"
              label="Amount"
              customChange={updateReleaseAmountError}
              placeholder="0.00"
              classes="col-span-full sm:col-span-1"
              error={errors?.depositedAmount?.message}
              data-testid="stream-amount"
              {...register("depositedAmount")}
            />
            {wallet && tokenOptions.length ? (
              <Select
                label="Token"
                options={tokenOptions}
                error={errors?.tokenSymbol?.message}
                customChange={updateToken}
                {...register("tokenSymbol")}
                classes="col-span-full sm:col-span-1"
              />
            ) : (
              <div className="col-span-3 sm:col-span-1">
                <label className="text-white font-bold text-base cursor-pointer mb-1 block">
                  Token
                </label>
                <p className="text-base font-medium text-blue">No tokens available.</p>
              </div>
            )}
            <Input
              type="number"
              label="Release Amount"
              placeholder="0.00"
              error={errors?.releaseAmount?.message}
              classes="col-span-full sm:col-span-1"
              data-testid="stream-release-amount"
              {...register("releaseAmount")}
            />
            <div className="grid gap-x-2 grid-cols-2 sm:grid-cols-2 col-span-full sm:col-span-1">
              <label className="block text-base text-white font-bold capitalize col-span-full">
                Release Frequency
              </label>
              <Input
                type="number"
                min={1}
                step={1}
                error={
                  errors?.releaseFrequencyCounter?.message ||
                  errors?.releaseFrequencyPeriod?.message
                }
                customChange={updateReleaseFrequencyCounter}
                data-testid="stream-release-frequency"
                {...register("releaseFrequencyCounter")}
              />
              <Select
                options={timePeriodOptions}
                plural={releaseFrequencyCounter > 1}
                {...register("releaseFrequencyPeriod")}
                error={errors?.releaseFrequencyPeriod?.message}
              />
            </div>
            <Input
              type="text"
              label="Contract Title"
              placeholder="e.g. VC Seed Round"
              classes="col-span-full"
              error={errors?.subject?.message}
              data-testid="stream-title"
              {...register("subject")}
            />
            <Input
              type="text"
              label="Recipient Wallet Address"
              placeholder="Please double check the address"
              classes="col-span-full"
              description="Make sure this is not a centralized exchange address."
              error={errors?.recipient?.message}
              data-testid="stream-recipient"
              {...register("recipient")}
            />
            <Input
              type="date"
              label="Start Date"
              min={format(new Date(), DATE_FORMAT)}
              onClick={updateStartDate}
              classes="col-span-3 sm:col-span-1"
              error={errors?.startDate?.message || ""}
              data-testid="stream-start-date"
              required
              {...register("startDate")}
            />
            <Input
              type="time"
              label="Start Time"
              classes="col-span-3 sm:col-span-1 mb-2"
              error={errors?.startDate?.message ? "" : errors?.startTime?.message}
              data-test-id="stream-start-time"
              onClick={updateStartTime}
              required
              {...register("startTime")}
            />
            <div className="col-span-full grid grid-cols-2 border-t border-gray-dark pt-6 pb-2 gap-x-4 gap-y-5">
              <Select
                label="Who Can Transfer Contract?"
                options={transferCancelOptions}
                {...register("whoCanTransfer")}
                classes="col-span-full sm:col-span-1"
                data-testid="stream-who-can-transfer"
              />
              <Select
                label="Who Can Cancel Contract?"
                options={transferCancelOptions}
                {...register("whoCanCancel")}
                classes="col-span-full sm:col-span-1"
                data-testid="stream-who-can-cancel"
              />
            </div>
            <div className="border-t border-b border-gray-dark py-6 col-span-full">
              <h5 className="text-gray font-bold text-xs tracking-widest mb-5">
                WITHDRAW SETTINGS
              </h5>
              <Toggle
                checked={automaticWithdrawal}
                labelRight="Automatic Withdraw"
                classes="col-span-full"
                customChange={() => setValue("automaticWithdrawal", !automaticWithdrawal)}
                {...register("automaticWithdrawal")}
              />
              {automaticWithdrawal && (
                <div className="col-span-full grid grid-cols-6 gap-y-0 gap-x-3 sm:gap-x-4 mt-5">
                  <label className="block text-base text-white font-bold capitalize col-span-full">
                    Withdrawal Frequency
                  </label>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    classes="col-span-3"
                    customChange={() => trigger("withdrawalFrequencyPeriod")}
                    data-testid="stream-withdrawal-frequency"
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
                    classes="col-span-3"
                    error={errors?.withdrawalFrequencyPeriod?.message}
                  />
                  <p className="text-gray-light text-xxs leading-4 mt-3 col-span-full">
                    When automatic withdrawal is enabled there are additional fees ( 5000 lamports )
                    per every withdrawal.{" "}
                    {withdrawalFees > 0 && (
                      <>
                        For this stream there will be
                        <span className="font-bold">{` ${withdrawalFees.toFixed(6)} SOL`}</span> in
                        withdrawal fees.
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
          <Overview
            classes="sm:hidden"
            {...{
              depositedAmount,
              releaseAmount,
              tokenSymbol,
              startDate,
              startTime,
              releaseFrequencyCounter,
              releaseFrequencyPeriod,
            }}
          />
          {wallet?.connected && (
            <>
              <Button
                type="submit"
                background="blue"
                classes="py-2 px-4 font-bold my-5 text-sm"
                disabled={loading}
                data-testid="create-streaming"
              >
                Create Streaming Contract
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
      </div>
      <div className="my-4 pl-3 pr-6 grow-1">
        <Balance classes="hidden sm:block" />
        <Description classes="hidden sm:block" />
        <Overview
          classes="hidden sm:block sm:mt-6"
          {...{
            depositedAmount,
            releaseAmount,
            tokenSymbol,
            startDate,
            startTime,
            releaseFrequencyCounter,
            releaseFrequencyPeriod,
          }}
        />
        <div className="pt-6 border-t border-gray-dark">
          <Input
            type="text"
            label="Referral Address"
            placeholder="Paste referral address here..."
            classes="col-span-full"
            description="Enter the referral address of the person who referred you."
            error={errors?.referral?.message}
            data-testid="stream-referral-address"
            {...register("referral")}
          />
        </div>
      </div>
    </>
  );
};

export default NewStreamForm;
