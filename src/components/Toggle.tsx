/* This example requires Tailwind CSS v2.0+ */
import { FC, forwardRef, Dispatch, SetStateAction } from "react";

import { Switch } from "@headlessui/react";
import cx from "classnames";

interface ToggleProps {
  name?: string;
  checked: boolean;
  labelLeft?: string;
  labelRight?: string;
  classes?: string;
  disabled?: boolean;
  customChange?: Dispatch<SetStateAction<any>>;
}

const Toggle: FC<ToggleProps> = forwardRef<any, ToggleProps>(
  ({ checked, labelLeft, labelRight, customChange = () => {}, classes, disabled }, ref) => (
    <Switch.Group as="div" className={cx(classes, "flex items-center")}>
      {labelLeft && (
        <Switch.Label as="span" className="mr-2">
          <span className="text-white text-base flex-grow">{labelLeft}</span>
        </Switch.Label>
      )}
      <Switch
        ref={ref}
        checked={checked}
        // @ts-ignore
        onChange={customChange}
        className={cx(
          checked ? "bg-blue" : "bg-field",
          { "cursor-not-allowed": disabled },
          "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full transition-colors ease-in-out duration-200 ring-1 ring-blue focus:ring-2 focus:outline-none focus:ring-blue"
        )}
      >
        <span
          aria-hidden="true"
          className={cx(
            checked ? "translate-x-5" : "translate-x-0",
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
          )}
        />
      </Switch>
      {labelRight && (
        <Switch.Label as="span" className="sm:mr-3 lg:mr-4 ml-2">
          <span className="text-white text-base flex-grow">{labelRight}</span>
        </Switch.Label>
      )}
    </Switch.Group>
  )
);

export default Toggle;
