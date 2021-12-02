/* This example requires Tailwind CSS v2.0+ */
import { Dispatch, SetStateAction } from "react";

import { Switch } from "@headlessui/react";
import cx from "classnames";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Toggle({
  enabled,
  labelLeft,
  labelRight,
  setEnabled,
  classes,
}: {
  enabled: boolean;
  labelLeft?: string;
  labelRight?: string;
  setEnabled: Dispatch<SetStateAction<any>>;
  classes?: string;
}) {
  return (
    <Switch.Group as="div" className={cx(classes, "flex items-center")}>
      {labelLeft && (
        <Switch.Label as="span" className="mr-2">
          <span className="text-white  text-sm sm:text-base flex-grow">{labelLeft}</span>
        </Switch.Label>
      )}
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className={classNames(
          enabled ? "bg-primary" : "bg-gray-900",
          "relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 ring-1 ring-primary focus:ring-2 focus:outline-none focus:ring-primary"
        )}
      >
        <span
          aria-hidden="true"
          className={classNames(
            enabled ? "translate-x-5" : "translate-x-0",
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
          )}
        />
      </Switch>
      {labelRight && (
        <Switch.Label as="span" className="mr-4 ml-2">
          <span className="text-white text-sm sm:text-base flex-grow">{labelRight}</span>
        </Switch.Label>
      )}
    </Switch.Group>
  );
}
