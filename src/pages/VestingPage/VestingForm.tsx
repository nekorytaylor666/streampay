import { FC, useEffect, useState, useRef, useCallback } from "react";

import { add, format, getUnixTime } from "date-fns";
// import { PublicKey } from "@solana/web3.js";
import * as Sentry from "@sentry/react";
import { toast } from "react-toastify";
import { getBN, CreateMultiError, Cluster } from "@streamflow/stream";

import { useStreams } from "../../hooks/useStream";
import {
  Input,
  Button,
  Select,
  Modal,
  ModalRef,
  Toggle,
  Balance,
  RecipientVestingForm as Recipient,
  FinanceFee,
  MsgToast,
} from "../../components";
import useStore, { StoreType } from "../../stores";
import { VestingFormData, useVestingForm } from "./FormConfig";
import Overview from "./Overview";
import {
  calculateWithdrawalFees,
  didTokenOptionsChange,
  getTokenAmount,
  sortTokenAccounts,
} from "../../utils/helpers";
import {
  BATCH_MAINNET_RECIPIENT_LIMIT,
  DATE_FORMAT,
  ERR_NOT_CONNECTED,
  timePeriodOptions,
  TIME_FORMAT,
  // TRANSACTION_VARIANT,
  transferCancelOptions,
} from "../../constants";
import { createMultiple } from "../../api/transactions";
import SettingsClient, { ContractSettingsRequest } from "../../api/contractSettings";
import { StringOption, TransferCancelOptions } from "../../types";
import { calculateReleaseRate } from "../../components/StreamCard/helpers";
import Description from "./Description";
// import { trackTransaction } from "../../utils/marketing_helpers";

interface VestingFormProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const storeGetter = (state: StoreType) => ({
  Stream: state.StreamInstance,
  connection: state.StreamInstance?.getConnection(),
  isMainnet: state.cluster === Cluster.Mainnet,
  wallet: state.wallet,
  walletType: state.walletType,
  messageSignerWallet: state.messageSignerWallet,
  token: state.token,
  tokenPriceUsd: state.tokenPriceUsd,
  myTokenAccounts: state.myTokenAccounts,
  myTokenAccountsSorted: state.myTokenAccountsSorted,
  setMyTokenAccounts: state.setMyTokenAccounts,
  setMyTokenAccountsSorted: state.setMyTokenAccountsSorted,
  addStreams: state.addStreams,
  setToken: state.setToken,
  cluster: state.cluster,
});

const VestingForm: FC<VestingFormProps> = ({ loading, setLoading }) => {
  const {
    Stream,
    connection,
    wallet,
    walletType,
    messageSignerWallet,
    token,
    // tokenPriceUsd,
    myTokenAccounts,
    setMyTokenAccounts,
    setMyTokenAccountsSorted,
    myTokenAccountsSorted,
    setToken,
    cluster,
    isMainnet,
  } = useStore(storeGetter);
  const { refetch } = useStreams();
  const tokenBalance = token?.uiTokenAmount?.uiAmount;
  const [tokenOptions, setTokenOptions] = useState<StringOption[]>([]);
  const [totalDepositedAmount, setTotalDepositedAmount] = useState(0);
  const modalRef = useRef<ModalRef>(null);
  const [streamErrors, setStreamErrors] = useState<CreateMultiError[]>([]);
  const { register, handleSubmit, watch, errors, setValue, trigger, append, remove, fields } =
    useVestingForm({
      tokenBalance: tokenBalance || 0,
    });
  const [
    recipients,
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
    "recipients",
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

  const getStreamErrorByRecipient = useCallback(
    (recipient: string) => {
      return streamErrors.find((el) => el.recipient === recipient);
    },
    [streamErrors]
  );

  const decimals = token?.uiTokenAmount?.decimals || 0;

  const onSubmit = async (values: VestingFormData) => {
    const {
      recipients,
      startDate,
      startTime,
      endDate,
      endTime,
      releaseFrequencyCounter,
      releaseFrequencyPeriod,
      whoCanTransfer,
      whoCanCancel,
      cliffDate,
      cliffTime,
      cliffAmount,
      referral,
    } = values;
    setStreamErrors([]);
    if (!wallet?.publicKey || !Stream || !connection || !walletType)
      return toast.error(ERR_NOT_CONNECTED);

    setLoading(true);

    const start = getUnixTime(new Date(startDate + "T" + startTime));
    const end = getUnixTime(new Date(endDate + "T" + endTime));
    const cliff = getUnixTime(new Date(cliffDate + "T" + cliffTime));

    const recipEmails = Object.fromEntries(recipients.map((e) => [e.recipient, e.recipientEmail]));
    const isAnyEmails = Object.values(recipients).some(({ recipientEmail }) => recipientEmail);
    const recipientsFormatted = recipients.map(({ depositedAmount, recipient, name }) => {
      const cliffAmountCalculated = (cliffAmount / 100) * depositedAmount;
      const amountPerPeriod = calculateReleaseRate(
        end,
        cliff,
        depositedAmount,
        cliffAmountCalculated,
        releaseFrequencyCounter * releaseFrequencyPeriod,
        decimals
      );
      return {
        recipient,
        name,
        depositedAmount: getBN(depositedAmount, decimals),
        amountPerPeriod: getBN(amountPerPeriod, decimals),
        cliffAmount: getBN(cliffAmountCalculated, decimals),
      };
    });

    const data = {
      recipientsData: recipientsFormatted,
      mint: token.info.address,
      start,
      period: Math.floor(releaseFrequencyPeriod * releaseFrequencyCounter),
      cliff: cliff,
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
      canTopup: false,
      partner: referral,
    };

    // const recipientAccount = await connection?.getAccountInfo(new PublicKey(recipient));
    // if (!recipientAccount) {
    //   const shouldContinue = await modalRef?.current?.show();
    //   if (!shouldContinue) return setLoading(false);
    // }
    toast.info(
      <MsgToast
        title={"Solana network warning."}
        type="info"
        message={`It looks like Solana is taking longer than usual to process the transaction(s). 
        It can take up to 2 minutes for us to confirm the status of all transactions. 
        Don't leave or refresh the page! 
        In case any transactions fail we will automatically repopulate the fields here so that you can try again.`}
      />
    );
    const response = await createMultiple(Stream, data, wallet);
    if (response?.errors && response?.errors?.length > 0) {
      const totalRecipients = recipients?.length;
      const totalError = response?.errors?.length;
      const failedRecipients = response.errors.map((el) => el.recipient);
      const recipientsToRemove = recipients.filter(
        (recipient) => !failedRecipients.some((failed) => failed === recipient.recipient)
      );
      console.log(response.errors);
      recipientsToRemove.map((x) =>
        remove(recipients.findIndex((y) => y.recipient == x.recipient))
      );
      setStreamErrors(response.errors);

      toast.error(
        <MsgToast
          title={"Some stream contracts were failed."}
          type="error"
          message={`${totalError} of ${totalRecipients} transactions are failed. We populated them on the form!`}
        />
      );
    }

    setLoading(false);
    if (response) {
      // const emailRequests: ContractSettingsRequest[] = response.streams.map((stream, index) => ({
      //   contractAddress: response.metadatas[index].publicKey.toBase58(),
      //   transaction: response.txs[index],
      //   contractSettings: { notificationEmail: recipEmails[stream.recipient] },
      // }));

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
      refetch();
      // const streamflowFeeTotal = getNumberFromBN(
      //   response.stream.streamflowFeeTotal,
      //   token.uiTokenAmount.decimals
      // );

      // const depositedAmount = getNumberFromBN(
      //   response.stream.streamflowFeeTotal,
      //   token.uiTokenAmount.decimals
      // );
      // trackTransaction(
      //   response.metadata.publicKey.toBase58(),
      //   token.info.symbol,
      //   token.info.name,
      //   tokenPriceUsd,
      //   TRANSACTION_VARIANT.CREATE_VESTING,
      //   streamflowFeeTotal * tokenPriceUsd,
      //   streamflowFeeTotal,
      //   depositedAmount,
      //   depositedAmount * tokenPriceUsd,
      //   walletType.name
      // );

      if (!isAnyEmails) return;

      try {
        const settingsClient = new SettingsClient(messageSignerWallet, cluster);
        // todo this part can fail if fetching response takes too much time, doesnt seem like safe
        const emailRequests: ContractSettingsRequest[] = response.metadatas.map(
          (metadata, index) => {
            const metadataPubKey = metadata.publicKey.toBase58();
            const recipientPubKey = response.metadataToRecipient[metadataPubKey]?.recipient;
            const notificationEmail = recipEmails[recipientPubKey];
            return {
              contractAddress: response.metadatas[index].publicKey.toBase58(),
              transaction: response.txs[index],
              contractSettings: { notificationEmail },
            };
          }
        );
        await settingsClient.createContractSettings(emailRequests);
        toast.dismiss();
        toast.info(<MsgToast title="Notification sent." type="info" />, {
          autoClose: 2000,
        });
      } catch (err: any) {
        toast.dismiss();
        toast.error(<MsgToast title={"Sending notifications failed."} type="error" />);
        Sentry.captureException(err);
      }
    }
  };

  const updateReleaseFrequencyCounter = (value: string) => {
    setValue("releaseFrequencyCounter", parseInt(value));
    trigger("releaseFrequencyPeriod");
  };

  const start = getUnixTime(new Date(startDate + "T" + startTime));
  const cliff = getUnixTime(new Date(cliffDate + "T" + cliffTime));
  const end = getUnixTime(new Date(endDate + "T" + endTime));

  const withdrawalFees = automaticWithdrawal
    ? calculateWithdrawalFees(
        start,
        cliff,
        end,
        withdrawalFrequencyCounter * withdrawalFrequencyPeriod
      )
    : 0;
  const isRecipientsReachedLimit: boolean =
    isMainnet && recipients.length + 1 > BATCH_MAINNET_RECIPIENT_LIMIT;

  const addNewRecipient = () => {
    //limit recipients due to low tps
    if (isRecipientsReachedLimit) return;
    append({ recipient: "", recipientEmail: "", depositedAmount: undefined, name: "" });
  };

  const updateTotalDepositedAmount = () => {
    const totalAmount = recipients.reduce((sum, recipient) => sum + +recipient.depositedAmount, 0);
    setTotalDepositedAmount(totalAmount);
  };

  useEffect(() => {
    const totalAmount = recipients.reduce((sum, recipient) => sum + +recipient.depositedAmount, 0);
    setTotalDepositedAmount(totalAmount);
  }, [recipients]);

  return (
    <>
      <div className="xl:mr-12 px-4 sm:px-0 pt-4">
        <Description classes="sm:hidden" />
        <Balance classes="sm:hidden" />
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="block mt-4 mb-8">
          <div className="grid gap-y-5 gap-x-3 grid-cols-6 sm:grid-cols-2">
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
                <label className="text-gray-light text-base cursor-pointer mb-1 block">Token</label>
                <p className="text-base font-medium text-blue">No tokens available.</p>
              </div>
            )}
            <div className="grid gap-x-3 grid-cols-2 col-span-full sm:col-span-1 pb-2">
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
                data-testid="vesting-release-frequency"
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
            <Input
              type="date"
              label="Start Date"
              min={format(new Date(), DATE_FORMAT)}
              customChange={onStartDateChange}
              onClick={updateStartDate}
              classes="col-span-3 sm:col-span-1"
              error={errors?.startDate?.message}
              data-testid="vesting-start-date"
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
              data-testid="vesting-start-time"
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
              data-testid="vesting-end-date"
              required
              {...register("endDate")}
            />
            <Input
              type="time"
              label="End Time"
              classes="col-span-3 sm:col-span-1"
              customChange={() => trigger("releaseFrequencyPeriod")}
              error={errors?.endDate?.message ? "" : errors?.endTime?.message}
              data-testid="vesting-end-time"
              required
              {...register("endTime")}
            />

            <div className="col-span-full border-t border-gray-dark pt-6 pb-1 grid grid-cols-2 gap-y-5 gap-x-4">
              <div className="grid gap-y-5 gap-x-1 sm:gap-x-2 grid-cols-5 col-span-full">
                <Input
                  type="date"
                  label="Cliff Date"
                  min={format(new Date(), DATE_FORMAT)}
                  customChange={() => trigger("releaseFrequencyPeriod")}
                  classes="col-span-full sm:col-span-2"
                  data-testid="vesting-cliff-date"
                  error={errors?.cliffDate?.message}
                  required
                  {...register("cliffDate")}
                />
                <Input
                  type="time"
                  label="Cliff Time"
                  classes="col-span-full sm:col-span-2"
                  data-testid="vesting-cliff-time"
                  customChange={() => trigger("releaseFrequencyPeriod")}
                  error={errors?.cliffDate?.message ? "" : errors?.cliffTime?.message}
                  required
                  {...register("cliffTime")}
                />
                <div className="relative col-span-full sm:col-span-1">
                  <Input
                    type="number"
                    label="Release"
                    min={0}
                    max={100}
                    inputClasses="pr-9"
                    classes="col-span-full sm:col-span-1"
                    data-testid="vesting-cliff-amount"
                    error={errors?.cliffAmount?.message}
                    {...register("cliffAmount")}
                  />
                  <span className="absolute text-gray-light text-base right-2 sm:right-4 bottom-2">
                    %
                  </span>
                </div>
              </div>
              <Select
                label="Who Can Transfer Contract?"
                options={transferCancelOptions}
                {...register("whoCanTransfer")}
                classes="col-span-full sm:col-span-1"
                data-testid="vesting-who-can-transfer"
              />
              <Select
                label="Who Can Cancel Contract?"
                options={transferCancelOptions}
                {...register("whoCanCancel")}
                classes="col-span-full sm:col-span-1"
                data-testid="vesting-who-can-cancel"
              />
            </div>
            <div className="border-t border-gray-dark pt-6 col-span-full">
              <h5 className="text-gray font-bold text-p2 tracking-widest pb-0">RECIPIENTS</h5>
            </div>
            {fields.map((field, index) => (
              <Recipient
                key={field.id}
                register={register}
                index={index}
                errors={{
                  fieldErrors: errors.recipients?.[index],
                  arrayErrors: errors?.recipients as any,
                  externalError: (
                    getStreamErrorByRecipient(recipients[index].recipient)?.error as any
                  )?.message,
                }}
                trigger={trigger}
                visible={true}
                removeRecipient={() => remove(index)}
                customChange={updateTotalDepositedAmount}
              />
            ))}

            {!isRecipientsReachedLimit && (
              <button
                type="button"
                className="text-blue text-xs bg-transparent w-28 text-left"
                onClick={addNewRecipient}
              >
                + Add Recipient
              </button>
            )}
            <div className="border-t border-b border-gray-dark py-6 col-span-full">
              <h5 className="text-gray font-bold text-p2 tracking-widest mb-5">
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
                    Withdraw Frequency
                  </label>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    classes="col-span-3"
                    customChange={() => trigger("withdrawalFrequencyPeriod")}
                    data-testid="vesting-withdrawal-frequency"
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
            <Overview
              classes="sm:hidden"
              {...{
                recipients,
                tokenSymbol,
                endDate,
                endTime,
                cliffDate,
                cliffTime,
                releaseFrequencyCounter,
                releaseFrequencyPeriod,
                decimals,
                cliffAmount,
              }}
            />
            <FinanceFee depositedAmount={totalDepositedAmount} tokenSymbol={tokenSymbol} />
          </div>
          {wallet?.connected && (
            <>
              <Button
                type="submit"
                background="blue"
                classes="py-2 px-4 font-bold my-5 text-sm"
                disabled={loading}
                data-testid="create-vesting"
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
      <div className="my-4 pl-3 pr-6 flex-grow">
        <Balance classes="hidden sm:block" />
        <Description classes="hidden sm:block" />
        <Overview
          classes="hidden sm:block sm:my-6"
          {...{
            recipients,
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
        <FinanceFee depositedAmount={totalDepositedAmount} tokenSymbol={tokenSymbol} />
        <Input
          label="Referral Address"
          type="text"
          placeholder="Paste referral address here..."
          classes="col-span-full border-t border-gray-dark pt-6"
          description="Enter the referral address of the person who referred you."
          error={errors?.referral?.message}
          data-testid="vesting-referral-address"
          {...register("referral")}
        />
      </div>
    </>
  );
};

export default VestingForm;
