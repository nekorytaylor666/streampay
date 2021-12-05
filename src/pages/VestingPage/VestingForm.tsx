import { FC, useEffect, useState, useRef } from "react";

import { add, format, getUnixTime } from "date-fns";
import { BN } from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { toast } from "react-toastify";

import { Input, Button, Select, Modal, ModalRef, Toggle, WalletPicker } from "../../components";
import useStore, { StoreType } from "../../stores";
import { VestingFormData, useVestingForm } from "./FormConfig";
import sendTransaction from "../../actions/sendTransaction";
import Overview from "./Overview";
import { getTokenAmount } from "../../utils/helpers";
import {
  DATE_FORMAT,
  ERR_NOT_CONNECTED,
  timePeriodOptions,
  ProgramInstruction,
  TIME_FORMAT,
} from "../../constants";
import { StringOption } from "../../types";

interface VestingFormProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const storeGetter = (state: StoreType) => ({
  connection: state.connection(),
  wallet: state.wallet,
  token: state.token,
  myTokenAccounts: state.myTokenAccounts,
  setMyTokenAccounts: state.setMyTokenAccounts,
  addStream: state.addStream,
  setToken: state.setToken,
});

const VestingForm: FC<VestingFormProps> = ({ loading, setLoading }) => {
  const { connection, wallet, token, myTokenAccounts, setMyTokenAccounts, addStream, setToken } =
    useStore(storeGetter);
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
  ]);

  const updateStartDate = () => {
    const currentDate = format(new Date(), DATE_FORMAT);
    if (startDate < currentDate) setValue("startDate", currentDate, { shouldValidate: true });
    if (endDate < currentDate) setValue("endDate", currentDate);
    if (!advanced || cliffDate < currentDate) setValue("cliffDate", currentDate);
  };

  const updateStartTime = () => {
    const start = new Date(startDate + "T" + startTime);
    const cliff = new Date(cliffDate + "T" + cliffTime);
    const end = new Date(endDate + "T" + endTime);

    const in2Minutes = add(new Date(), { minutes: 2 });
    const in7Minutes = add(new Date(), { minutes: 7 });

    if (start < in2Minutes) setValue("startTime", format(in2Minutes, TIME_FORMAT));
    if (!advanced || cliff < in2Minutes) setValue("cliffTime", format(in2Minutes, TIME_FORMAT));
    if (end < in7Minutes) setValue("endTime", format(in7Minutes, TIME_FORMAT));
  };

  const onStartDateChange = (value: string) => {
    if (!advanced || cliffDate < value) setValue("cliffDate", value);
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
    if (!advanced || cliff < start)
      setValue("cliffTime", format(new Date(startDate + "T" + value), TIME_FORMAT));
  };

  useEffect(() => {
    if (myTokenAccounts) {
      const newTokenOptions = Object.values(myTokenAccounts).map(({ info }) => ({
        value: info.symbol,
        label: info.symbol,
        icon: info.logoURI,
      }));

      if (newTokenOptions.length) {
        setTokenOptions(newTokenOptions);
        setValue("tokenSymbol", newTokenOptions[0].value);
      }
    }
  }, [myTokenAccounts, setValue]);

  useEffect(() => {
    if (!wallet) setTokenOptions([]);
  }, [wallet]);

  const updateToken = (tokenSymbol: string) => {
    const token = Object.values(myTokenAccounts).find(({ info }) => info.symbol === tokenSymbol);
    if (token) setToken(token);
  };

  const onSubmit = async (values: VestingFormData) => {
    const newStream = Keypair.generate();
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
      ownershipTransferable,
      cliffDate,
      cliffTime,
      cliffAmount,
    } = values;

    if (!wallet?.publicKey || !connection) return toast.error(ERR_NOT_CONNECTED);

    setLoading(true);

    const start = getUnixTime(new Date(startDate + "T" + startTime));
    const end = getUnixTime(new Date(endDate + "T" + endTime));

    const data = {
      deposited_amount: new BN(amount * 10 ** token.uiTokenAmount.decimals),
      recipient: new PublicKey(recipient),
      mint: new PublicKey(token.info.address),
      start_time: new BN(start),
      end_time: new BN(end),
      period: new BN(advanced ? releaseFrequencyPeriod * releaseFrequencyCounter : 1),
      cliff: new BN(advanced ? +new Date(cliffDate + "T" + cliffTime) / 1000 : start),
      cliff_amount: new BN(
        (advanced ? (cliffAmount / 100) * amount : 0) * 10 ** token.uiTokenAmount.decimals
      ),
      release_rate: new BN(0),
      new_stream_keypair: newStream,
      stream_name: subject,
      cancelable_by_sender: senderCanCancel,
      cancelable_by_recipient: recipientCanCancel,
      transferable: ownershipTransferable,
      withdrawal_public: false,
    };

    const recipientAccount = await connection?.getAccountInfo(new PublicKey(recipient));
    if (!recipientAccount) {
      const shouldContinue = await modalRef?.current?.show();
      if (!shouldContinue) return setLoading(false);
    }

    // @ts-ignore
    const success = await sendTransaction(ProgramInstruction.Create, data);
    setLoading(false);

    if (success) {
      addStream(newStream.publicKey.toBase58(), {
        ...data,
        closable_at: new BN(end),
        last_withdrawn_at: new BN(0),
        withdrawn_amount: new BN(0),
        canceled_at: new BN(0),
        created_at: new BN(+new Date() / 1000),
        escrow_tokens: undefined as any,
        magic: new BN(0),
        recipient_tokens: undefined as any,
        sender: wallet.publicKey,
        sender_tokens: undefined as any,
        total_amount: new BN(amount),
      });

      const mint = token.info.address;

      const updatedTokenAmount = await getTokenAmount(connection, wallet, mint);
      setMyTokenAccounts({
        ...myTokenAccounts,
        [mint]: { ...myTokenAccounts[mint], uiTokenAmount: updatedTokenAmount },
      });
      setToken({ ...token, uiTokenAmount: updatedTokenAmount });
    }
  };

  const updateReleaseFrequencyCounter = (value: string) => {
    setValue("releaseFrequencyCounter", parseInt(value));
    trigger("releaseFrequencyPeriod");
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="block my-4">
        <div className="grid gap-y-5 gap-x-3 sm:gap-x-4 grid-cols-5 sm:grid-cols-2">
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
              classes="col-span-2 sm:col-span-1"
            />
          ) : (
            <div className="col-span-2 sm:col-span-1">
              <label className="text-gray-200 text-sm sm:text-base cursor-pointer">Token</label>
              <p className="text-base font-medium text-primary">Please connect.</p>
            </div>
          )}
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
            customChange={onStartDateChange}
            onClick={updateStartDate}
            classes="col-span-2 sm:col-span-1"
            error={errors?.startDate?.message}
            {...register("startDate")}
          />
          <Input
            type="time"
            label="Start Time"
            onClick={updateStartTime}
            customChange={onStartTimeChange}
            classes="col-span-2 sm:col-span-1"
            error={errors?.startTime?.message}
            {...register("startTime")}
          />
          <Input
            type="date"
            label="End Date"
            min={format(new Date(), DATE_FORMAT)}
            customChange={() => trigger("releaseFrequencyPeriod")}
            classes="col-span-2 sm:col-span-1"
            error={errors?.endDate?.message}
            {...register("endDate")}
          />
          <Input
            type="time"
            label="End Time"
            classes="col-span-2 sm:col-span-1"
            customChange={() => trigger("releaseFrequencyPeriod")}
            error={errors?.endTime?.message}
            {...register("endTime")}
          />
          <div className="grid gap-x-1 sm:gap-x-2 grid-cols-2 col-span-4 sm:col-span-1">
            <label className="block text-base text-gray-100 text-gray-200 capitalize col-span-2">
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
          <Toggle
            enabled={advanced}
            setEnabled={setAdvanced}
            labelRight="Advanced"
            classes="col-span-full mt-1"
          />
          {advanced && (
            <div className="grid gap-3 sm:gap-4 grid-cols-5 col-span-full">
              <Input
                type="date"
                label="Cliff Date"
                min={format(new Date(), DATE_FORMAT)}
                customChange={() => trigger("releaseFrequencyPeriod")}
                classes="col-span-2"
                error={errors?.cliffDate?.message}
                {...register("cliffDate")}
              />
              <Input
                type="time"
                label="Cliff Time"
                classes="col-span-2"
                customChange={() => trigger("releaseFrequencyPeriod")}
                error={errors?.cliffTime?.message}
                {...register("cliffTime")}
              />
              <div className="relative col-span-2 sm:col-span-1">
                <Input
                  type="number"
                  label="Release"
                  min={0}
                  max={100}
                  inputClasses="pr-9"
                  error={errors?.cliffAmount?.message}
                  {...register("cliffAmount")}
                />
                <span className="absolute text-gray-300 text-base right-2 sm:right-4 bottom-2">
                  %
                </span>
              </div>
              <div className="bg-gray-800 col-span-full rounded-md grid grid-cols-1 gap-2 p-2.5 sm:p-3 mt-2">
                <Input
                  type="checkbox"
                  label="Sender can cancel?"
                  {...register("senderCanCancel")}
                />
                <Input
                  type="checkbox"
                  label="Recipient can cancel?"
                  {...register("recipientCanCancel")}
                />
                <Input
                  type="checkbox"
                  label="Ownership transferable?"
                  {...register("ownershipTransferable")}
                />
              </div>
            </div>
          )}
        </div>
        {wallet?.connected ? (
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
                releaseFrequencyError: errors.releaseFrequencyPeriod,
              }}
            />
            <Button
              type="submit"
              primary
              classes="px-16 py-4 font-bold text-xl my-5"
              disabled={loading}
            >
              Create
            </Button>
          </>
        ) : (
          <WalletPicker
            classes="px-8 py-4 font-bold text-xl my-8 sm:my-10"
            title="Connect wallet"
          />
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
