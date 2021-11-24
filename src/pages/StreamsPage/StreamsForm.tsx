import { Input, Button } from "../../components";
import { useStreamsForm } from "./FormConfig";

const StreamsForm = () => {
  const { register, onSubmit, errors } = useStreamsForm();

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

      <Button type="submit" primary classes="px-8 py-4 font-bold text-2xl my-5">
        Create
      </Button>
    </form>
  );
};

export default StreamsForm;
