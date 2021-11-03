import { BN } from "@project-serum/anchor";
import cx from "classnames";

import { formatAmmount } from "../../utils/helpers";

interface ProgressProps {
  title: string;
  value: number;
  max: BN;
  rtl?: boolean;
  decimals: number;
}

const Progress = ({ title, value, max, rtl, decimals }: ProgressProps) => (
  <div className="col-span-full grid grid-cols-12">
    <dt className="text-sm col-span-full sm:col-span-2 pt-0.5">{title}</dt>
    <div className="col-span-8 sm:col-span-7 rounded-sm h-3 bg-gray-900 w-full my-auto">
      <div
        className={cx(" bg-gradient-to-r from-primary to-secondary rounded-sm h-full", {
          "float-right": rtl,
        })}
        style={{ width: (value / Number(max.toString())) * 100 + "%" }}
      />
    </div>
    <label className="ml-2 text-right col-span-4 sm:col-span-3 truncate text-base">
      {formatAmmount(value, decimals, 4)}
      <small className="text-gray-400"> / {formatAmmount(Number(max), decimals, 4)}</small>
    </label>
  </div>
);

export default Progress;
