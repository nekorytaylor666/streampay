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
        <label className="text-white text-sm sm:text-base cursor-pointer">
          <input type={type} name={name} className="mr-2 cursor-pointer" {...rest} ref={ref} />
          {label}
        </label>
      </div>
    ) : (
      <div className={cx(classes, "relative")}>
        <label htmlFor={name} className="block text-base font-medium text-gray-100 mb-1">
          {label}
        </label>
        <input
          type={type}
          name={name}
          aria-describedby={`${name}-description`}
          className={cx(
            "text-white pl-2.5 sm:pl-3 bg-gray-800 block w-full rounded-md ",
            error
              ? "border-red-600 focus:ring-red-600 focus:border-red-600"
              : "border-primary focus:ring-secondary focus:border-secondary"
          )}
          {...rest}
          ref={ref}
        />
        <p className="text-red-600 absolute text-xs py-1 right-0">{error}</p>
      </div>
    )
);

export default Input;
