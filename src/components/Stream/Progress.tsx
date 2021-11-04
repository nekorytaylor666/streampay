import { BN } from "@project-serum/anchor";
import cx from "classnames";

import { formatAmmount } from "../../utils/helpers";

const DECIMAL_PLACES = 3;

interface ProgressProps {
  title: string;
  value: number;
  max: BN;
  rtl?: boolean;
  decimals: number;
}

const Progress = ({ title, value, max, rtl, decimals }: ProgressProps) => (
  <div className="col-span-full grid grid-cols-12">
    <dt className="col-span-4 sm:col-span-3 pt-0.5 text-base">{title}</dt>
    <label className="ml-1 col-span-8 sm:col-span-9 truncate text-base">
      {formatAmmount(value, decimals, DECIMAL_PLACES)}
      <small className="text-gray-400">
        / {formatAmmount(Number(max), decimals, DECIMAL_PLACES)}
      </small>
    </label>
    <div className="col-span-full rounded-sm h-3 bg-gray-900 w-full my-auto">
      <div
        className={cx(" bg-gradient-to-r from-primary to-secondary rounded-sm h-full", {
          "float-right": rtl,
        })}
        style={{ width: (value / Number(max.toString())) * 100 + "%" }}
      />
    </div>
  </div>
);

export default Progress;
