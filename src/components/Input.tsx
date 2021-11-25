import { FC, forwardRef } from "react";

import cx from "classnames";

interface InputProps {
  type: "text" | "number" | "date" | "time";
  label: string;
  name: string;
  placeholder?: string;
  classes?: string;
  min?: string | number;
  max?: string | number;
  error?: string;
}

const Input: FC<InputProps> = forwardRef<any, InputProps>(
  ({ label, name, error = "", classes = "", ...rest }, ref) => (
    <div className={cx(classes)}>
      <label htmlFor={name} className="block text-base font-medium text-gray-100 mb-1">
        {label}
      </label>
      <input
        name={name}
        aria-describedby={`${name}-description`}
        className="text-white pl-2.5 sm:pl-3 bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
        {...rest}
        ref={ref}
      />
      <small className="text-red-700">{error}</small>
    </div>
  )
);

export default Input;
