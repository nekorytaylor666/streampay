import { FC, forwardRef, ChangeEvent } from "react";

import type { ChangeHandler } from "react-hook-form";
import cx from "classnames";

interface InputProps {
  type: "text" | "number" | "date" | "time" | "checkbox" | "range";
  label?: string;
  name: string;
  placeholder?: string;
  classes?: string;
  inputClasses?: string;
  min?: string | number;
  max?: string | number;
  step?: number;
  error?: string;
  required?: boolean;
  onClick?: () => void;
  onChange: ChangeHandler;
  customChange?: (value: string) => void;
}

const Input: FC<InputProps> = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type,
      label = "",
      name,
      error = "",
      classes = "",
      onChange,
      onClick,
      customChange,
      inputClasses = "",
      ...rest
    },
    ref
  ) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e);
      if (customChange) customChange(e.target.value);
    };

    return type === "checkbox" ? (
      <div className={cx(classes, "flex pb-0.5")}>
        <label htmlFor={name} className="text-gray-200 text-base cursor-pointer block">
          <input
            type={type}
            id={name}
            name={name}
            onChange={onChange}
            className="mr-2 cursor-pointer bg-main border-0 rounded-sm font-light"
            {...rest}
            ref={ref}
          />
          {label}
        </label>
      </div>
    ) : (
      <div className={cx(classes, "relative")} onClick={onClick}>
        <label htmlFor={name} className="block text-base text-gray-200 mb-1">
          {label}
        </label>
        <input
          type={type}
          id={name}
          name={name}
          aria-describedby={`${name}-description`}
          onChange={handleChange}
          className={cx(
            "text-gray-100 font-light p-2 pr-1.5 sm:pl-3 sm:pr-2 bg-field block w-full rounded-md shadow-sm",
            inputClasses,
            error
              ? "border-red-700 focus:ring-red-700 focus:border-red-700"
              : "border-0 focus:ring-primary focus:border-primary"
          )}
          {...rest}
          ref={ref}
        />
        <p
          className={cx("text-red-700 absolute text-xs py-1", {
            ["whitespace-nowrap"]:
              name === "releaseFrequencyCounter" || name === "withdrawalFrequencyCounter",
          })}
        >
          {error}
        </p>
      </div>
    );
  }
);

export default Input;
