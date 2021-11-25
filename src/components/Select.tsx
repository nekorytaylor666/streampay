import { FC, forwardRef } from "react";

interface SelectProps {
  options: { value: string | number; label: string }[];
  label?: string;
  classes?: string;
}

const Select: FC<SelectProps> = forwardRef<any, SelectProps>(
  ({ options, classes = "", label = "" }, ref) => (
    <div className={classes}>
      <label className="block text-base font-medium text-gray-100 mb-1">{label} </label>
      <select
        ref={ref}
        className="text-white pl-2.5 sm:pl-3 bg-gray-800 col-span-2 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary pr-7"
      >
        {options.map(({ value, label }) => (
          <option key={label} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  )
);

export default Select;
