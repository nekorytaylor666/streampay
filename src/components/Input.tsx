import { FC, forwardRef } from "react";

import cx from "classnames";

interface InputProps {
  type: "text" | "number" | "date" | "time" | "checkbox";
  label?: string;
  name: string;
  placeholder?: string;
  classes?: string;
  min?: string | number;
  max?: string | number;
  error?: string;
}

const Input: FC<InputProps> = forwardRef<any, InputProps>(
  ({ type, label = "", name, error = "", classes = "", ...rest }, ref) =>
    type === "checkbox" ? (
      <div className="col-span-full">
        <label className="text-gray-200 text-sm cursor-pointer">
          <input
            type={type}
            name={name}
            className="mr-2 cursor-pointer bg-gray-900 border-0 rounded-sm"
            {...rest}
            ref={ref}
          />
          {label}
        </label>
      </div>
    ) : (
      <div className={cx(classes, "relative")}>
        <label htmlFor={name} className="block text-base text-gray-200 mb-1">
          {label}
        </label>
        <input
          type={type}
          name={name}
          aria-describedby={`${name}-description`}
          className={cx(
            "text-gray-100 font-light pl-2.5 py-2 sm:pl-3 bg-gray-800 block w-full rounded-md shadow-sm",
            error
              ? "border-red-700 focus:ring-red-700 focus:border-red-700"
              : "border-0 focus:ring-primary focus:border-primary"
          )}
          {...rest}
          ref={ref}
        />
        <p className="text-red-700 absolute text-xs py-1 right-0">{error}</p>
      </div>
    )
);

export default Input;
