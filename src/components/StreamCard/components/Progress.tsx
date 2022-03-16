import { FC } from "react";

interface ProgressProps {
  value: number;
  max: number;
  color: string;
}

const Progress: FC<ProgressProps> = ({ value, max, color }) => (
  <div className="col-span-full grid grid-cols-12 mt-3">
    <dt className="col-span-4 sm:col-span-3 pt-0.5 text-base relative"></dt>
    <div className={`col-span-full rounded-sm h-1 bg-${color}-200 w-full my-auto`}>
      <div
        className={`bg-${color} rounded-sm h-full`}
        style={{ width: Math.min((value / max) * 100, 100) + "%" }}
      />
    </div>
  </div>
);

export default Progress;
