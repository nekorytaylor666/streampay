import { FC, useEffect, useState, useRef } from "react";

import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { add, format, getUnixTime } from "date-fns";
import { PublicKey } from "@solana/web3.js";
import { toast } from "react-toastify";
import { getBN, getNumberFromBN } from "@streamflow/stream";

import { Input, Button, Select, Modal, ModalRef, Toggle, Balance, Link } from "../../components";
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
      <div className="xl:mr-12">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="block my-4">
          <div className="grid gap-y-5 gap-x-3 sm:gap-x-4 grid-cols-6 sm:grid-cols-2">
            <Input
              type="number"
              label="Amount"
              placeholder="0.00"
              error={errors?.amount?.message}
              classes="col-span-3 sm:col-span-1"
              dataTestId="vesting-amount"
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
              label="Recipient Account"
              placeholder="Please double check the address"
              classes="col-span-full"
              description="Make sure this is not a centralized exchange address."
              error={errors?.recipient?.message}
              dataTestId="vesting-recipient"
              {...register("recipient")}
            />
            <Input
              type="text"
              label="Contract Title"
              placeholder="e.g. VC Seed Round"
              classes="col-span-full"
              error={errors?.subject?.message}
              dataTestId="vesting-title"
              {...register("subject")}
            />
            <Input
              type="date"
              label="Start Date"
              min={format(new Date(), DATE_FORMAT)}
              customChange={onStartDateChange}
              onClick={updateStartDate}
              classes="col-span-3 sm:col-span-1"
              error={errors?.startDate?.message}
              dataTestId="vesting-start-date"
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
              dataTestId="vesting-start-time"
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
              dataTestId="vesting-end-date"
              required
              {...register("endDate")}
            />
            <Input
              type="time"
              label="End Time"
              classes="col-span-3 sm:col-span-1"
              customChange={() => trigger("releaseFrequencyPeriod")}
              error={errors?.endDate?.message ? "" : errors?.endTime?.message}
              dataTestId="vesting-end-time"
              required
              {...register("endTime")}
            />
            <div className="grid gap-x-1 sm:gap-x-2 grid-cols-2 col-span-4 sm:col-span-1">
              <label className="block text-base text-white font-bold capitalize col-span-2">
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
                dataTestId="vesting-release-frequency"
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
                      <div className="grid gap-y-5 gap-x-1 sm:gap-x-2 grid-cols-5 col-span-full">
                        <Input
                          type="date"
                          label="Cliff Date"
                          min={format(new Date(), DATE_FORMAT)}
                          customChange={() => trigger("releaseFrequencyPeriod")}
                          classes="col-span-2"
                          error={errors?.cliffDate?.message}
                          dataTestId="vesting-cliff-date"
                          required
                          {...register("cliffDate")}
                        />
                        <Input
                          type="time"
                          label="Cliff Time"
                          classes="col-span-2"
                          customChange={() => trigger("releaseFrequencyPeriod")}
                          error={errors?.cliffDate?.message ? "" : errors?.cliffTime?.message}
                          dataTestId="vesting-cliff-time"
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
                            dataTestId="vesting-cliff-amount"
                            {...register("cliffAmount")}
                          />
                          <span className="absolute text-gray-light text-base right-2 sm:right-4 bottom-2">
                            %
                          </span>
                        </div>
                      </div>
                      <div className="col-span-4 sm:col-span-1 mt-3">
                        <label className="text-gray-light text-base mb-1 block">
                          Who can transfer the stream?
                        </label>
                        <div className="bg-field rounded-md grid grid-cols-2 gap-x-2 px-2.5 sm:px-3 py-2">
                          <Input
                            type="checkbox"
                            label="sender"
                            classes="col-span-1"
                            dataTestId="vesting-sender-transfer"
                            {...register("senderCanTransfer")}
                          />
                          <Input
                            type="checkbox"
                            label="recipient"
                            classes="col-span-1"
                            dataTestId="vesting-recipient-transfer"
                            {...register("recipientCanTransfer")}
                          />
                        </div>
                      </div>
                      <div className="col-span-4 sm:col-span-1">
                        <label className="text-gray-light text-base col-span-1 mb-1 block">
                          Who can cancel?
                        </label>
                        <div className="bg-field rounded-md grid grid-cols-2 gap-x-2 px-2.5 sm:px-3 py-2 mb-3">
                          <Input
                            type="checkbox"
                            label="sender"
                            classes="col-span-1"
                            dataTestId="vesting-sender-cancel"
                            {...register("senderCanCancel")}
                          />
                          <Input
                            type="checkbox"
                            label="recipient"
                            classes="col-span-1"
                            dataTestId="vesting-recipient-transfer"
                            {...register("recipientCanCancel")}
                          />
                        </div>
                        <div className="border-t-2 border-[#2A3441] pt-3">
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
                                dataTestId="vesting-withdrawal-frequency"
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
                dataTestId="create-vesting"
              >
                Create Vesting Contract
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
        <div />
      </div>
      <div className="my-4">
        <Balance></Balance>
        <label className="text-gray-light text-base font-bold block">New Vesting</label>
        <p className="my-3 text-xs text-gray-light font-weight-400">
          Ideal for token vesting! Set up the amount you want to vest, start-end date, release
          frequency and you’re good to go.
        </p>
        <p className="my-3 text-xs text-gray-light font-weight-400">
          Additionally, you can specify the cliff date and amount when the initial tokens will be
          released to the recipient or set up Transfer and Cancel preferences.
        </p>
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
        <div className="border-t-1 border-[#2A3441] pt-3">
          <label className="text-gray-light text-base font-bold block mb-4">Referal address</label>
          <Input
            type="text"
            placeholder="Paste referral address here..."
            classes="col-span-full"
            description="Refer someone to use Streamflow with your referral key and you'll earn a percentage of the fees paid."
            error={errors?.referral?.message}
            dataTestId="vesting-referral-address"
            {...register("referral")}
          />
        </div>
        <label className="text-gray-light text-base font-bold block">Need a custom deal?</label>
        <Link
          title="Contact us"
          url="https://discordapp.com/channels/851921970169511976/888391406576627732"
          classes="inline-block text-p3 text-blue"
        />
      </div>
    </>
  );
};

export default VestingForm;
