import { FC, useEffect, useState, useRef, useCallback } from "react";

import { add, format, getUnixTime } from "date-fns";
// import { PublicKey } from "@solana/web3.js";
import * as Sentry from "@sentry/react";
import { toast } from "react-toastify";
import { BN, Cluster, CreateMultiError, getBN } from "@streamflow/stream";

import {
  Input,
  Button,
  Select,
  Modal,
  ModalRef,
  Toggle,
  Balance,
  RecipientStreamsForm as Recipient,
  FinanceFee,
  MsgToast,
} from "../../components";
import useStore, { StoreType } from "../../stores";
import { StreamsFormData, useStreamsForm } from "./FormConfig";
import SettingsClient from "../../api/contractSettings";
import { ContractSettingsRequest } from "../../api/contractSettings";
import { createMultiple } from "../../api/transactions";
import {
  // calculateWithdrawalFees,
  didTokenOptionsChange,
  getTokenAmount,
  sortTokenAccounts,
} from "../../utils/helpers";
import {
  DATE_FORMAT,
  TIME_FORMAT,
  ERR_NOT_CONNECTED,
  timePeriodOptions,
  // ERRORS,
  // TRANSACTION_VARIANT,
  transferCancelOptions,
  BATCH_MAINNET_RECIPIENT_LIMIT,
} from "../../constants";
import { StringOption, TransferCancelOptions } from "../../types";
import Overview from "./Overview";
// import { trackTransaction } from "../../utils/marketing_helpers";
import Description from "./Description";
import { useStreams } from "../../hooks/useStream";

interface NewStreamFormProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const storeGetter = (state: StoreType) => ({
  StreamInstance: state.StreamInstance,
  connection: state.StreamInstance?.getConnection(),
  isMainnet: state.cluster === Cluster.Mainnet,

  wallet: state.wallet,
  walletType: state.walletType,
  messageSignerWallet: state.messageSignerWallet,
  cluster: state.cluster,
  token: state.token,
  tokenPriceUsd: state.tokenPriceUsd,
  myTokenAccounts: state.myTokenAccounts,
  setMyTokenAccounts: state.setMyTokenAccounts,
  myTokenAccountsSorted: state.myTokenAccountsSorted,
  setMyTokenAccountsSorted: state.setMyTokenAccountsSorted,
  addStreams: state.addStreams,
  setToken: state.setToken,
});

const NewStreamForm: FC<NewStreamFormProps> = ({ loading, setLoading }) => {
  const {
    connection,
    wallet,
    walletType,
    messageSignerWallet,
    token,
    // tokenPriceUsd,
    myTokenAccounts,
    setMyTokenAccounts,
    myTokenAccountsSorted,
    setMyTokenAccountsSorted,
    setToken,
    StreamInstance,
    isMainnet,
    cluster,
  } = useStore(storeGetter);
  const tokenBalance = token?.uiTokenAmount?.uiAmount;
  const [tokenOptions, setTokenOptions] = useState<StringOption[]>([]);
  const [totalDepositedAmount, setTotalDepositedAmount] = useState(0);
  const [streamErrors, setStreamErrors] = useState<CreateMultiError[]>([]);

  const modalRef = useRef<ModalRef>(null);
  const { refetch } = useStreams();

  const {
    register,
    handleSubmit,
    watch,
    errors,
    setValue,
    append,
    remove,
    // setError,
    // clearErrors,
    trigger,
    fields,
  } = useStreamsForm({
    tokenBalance: tokenBalance || 0,
  });

  const [
    recipients,
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
    "recipients",
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
  const getStreamErrorByRecipient = useCallback(
    (recipient: string) => {
      return streamErrors.find((el) => el.recipient === recipient);
    },
    [streamErrors]
  );

  const updateReleaseFrequencyCounter = (value: string) => {
    setValue("releaseFrequencyCounter", parseInt(value));
  };

  // const updateReleaseAmountError = (value: string) => {
  //   if (value && releaseAmount) {
  //     return +value < +releaseAmount
  //       ? setError("releaseAmount", {
  //           type: "error message",
  //           message: ERRORS.release_amount_greater_than_deposited,
  //         })
  //       : clearErrors("releaseAmount");
  //   }
  // };

  const onSubmit = async (values: StreamsFormData) => {
    const {
      recipients,
      releaseAmount,
      startDate,
      startTime,
      releaseFrequencyCounter,
      releaseFrequencyPeriod,
      whoCanTransfer,
      whoCanCancel,
      referral,
    } = values;

    if (!StreamInstance || !wallet?.publicKey || !connection || !walletType)
      return toast.error(ERR_NOT_CONNECTED);

    setLoading(true);

    const start = getUnixTime(new Date(startDate + "T" + startTime));
    const recipEmails = Object.fromEntries(recipients.map((e) => [e.recipient, e.recipientEmail]));
    const isAnyEmails = Object.values(recipients).some(({ recipientEmail }) => recipientEmail);
    const recipientsFormatted = recipients.map(({ depositedAmount, recipient, name }) => ({
      recipient,
      name,
      depositedAmount: getBN(depositedAmount, token.uiTokenAmount.decimals),
      amountPerPeriod: getBN(releaseAmount, token.uiTokenAmount.decimals),
      cliffAmount: new BN(0),
    }));

    const data = {
      recipientsData: recipientsFormatted,
      mint: token.info.address,
      start,
      period: releaseFrequencyCounter * releaseFrequencyPeriod,
      cliff: start,
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
    const response = await createMultiple(StreamInstance, data, wallet);
    setLoading(false);
    if (response?.errors && response?.errors.length > 0) {
      const totalRecipients = recipients.length;
      const totalError = response.errors.length;
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

    if (response) {
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

      // trackTransaction(
      //   response.stream.mint,
      //   token.info.symbol,
      //   token.info.name,
      //   tokenPriceUsd,
      //   TRANSACTION_VARIANT.CREATE_STREAM,
      //   streamflowFeeTotal * tokenPriceUsd,
      //   streamflowFeeTotal,
      //   depositedAmount,
      //   depositedAmount * tokenPriceUsd,
      //   walletType.name
      // );
      if (!isAnyEmails) return;
      try {
        const settingsClient = new SettingsClient(messageSignerWallet, cluster);
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
        console.log("err", err);
        toast.error(<MsgToast title={"Sending notification failed."} type="error" />);
        Sentry.captureException(err);
      }
    }
  };

  // const start = getUnixTime(new Date(startDate + "T" + startTime)); // gives us seconds
  // const releasePeriod = releaseFrequencyCounter * releaseFrequencyPeriod;
  // const end = start + Math.ceil(depositedAmount / releaseAmount) * releasePeriod;

  // const withdrawalFees = automaticWithdrawal
  //   ? calculateWithdrawalFees(
  //       start,
  //       start,
  //       end,
  //       withdrawalFrequencyCounter * withdrawalFrequencyPeriod
  //     )
  //   : 0;

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
              classes="col-span-full sm:col-span-1 sm:col-start-1"
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
              <h5 className="text-gray font-bold text-xs tracking-widest mb-5">RECIPIENTS</h5>
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
                  {/* <p className="text-gray-light text-xxs leading-4 mt-3 col-span-full">
                    When automatic withdrawal is enabled there are additional fees ( 5000 lamports )
                    per every withdrawal.{" "}
                    {withdrawalFees > 0 && (
                      <>
                        For this stream there will be
                        <span className="font-bold">{` ${withdrawalFees.toFixed(6)} SOL`}</span> in
                        withdrawal fees.
                      </>
                    )}
                  </p> */}
                </div>
              )}
            </div>
          </div>
          <Overview
            classes="sm:hidden"
            {...{
              recipients,
              releaseAmount,
              tokenSymbol,
              startDate,
              startTime,
              releaseFrequencyCounter,
              releaseFrequencyPeriod,
            }}
          />
          <FinanceFee depositedAmount={totalDepositedAmount} tokenSymbol={tokenSymbol} />
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
            recipients,
            releaseAmount,
            tokenSymbol,
            startDate,
            startTime,
            releaseFrequencyCounter,
            releaseFrequencyPeriod,
          }}
        />
        <FinanceFee depositedAmount={totalDepositedAmount} tokenSymbol={tokenSymbol} />
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
