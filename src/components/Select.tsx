import { FC, forwardRef, useState } from "react";

import type { ChangeHandler } from "react-hook-form";
import cx from "classnames";

import { StringOption, NumberOption } from "../types";

interface SelectProps {
  name: string;
  label?: string;
  classes?: string;
  error?: string;
  onChange: ChangeHandler;
  plural?: boolean;
  customChange?: (value: string) => void;
  options: StringOption[] | NumberOption[];
}

const createOptionsObject = (options: StringOption[] | NumberOption[]) => {
  const optionsObject: { [key: string]: string } = {};
  options.forEach((option) => (optionsObject[option.value] = option.icon || ""));
  return optionsObject;
};

const Select: FC<SelectProps> = forwardRef<any, SelectProps>(
  (
    { name, options, classes = "", label = "", error = "", onChange, customChange, plural = false },
    ref
  ) => {
    const withIcons = !!options[0].icon;
    const optionsObject = createOptionsObject(options);
    const [selectedIcon, setSelectedIcon] = useState(options[0].icon);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (withIcons) {
        const selectedIcon = optionsObject[e.target.value];
        setSelectedIcon(selectedIcon);
      }
      if (customChange) customChange(e.target.value);
      onChange(e);
    };

    return (
      <div className={classes}>
        <label
          htmlFor={name}
          className="block text-white font-bold text-base font-bold cursor-pointer mb-1"
        >
          {label}
        </label>
        <div className="relative">
          {withIcons && (
            <img src={selectedIcon} className="w-4 absolute top-3 left-2.5 sm:left-3 mt-px" />
          )}
          <select
            id={name}
            name={name}
            onChange={handleChange}
            className={cx(
              "text-white text-base font-light leading-6 bg-gray-dark col-span-2 block w-full rounded-md pr-4 sm:pr-6 bg-right shadow-sm",
              { "pl-8": withIcons },
              error
                ? "borderred focus:ringred focus:borderred"
                : "border-0 focus:ring-blue focus:border-blue"
            )}
            ref={ref}
          >
            {options.map(({ value, label, icon }) => (
              <option key={label} value={value} data-thumbnail={icon}>
                {`${label}${plural ? "s" : ""}`}
              </option>
            ))}
          </select>
          {name !== "releaseFrequencyPeriod" && name !== "withdrawalFrequencyPeriod" && (
            <p className="text-red absolute text-xs py-1 right-0">{error}</p>
          )}
        </div>
      </div>
    );
  }
);

export default Select;
