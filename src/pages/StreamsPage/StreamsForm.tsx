import { FC, useEffect, useState, useRef } from "react";

import { add, format, getUnixTime } from "date-fns";

import { Input, Button, Select, Modal, ModalRef } from "../../components";
import useStore, { StoreType } from "../../stores";
import { StreamsFormData, useStreamsForm } from "./FormConfig";
import {
  DATE_FORMAT,
  ERR_NOT_CONNECTED,
  getTimePeriodOptions,
  ProgramInstruction,
} from "../../constants";
import sendTransaction from "actions/sendTransaction";
import { BN } from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { getTokenAmount } from "utils/helpers";
import { toast } from "react-toastify";

interface StreamsFormProps {
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const storeGetter = (state: StoreType) => ({
  connection: state.connection(),
  wallet: state.wallet,
  token: state.token,
  myTokenAccounts: state.myTokenAccounts,
});

const StreamsForm: FC<StreamsFormProps> = ({ loading, setLoading }) => {
  const { connection, wallet, token, myTokenAccounts } = useStore(storeGetter);
  const tokenBalance = token?.uiTokenAmount?.uiAmount;
  const tokenOptions = Object.values(myTokenAccounts).map(({ info }) => ({
    value: info.symbol,
    label: info.symbol,
    icon: info.logoURI,
  }));

  const modalRef = useRef<ModalRef>(null);

  const { register, handleSubmit, watch, errors } = useStreamsForm({
    tokenOptions,
    tokenBalance: tokenBalance || 0,
  });

  const releaseFrequencyCounter = watch("releaseFrequencyCounter");
  const [timePeriodOptions, setTimePeriodOptions] = useState(getTimePeriodOptions(false));

  useEffect(() => {
    setTimePeriodOptions(getTimePeriodOptions(releaseFrequencyCounter > 1));
  }, [releaseFrequencyCounter]);

  const onSubmit = async (values: StreamsFormData) => {
    const newStream = Keypair.generate();
    const {
      amount,
      tokenSymbol,
      subject,
      recipient,
      startDate,
      startTime,
      depositedAmount,
      releaseFrequencyCounter,
      releaseFrequencyPeriod,
      senderCanCancel,
      recipientCanCancel,
      ownershipTransferable,
    } = values;
    if (!wallet?.publicKey || !connection) {
      toast.error(ERR_NOT_CONNECTED);
      return false;
    }

    setLoading(true);

    const start = getUnixTime(new Date(startDate + "T" + startTime));

    const data = {
      deposited_amount: new BN(amount * 10 ** token.uiTokenAmount.decimals), //
      recipient: new PublicKey(recipient),
      mint: new PublicKey(token.info.address),
      start_time: new BN(start),
      // end_time: new BN(end),
      period: new BN(releaseFrequencyCounter * releaseFrequencyPeriod),
      cliff: new BN(start),
      cliff_amount: new BN(0),
      new_stream_keypair: newStream,
      stream_name: subject,
      cancelable_by_sender: senderCanCancel,
      cancelable_by_recipient: recipientCanCancel,
      transferable: ownershipTransferable,
    };

    const receiverAccount = await connection?.getAccountInfo(new PublicKey(recipient));

    if (!receiverAccount) {
      const shouldContinue = await modalRef?.current?.show();

      if (!shouldContinue) {
        setLoading(false);
        return false;
      }
    }

    const success = await sendTransaction(ProgramInstruction.Create, data);
    setLoading(false);

    if (success) {
      addStream(newStream.publicKey.toBase58(), {
        ...data,
        cancellable_at: new BN(end),
        last_withdrawn_at: new BN(0),
        withdrawn_amount: new BN(0),
        canceled_at: new BN(0),
        created_at: new BN(+new Date() / 1000),
        escrow_tokens: undefined as any,
        magic: new BN(0),
        recipient_tokens: undefined as any,
        sender: wallet?.publicKey,
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="block my-4">
      <div className="grid gap-y-5 gap-x-3 sm:gap-x-4 grid-cols-5 sm:grid-cols-2">
        <Input
          type="number"
          label="Amount"
          placeholder="0.00"
          error={errors?.amount?.message}
          classes="col-span-3 sm:col-span-1"
          {...register("amount")}
        />
        <Select
          label="Token"
          options={tokenOptions}
          error={errors?.tokenSymbol?.message}
          {...register("tokenSymbol")}
          classes="col-span-2 sm:col-span-1"
        />
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
          type="number"
          label="Deposited Amount"
          placeholder="0.00"
          classes="col-span-full"
          error={errors?.depositedAmount?.message}
          {...register("depositedAmount")}
        />
        <Input
          type="date"
          label="Start Date"
          min={format(new Date(), DATE_FORMAT)}
          max={format(add(new Date(), { years: 1 }), DATE_FORMAT)}
          classes="col-span-2 sm:col-span-1"
          error={errors?.startDate?.message || ""}
          {...register("startDate")}
        />
        <Input
          type="time"
          label="Start Time"
          classes="col-span-2 sm:col-span-1"
          error={errors?.startTime?.message}
          {...register("startTime")}
        />
        <div className="grid gap-x-1 sm:gap-x-2 grid-cols-2 col-span-4 sm:col-span-1">
          <label className="block text-base font-medium text-gray-100 capitalize col-span-2">
            Release Frequency
          </label>
          <Input type="number" min={1} {...register("releaseFrequencyCounter")} />
          <Select options={timePeriodOptions} {...register("releaseFrequencyPeriod")} />
        </div>
        <Input type="checkbox" label="Sender can cancel?" {...register("senderCanCancel")} />
        <Input type="checkbox" label="Recipient can cancel?" {...register("recipientCanCancel")} />
        <Input
          type="checkbox"
          label="Ownership transferable?"
          {...register("ownershipTransferable")}
        />
      </div>
      <Button type="submit" primary classes="px-20 py-4 font-bold text-2xl my-5" disabled={loading}>
        Create
      </Button>
      <Modal
        ref={modalRef}
        title="Seems like the recipient address has empty balance."
        text="Please check that the address is correct before proceeding."
        type="info"
        confirm={{ color: "red", text: "Continue" }}
      />
    </form>
  );
};

export default StreamsForm;
function addStream(arg0: any, arg1: any) {
  throw new Error("Function not implemented.");
}
function setMyTokenAccounts(arg0: {
  [x: string]:
    | import("../../types").Token
    | { uiTokenAmount: any; info: import("@solana/spl-token-registry").TokenInfo };
}) {
  throw new Error("Function not implemented.");
}

function setToken(arg0: {
  uiTokenAmount: any;
  info: import("@solana/spl-token-registry").TokenInfo;
}) {
  throw new Error("Function not implemented.");
}
