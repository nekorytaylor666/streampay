import { FC } from "react";

import cx from "classnames";

interface InputProps {
  type: "text";
  label: string;
  name: string;
  placeholder?: string;
  classes?: string;
  onChange: (value: string) => void;
  value: string;
  required: boolean;
}

const Input: FC<InputProps> = ({ label, name, classes = "", onChange, ...rest }) => (
  <div className={cx(classes, "col-span-full")}>
    <label htmlFor={name} className="block text-base font-medium text-gray-100 mb-1">
      {label}
    </label>
    <input
      name={name}
      aria-describedby={`${name}-description`}
      onChange={(e) => onChange(e.target.value)}
      className="text-white pl-2.5 sm:pl-3 bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
      {...rest}
    />
  </div>
);

export default Input;
