import { FC } from "react";

interface RangeProps {
  min: number;
  max: number;
  value: number;
  onChange: React.Dispatch<React.SetStateAction<number>>;
}

const Range: FC<RangeProps> = ({ min, max, value, onChange }) => (
  <div className="grid grid-cols-4 gap-2">
    <input
      type="number"
      step={0.1}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      min={min}
      max={max}
      className="text-white py-1.5 sm:py-2 px-2 sm:px-3 bg-gray-800 border-primary block w-full rounded-md focus:ring-primary focus:border-primary"
    />
    <input
      type="range"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      min={min}
      max={max}
      step={0.001}
      className="col-span-4 mt-4 mb-2 bg-green-500"
    />
    <p className="text-left text-primary pl-1 text-base">{min}</p>
    <p className="col-start-4 text-right text-primary text-base">{max.toFixed(2)}</p>
  </div>
);

export default Range;
