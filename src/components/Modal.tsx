import { useState, forwardRef, useImperativeHandle } from "react";

import cx from "classnames";

import { Button, Range } from ".";

export interface ModalRef {
  show: () => Promise<void>;
}

export type ModalProps = {
  title?: string;
  text?: string;
  confirm: { text: string; color: string };
} & (
  | { type: "info" }
  | { type: "text"; placeholder?: string }
  | { type: "range"; min: number; max: number }
);

const Modal = forwardRef<ModalRef, ModalProps>(({ title, text, type, confirm, ...rest }, ref) => {
  const [visible, setVisible] = useState(false);
  const [modalInfo, setModalInfo] = useState<{ resolve?: any }>({});

  const isRangeInput = "min" in rest;
  const isTextInput = "placeholder" in rest;
  const defaultValue = isRangeInput ? rest.max : "";
  const [value, setValue] = useState(defaultValue);
  const [rangeMax, setRangeMax] = useState(isRangeInput ? rest.max : 0);
  const [modalTitle, setModalTitle] = useState(title);

  useImperativeHandle(ref, () => ({
    show: () =>
      new Promise((resolve) => {
        setModalInfo({ resolve });
        setVisible(true);
        if (isRangeInput) {
          setValue(rest.max);
          setRangeMax(rest.max);
          setModalTitle(title);
        }
      }),
  }));

  const onConfirm = () => {
    setVisible(false);
    modalInfo.resolve(value || true);
    setValue(defaultValue);
  };

  const onCancel = () => {
    setVisible(false);
    modalInfo.resolve(undefined);
    setValue(defaultValue);
  };

  return (
    <div
      className={cx(
        "h-screen fixed z-10 w-screen backdrop-filter backdrop-blur-xs bg-opacity-70 bg-gray-900 top-0 left-0 flex justify-center items-center",
        visible ? "block" : "hidden"
      )}
    >
      <div className="w-11/12 sm:w-96 xl:w-1/3 2xl:w-1/4 px-4 pb-5 pt-7 sm:pt-8 sm:px-6 rounded-md bg-gradient-to-br to-ternary from-gray-800">
        <p className="mb-2 text-center text-sm sm:text-base text-white">{modalTitle}</p>
        <p className="mb-2 text-center text-xs sm:text-sm text-white">{text}</p>
        {isRangeInput && (
          <Range
            value={value as number}
            onChange={setValue as React.Dispatch<React.SetStateAction<number>>}
            min={rest.min}
            max={rangeMax}
          />
        )}
        {isTextInput && (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type={type}
            {...rest}
            className="text-white py-1.5 sm:py-2 px-2 sm:px-3 bg-gray-800 border-primary block w-full rounded-md focus:ring-primary focus:border-primary"
          />
        )}
        <div className="grid gap-2 sm:gap-3 grid-cols-3 mt-4">
          <Button onClick={onCancel} classes="text-sm col-start-2 py-1 w-full" background="gray">
            Cancel
          </Button>
          <Button onClick={onConfirm} classes="text-sm py-1 w-full" background={confirm.color}>
            {confirm.text}
          </Button>
        </div>
      </div>
    </div>
  );
});

export default Modal;