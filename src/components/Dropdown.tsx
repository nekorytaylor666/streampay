import { useEffect, useRef, useState } from "react";

import { debounce } from "lodash";

import { Token } from "../types";

const escapeRegExp = (str: string) => str.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");

export default function Dropdown({
  value,
  textValue,
  options,
  generateOption,
  generateKey,
  onSelect,
}: {
  value: React.ReactNode;
  textValue: string;
  options: Token[];
  generateOption: (value: Token) => string;
  generateKey: (value: Token) => string;
  onSelect: (value: any) => void;
}) {
  const fieldRef = useRef<HTMLInputElement>(null);
  const [wrapperHidden, setWrapperHidden] = useState<boolean>(true);
  const [searchBoxHidden, setSearchBoxHidden] = useState<boolean>(true);
  const [filteredOptions, setFilteredOptions] = useState<any[]>([]);

  useEffect(() => setFilteredOptions(options), [options, setFilteredOptions]);

  useEffect(() => {
    if (!wrapperHidden) {
      fieldRef?.current?.focus();
    }
  }, [wrapperHidden, fieldRef]);

  return (
    <div
      tabIndex={0}
      onBlur={() => setWrapperHidden(true)}
      onFocus={() => setWrapperHidden(false)}
      className="relative px-3 py-2 mt-1 text-white bg-gray-800 border-primary block w-full rounded-md focus:ring-secondary focus:border-secondary border leading-snug"
    >
      <div
        title={textValue}
        onClick={() => setWrapperHidden(false)}
        className="overflow-ellipsis overflow-hidden block cursor-pointer"
      >
        {value || "Select..."}
      </div>
      <div
        className={
          "absolute -top-0.5 -left-0.5 -right-0.5 bg-gray-900 border border-primary rounded-md" +
          (wrapperHidden && searchBoxHidden ? " hidden" : "")
        }
      >
        <input
          ref={fieldRef}
          type="text"
          className="mb-2 pl-2.5 sm:pl-3 text-white bg-gray-800 border-primary block w-full rounded-md focus:ring-secondary focus:border-secondary"
          onBlur={() => setSearchBoxHidden(true)}
          onFocus={() => setSearchBoxHidden(false)}
          onMouseDown={() => setSearchBoxHidden(false)}
          onChange={debounce((e) => {
            const search = e.target.value;
            if (search.length > 0) {
              const reg = new RegExp(escapeRegExp(search), "i");
              setFilteredOptions(options.filter((i) => reg.test(generateOption(i))));
            } else {
              setFilteredOptions(options);
            }
          }, 100)}
        />
        <ul className="max-h-96 overflow-auto">
          {filteredOptions.map((token) => (
            <li
              className="py-1 px-2 odd:bg-gray-800 cursor-pointer"
              key={generateKey(token)}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(token);
                setWrapperHidden(true);
                setSearchBoxHidden(true);
              }}
            >
              {generateOption(token)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
