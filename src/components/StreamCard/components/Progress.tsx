import { BN } from "@project-serum/anchor";
import cx from "classnames";

import { formatAmount } from "../../../utils/helpers";
import { DEFAULT_DECIMAL_PLACES } from "../../../constants";

interface ProgressProps {
  title: string;
  value: number;
  max: BN;
  rtl?: boolean;
  decimals: number;
  symbol: string;
}

const Progress = ({ title, value, max, rtl, decimals, symbol }: ProgressProps) => (
  <div className="col-span-full grid grid-cols-12">
    <dt className="col-span-4 sm:col-span-3 pt-0.5 text-base">{title}</dt>
    <label className="ml-1 col-span-8 sm:col-span-9 truncate text-base block">
      {formatAmount(value, decimals, DEFAULT_DECIMAL_PLACES)}
      <small className="text-gray-400">
        / {formatAmount(Number(max), decimals, DEFAULT_DECIMAL_PLACES)} {symbol}
      </small>
    </label>
    <div className="col-span-full rounded-sm h-3 bg-gray-900 w-full my-auto">
      <div
        className={cx(" bg-gradient-to-r from-primary to-secondary rounded-sm h-full", {
          "float-right": rtl,
        })}
        style={{ width: Math.min((value / Number(max.toString())) * 100, 100) + "%" }}
      />
    </div>
  </div>
);

export default Progress;
