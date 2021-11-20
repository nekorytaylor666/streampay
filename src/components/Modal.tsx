import { FC, useState, forwardRef, useImperativeHandle, ForwardedRef } from "react";

import cx from "classnames";

import { Button, Range } from ".";

export interface ModalRef {
  show: () => Promise<void>;
}

export type ModalProps = {
  title?: string;
  text?: string;
  ref: ForwardedRef<ModalRef>;
  confirm: { text: string; color: string };
} & (
  | { type: "info"; config?: { defaultValue: string } }
  | { type: "text"; config: { placeholder?: string; defaultValue: string } }
  | { type: "range"; config: { defaultValue: number; min: number; max: number } }
);

const Modal: FC<ModalProps> = forwardRef(
  ({ title, text, type, confirm, config = { defaultValue: "" } }, ref) => {
    const [visible, setVisible] = useState(false);
    const [modalInfo, setModalInfo] = useState<{ resolve?: any }>({});
    const [value, setValue] = useState(config.defaultValue);

    const isRangeInput = config && "max" in config;
    const isTextInput = type === "text";

    useImperativeHandle(ref, () => ({
      show: () =>
        new Promise((resolve) => {
          setModalInfo({ resolve });
          setVisible(true);
        }),
    }));

    const onConfirm = () => {
      setVisible(false);
      modalInfo.resolve(value || true);
      setValue(config.defaultValue);
    };

    const onCancel = () => {
      setVisible(false);
      modalInfo.resolve(undefined);
      setValue(config.defaultValue);
    };

    return (
      <div
        className={cx(
          "h-screen fixed z-10 w-screen backdrop-filter backdrop-blur-xs bg-opacity-70 bg-gray-900 top-0 left-0 flex justify-center items-center",
          visible ? "block" : "hidden"
        )}
      >
        <div className="w-11/12 sm:w-2/5 xl:w-1/4 px-4 pb-5 pt-7 sm:pt-8 sm:px-6 rounded-md bg-gradient-to-br to-ternary from-gray-800">
          <p className="mb-2 text-center text-sm sm:text-base text-white">{title}</p>
          <p className="mb-2 text-center text-xs sm:text-sm text-white">{text}</p>
          {isRangeInput && (
            <Range
              value={value as number}
              onChange={setValue as React.Dispatch<React.SetStateAction<number>>}
              {...config}
            />
          )}
          {isTextInput && (
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              type={type}
              {...config}
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
  }
);

export default Modal;
