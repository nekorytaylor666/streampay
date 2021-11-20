import { FC, useState } from "react";

import { formatAmount } from "../utils/helpers";

interface RangeProps {
  min: number;
  max: number;
  decimals: number;
}

const roundAmount = (amount: number, decimals: number, decimalPlaces: number) => {
  const tens = 10 ** decimalPlaces;
  return Math.round((amount / 10 ** decimals) * tens) / tens;
};

const Range: FC<RangeProps> = ({ min, max, decimals }) => {
  const range = roundAmount(max - min, decimals, decimals);
  const step = range > 100 ? range / 10000 : range / 1000;
  const [value, setValue] = useState(roundAmount(max, decimals, 3));
  console.log("booze", roundAmount(max, decimals, decimals));
  return (
    <div className="grid grid-cols-4 gap-2">
      <input
        type="number"
        step={0.1}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        min={min}
        max={roundAmount(max, decimals, decimals)}
        className="text-white pl-2.5 sm:pl-3 bg-gray-800 border-primary block w-full rounded-md focus:ring-primary focus:border-primary"
      />
      <input
        type="range"
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        min={min}
        max={roundAmount(max, decimals, decimals)}
        step={step}
        className="col-span-4 mt-4 mb-2 bg-green-500"
      />
      <p className="text-left text-primary pl-1">{min}</p>
      <p className="col-start-4 text-right text-primary">{formatAmount(max, decimals, 3)}</p>
    </div>
  );
};

export default Range;
