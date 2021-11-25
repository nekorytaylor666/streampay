import { useEffect } from "react";

import { format } from "date-fns";

import { Input, Button, Select } from "../../components";
import { useStreamsForm } from "./FormConfig";
import { DATE_FORMAT, timePeriodOptions } from "../../constants";

const StreamsForm = () => {
  const { register, onSubmit, errors } = useStreamsForm();

  useEffect(() => console.log("ERRORS:", errors), [errors]);
  return (
    <form onSubmit={onSubmit} className="my-4 grid gap-3 sm:gap-4 grid-cols-10">
      <Input
        type="number"
        label="Amount"
        placeholder="0.00"
        classes="col-span-5"
        error={errors?.amount?.message}
        {...register("amount")}
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
        type="text"
        label="Subject / Title"
        placeholder="e.g. StreamFlow VC - seed round"
        classes="col-span-full"
        error={errors?.subject?.message}
        {...register("subject")}
      />
      <Input
        type="date"
        label="Start Date"
        min={format(new Date(), DATE_FORMAT)}
        classes="col-span-5"
        error={errors?.startDate?.message}
        {...register("startDate")}
      />
      <Input
        type="time"
        label="Start Time"
        classes="col-span-5"
        error={errors?.startTime?.message}
        {...register("startTime")}
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
        type="number"
        label="Release"
        min={1}
        classes="col-span-2"
        {...register("releaseFrequencyCounter")}
      />
      <Select
        label="frequency"
        options={timePeriodOptions}
        classes="col-span-4"
        {...register("releaseFrequencyPeriod")}
      />

      <Input type="checkbox" label="Sender can cancel?" {...register("senderCanCancel")} />
      <Input type="checkbox" label="Recipient can cancel?" {...register("recipientCanCancel")} />
      <Input
        type="checkbox"
        label="Ownership transferable?"
        {...register("ownershipTransferable")}
      />
      <Button type="submit" primary classes="px-8 py-4 font-bold text-2xl my-5">
        Create
      </Button>
    </form>
  );
};

export default StreamsForm;
