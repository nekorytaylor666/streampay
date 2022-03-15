import { FC, useEffect, useState, useRef } from "react";

import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { add, format, getUnixTime } from "date-fns";
import { PublicKey } from "@solana/web3.js";
import { toast } from "react-toastify";
import { BN, getBN, getNumberFromBN } from "@streamflow/stream";

import { Input, Button, Select, Modal, ModalRef, Toggle } from "../../components";
import useStore, { StoreType } from "../../stores";
import { StreamsFormData, useStreamsForm } from "./FormConfig";
import { createStream } from "../../api/transactions";
import { didTokenOptionsChange, getTokenAmount, sortTokenAccounts } from "../../utils/helpers";
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
  myTokenAccountsSorted: state.myTokenAccountsSorted,
  setMyTokenAccountsSorted: state.setMyTokenAccountsSorted,
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
      senderCanCancel,
      recipientCanCancel,
      senderCanTransfer,
      recipientCanTransfer,
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
      cancelableBySender: senderCanCancel,
      cancelableByRecipient: recipientCanCancel,
      transferableBySender: senderCanTransfer,
      transferableByRecipient: recipientCanTransfer,
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

  return (
    <>
      <div className="xl:mr-12">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="block my-4">
          <div className="grid gap-y-5 gap-x-3 sm:gap-x-4 grid-cols-6 sm:grid-cols-2">
            <Input
              type="number"
              label="Amount"
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
              classes="col-span-3 sm:col-span-1"
              {...register("releaseAmount")}
            />
            <div className="grid gap-x-1 sm:gap-x-2 grid-cols-5 sm:grid-cols-2 col-span-3 sm:col-span-1">
              <label className="block text-base text-white font-bold capitalize col-span-full">
                Release Frequency
              </label>
              <Input
                type="number"
                min={1}
                step={1}
                classes="col-span-2 sm:col-span-1"
                error={
                  errors?.releaseFrequencyCounter?.message ||
                  errors?.releaseFrequencyPeriod?.message
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
              label="Contract Title"
              placeholder="e.g. VC Seed Round"
              classes="col-span-full"
              error={errors?.subject?.message}
              {...register("subject")}
            />
            <Input
              type="text"
              label="Recipient Wallet Address"
              placeholder="Please double check the address"
              classes="col-span-full"
              description="Make sure this is not a centralized exchange address."
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
            <div className="col-span-full grid grid-cols-1 border-t-2 border-b-2 border-[#2A3441]">
              <Disclosure>
                {({ open }) => (
                  <>
                    <Disclosure.Button className={` gap-y-15 ${open && "rounded-b-none"}`}>
                      <div className="flex items-center mb-7 mt-3 pt-3">
                        <ChevronDownIcon
                          className={`h-6 text-primary-light fill-[#718298] transition-all w-6 ${
                            open ? "transform rotate-180" : "transform rotate-360"
                          }`}
                        />
                        <h2 className="mb-0 block text-base text-gray-light capitalize col-span-2">
                          Advanced settings
                        </h2>
                      </div>
                    </Disclosure.Button>
                    <Disclosure.Panel className={`pb-6 `}>
                      <div className="col-span-4 sm:col-span-1 mt-3">
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
                      <div className="col-span-4 sm:col-span-1 mb-5">
                        <label className="text-gray-light text-base cursor-pointer col-span-1 mb-1 block">
                          Who can cancel?
                        </label>
                        <div className="bg-field rounded-md grid grid-cols-2 gap-x-2 px-2.5 sm:px-3 py-2 mb-3">
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
                        <div className="border-t-2 border-[#2A3441] pt-3 pb-7">
                          <h5 className="text-[#718298] font-bold text-xs tracking-widest pt-2 pb-4">
                            {" "}
                            WITHDRAW SETTINGS
                          </h5>
                          <Toggle
                            checked={automaticWithdrawal}
                            labelRight="Automatic Withdraw"
                            classes="col-span-full"
                            customChange={() =>
                              setValue("automaticWithdrawal", !automaticWithdrawal)
                            }
                            {...register("automaticWithdrawal")}
                          />
                          {automaticWithdrawal && (
                            <div className="col-span-full grid grid-cols-6 gap-y-0 gap-x-1 sm:gap-x-2 sm:grid-cols-4 mt-3">
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
                        </div>
                        <div className="border-t-2 border-[#2A3441] pt-3">
                          <h5 className="text-[#718298] font-bold text-xs tracking-widest pt-2 pb-4">
                            {" "}
                            REFERAL PROGRAM
                          </h5>
                          <Input
                            type="text"
                            label="Referral Address"
                            placeholder="Please double check the address"
                            classes="col-span-full"
                            error={errors?.referral?.message}
                            {...register("referral")}
                          />
                        </div>
                      </div>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            </div>
          </div>
          {wallet?.connected && (
            <>
              <Button
                type="submit"
                background="blue"
                classes="py-2 px-4 font-bold my-5 text-sm"
                disabled={loading}
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
      <div className="my-4">
        <label className="text-gray-light text-base font-bold cursor-pointer block">
          New Stream
        </label>
        <p className="my-3 text-xs text-gray-light font-weight-400">
          Set up the amount you want to deposit, release amount, release frequency, start date and
          you’re good to go. Additionally, choose Transfer and Cancel preferences.
        </p>
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
      </div>
    </>
  );
};

export default StreamsForm;
