export default function Amount(props: {
  onChange: (value: number) => void;
  max: number;
  value: number;
}) {
  return (
    <div className="col-span-3 sm:col-span-1">
      <label htmlFor="amount" className="block text-base font-medium text-gray-100">
        Amount
      </label>
      <div className="mt-1">
        <input
          step="any"
          autoFocus={true}
          type="number"
          name="amount"
          id="amount"
          defaultValue={props.value}
          onChange={(e) => props.onChange(Number(e.target.value))}
          className="text-white pl-2.5 sm:pl-3 bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
          min={0}
          max={props.max || Number.MAX_SAFE_INTEGER}
          placeholder="0.00"
          aria-describedby="amount-description"
          required={true}
        />
      </div>
    </div>
  );
}
