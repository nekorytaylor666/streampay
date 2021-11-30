import { FC } from "react";

interface CheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

const Checkbox: FC<CheckboxProps> = ({ name, label, checked, onChange }) => (
  <div className="col-span-full">
    <label className="text-white text-sm sm:text-base cursor-pointer">
      <input
        type="checkbox"
        name={name}
        className="mr-2 cursor-pointer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  </div>
);

export default Checkbox;
