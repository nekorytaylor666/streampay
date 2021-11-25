import { useEffect } from "react";

import { format } from "date-fns";

import { Input, Button, Select } from "../../components";
import { useStreamsForm } from "./FormConfig";
import { DATE_FORMAT, timePeriodOptions } from "../../constants";

const StreamsForm = () => {
  const { register, onSubmit, errors } = useStreamsForm();

  useEffect(() => console.log("ERRORS:", errors), [errors]);
  return (
    <form onSubmit={onSubmit} className="block my-4 grid gap-3 sm:gap-4 grid-cols-5 sm:grid-cols-2">
      <Input
        type="number"
        label="Amount"
        placeholder="0.00"
        classes="col-span-2"
        error={errors?.amount?.message}
        {...register("amount")}
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
        type="date"
        label="Start Date"
        min={format(new Date(), DATE_FORMAT)}
        error={errors?.startDate?.message}
        {...register("startDate")}
      />
      <Input
        type="time"
        label="Start Time"
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
      <div className="grid gap-x-1 sm:gap-x-2 grid-cols-2 col-span-3 sm:col-span-1">
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
      <Button type="submit" primary classes="px-8 py-4 font-bold text-2xl my-5">
        Create
      </Button>
    </form>
  );
};

export default StreamsForm;
