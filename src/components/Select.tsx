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
  customChange?: any;
  options: StringOption[] | NumberOption[];
}

const createOptionsObject = (options: StringOption[] | NumberOption[]) => {
  const optionsObject: { [key: string]: string } = {};
  options.forEach((option) => (optionsObject[option.value] = option.icon || ""));
  return optionsObject;
};

const Select: FC<SelectProps> = forwardRef<any, SelectProps>(
  ({ name, options, classes = "", label = "", error = "", onChange, customChange }, ref) => {
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
        <label className="block text-gray-200 text-sm sm:text-base cursor-pointer mb-1">
          {label}{" "}
        </label>
        <div className="relative">
          {withIcons && (
            <img src={selectedIcon} className="w-4 absolute top-3 left-2.5 sm:left-3 mt-px" />
          )}
          <select
            name={name}
            onChange={handleChange}
            className={cx(
              "text-white text-base font-light leading-6 bg-gray-800 col-span-2 border-0 block w-full border-black rounded-md focus:ring-secondary focus:border-secondary pr-6 bg-right shadow-sm",
              { "pl-8": withIcons }
            )}
            ref={ref}
          >
            {options.map(({ value, label, icon }) => (
              <option key={label} value={value} data-thumbnail={icon}>
                {label}
              </option>
            ))}
          </select>
          <p className="text-red-600 absolute text-xs py-1 right-0">{error}</p>
        </div>
      </div>
    );
  }
);

export default Select;
