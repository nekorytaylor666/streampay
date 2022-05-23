import { useState } from "react";

import { FieldError, UseFormRegister, UseFormTrigger } from "react-hook-form/dist/types";
import { Cluster } from "@streamflow/stream";
import ReactTooltip from "react-tooltip";
import { XCircleIcon } from "@heroicons/react/outline";

import { Recipient } from "../types";
import { VestingFormData } from "../pages/VestingPage/FormConfig";
import { StreamsFormData } from "../pages/NewStreamPage/FormConfig";
import { IcnArrowRight, IcnArrowDown, IcnDelete } from "../assets/icons";
import { Input } from ".";
import useStore from "../stores";

interface RecipientVestingFormProps {
  index: number;
  errors: {
    fieldErrors:
      | {
          [key in keyof Recipient]?: FieldError | undefined;
        }
      | undefined;
    arrayErrors: FieldError | undefined;
    externalError: string | undefined;
  };
  register: UseFormRegister<VestingFormData>;
  visible: boolean;
  trigger: UseFormTrigger<VestingFormData>;
  removeRecipient: () => void;
  customChange: () => void;
}

export const RecipientVestingForm: React.FC<RecipientVestingFormProps> = ({
  register,
  index,
  visible,
  removeRecipient,
  trigger,
  errors: { fieldErrors, arrayErrors, externalError },
  customChange,
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const token = useStore((state) => state.token);
  const myTokenAccounts = useStore((state) => state.myTokenAccounts);
  const icon = myTokenAccounts[token?.info?.address]?.info.logoURI || "";

  const isMainnet = useStore((state) => state.cluster === Cluster.Mainnet);
  const recipientBg = isMainnet ? "bg-dev-dark-700" : "bg-main-dark";
  const recipientBorder = externalError ? " border border-red" : "";
  const totalValueError =
    arrayErrors?.type === "total_amount_check" ? arrayErrors?.message : undefined;
  const uniqueWalletError = arrayErrors?.type === "unique" ? arrayErrors?.message : undefined;
  return (
    <div className={`p-6 rounded-2xl col-span-full relative ${recipientBg} ${recipientBorder}`}>
      <button
        type="button"
        onClick={toggleVisibility}
        className={`text-gray text-p2 font-bold flex items-center ${isVisible ? "mb-6" : "mb-0"}`}
      >
        {isVisible ? (
          <IcnArrowDown classes="hover:cursor-pointer inline mr-1.5" fill="rgb(113, 130, 152)" />
        ) : (
          <IcnArrowRight fill="rgb(113, 130, 152)" classes="hover:cursor-pointer inline mr-1.5" />
        )}{" "}
        RECIPIENT {index + 1}
        {externalError && (
          <>
            <XCircleIcon
              className="h-5 w-5 ml-2 cursor-pointer text-red"
              data-tip
              data-for="overviewTooltip"
            />
            <ReactTooltip
              id="overviewTooltip"
              type="error"
              effect="solid"
              place="top"
              backgroundColor="#EB5757"
            >
              <span>{externalError}</span>
            </ReactTooltip>
          </>
        )}{" "}
      </button>

      {index > 0 && (
        <IcnDelete
          classes="absolute top-6 right-6 hover:cursor-pointer"
          fill="rgb(113, 130, 152)"
          onClick={removeRecipient}
        />
      )}
      {isVisible && (
        <div className="grid gap-y-5 gap-x-3 grid-cols-6 sm:grid-cols-2">
          <Input
            type="number"
            label="Amount"
            placeholder="0.00"
            classes="col-span-full sm:col-span-1"
            error={fieldErrors?.depositedAmount?.message || totalValueError}
            {...register(`recipients.${index}.depositedAmount`, {
              onChange: () => trigger("recipients"),
            })}
            customChange={customChange}
          />
          <div className="col-span-full sm:col-span-1">
            <p className="text-gray-light text-base font-bold mb-2.5">Token</p>
            <p className="text-gray-light flex items-center">
              <img src={icon} alt={token?.info?.symbol || ""} className="w-6 h-6 mr-1.5" />
              {token?.info?.symbol || ""}
            </p>
          </div>
          <Input
            type="text"
            label="Contract Title"
            placeholder="e.g. VC Seed Round"
            classes="col-span-full"
            error={fieldErrors?.name?.message}
            {...register(`recipients.${index}.name`)}
          />
          <Input
            type="text"
            label="Recipient Wallet Address"
            placeholder="Please double check the address"
            classes="col-span-full"
            description="Make sure this is not a centralized exchange address."
            data-testid="vesting-recipient"
            error={fieldErrors?.recipient?.message || uniqueWalletError}
            {...register(`recipients.${index}.recipient`, {
              onChange: () => trigger("recipients"),
            })}
          />
          <Input
            type="text"
            label="Recipient Email Address"
            placeholder="Optional email to notify"
            classes="col-span-full"
            data-testid="vesting-recipient-email"
            error={fieldErrors?.recipientEmail?.message}
            {...register(`recipients.${index}.recipientEmail`)}
          />
        </div>
      )}
    </div>
  );
};

interface RecipientStreamsFormProps {
  index: number;
  errors: {
    fieldErrors:
      | {
          [key in keyof Recipient]?: FieldError | undefined;
        }
      | undefined;
    arrayErrors: FieldError | undefined;
    externalError: string | undefined;
  };
  register: UseFormRegister<StreamsFormData>;
  visible: boolean;
  trigger: UseFormTrigger<StreamsFormData>;
  removeRecipient: () => void;
  customChange: () => void;
}

export const RecipientStreamsForm: React.FC<RecipientStreamsFormProps> = ({
  register,
  index,
  visible,
  trigger,
  removeRecipient,
  errors: { fieldErrors, arrayErrors, externalError },
  customChange,
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const token = useStore((state) => state.token);
  const myTokenAccounts = useStore((state) => state.myTokenAccounts);
  const icon = myTokenAccounts[token?.info?.address]?.info.logoURI || "";
  const recipientBorder = externalError ? " border border-red" : "";

  const isMainnet = useStore((state) => state.cluster === Cluster.Mainnet);
  const recipientBg = isMainnet ? "bg-dev-dark-700" : "bg-main-dark";
  const totalValueError =
    arrayErrors?.type === "total_amount_check" ? arrayErrors?.message : undefined;
  const uniqueWalletError = arrayErrors?.type === "unique" ? arrayErrors?.message : undefined;
  return (
    <div className={`p-6 bg rounded-2xl col-span-full relative ${recipientBg} ${recipientBorder}`}>
      <button
        type="button"
        onClick={toggleVisibility}
        className={`text-gray text-p2 font-bold flex items-center ${isVisible ? "mb-6" : "mb-0"}`}
      >
        {isVisible ? (
          <IcnArrowDown classes="hover:cursor-pointer inline mr-1.5" fill="rgb(113, 130, 152)" />
        ) : (
          <IcnArrowRight fill="rgb(113, 130, 152)" classes="hover:cursor-pointer inline mr-1.5" />
        )}
        RECIPIENT {index + 1}
        {externalError && (
          <>
            <XCircleIcon
              className="h-5 w-5 ml-2 cursor-pointer text-red"
              data-tip
              data-for="overviewTooltip"
            />
            <ReactTooltip
              id="overviewTooltip"
              type="error"
              effect="solid"
              place="top"
              backgroundColor="#EB5757"
            >
              <span>{externalError}</span>
            </ReactTooltip>
          </>
        )}
      </button>
      {index > 0 && (
        <IcnDelete
          classes="absolute top-6 right-6 hover:cursor-pointer"
          fill="rgb(113, 130, 152)"
          onClick={removeRecipient}
        />
      )}
      {isVisible && (
        <div className="grid gap-y-5 gap-x-3 grid-cols-6 sm:grid-cols-2">
          <Input
            type="number"
            label="Amount"
            placeholder="0.00"
            classes="col-span-full sm:col-span-1"
            error={fieldErrors?.depositedAmount?.message || totalValueError}
            {...register(`recipients.${index}.depositedAmount`, {
              onChange: () => trigger("recipients"),
            })}
            customChange={customChange}
          />
          <div className="col-span-full sm:col-span-1">
            <p className="text-gray-light text-base font-bold mb-2.5">Token</p>
            <p className="text-gray-light flex items-center">
              <img src={icon} alt={token?.info?.symbol || ""} className="w-6 h-6 mr-1.5" />
              {token?.info?.symbol || ""}
            </p>
          </div>
          <Input
            type="text"
            label="Contract Title"
            placeholder="e.g. VC Seed Round"
            classes="col-span-full"
            error={fieldErrors?.name?.message}
            {...register(`recipients.${index}.name`)}
          />
          <Input
            type="text"
            label="Recipient Wallet Address"
            placeholder="Please double check the address"
            classes="col-span-full"
            description="Make sure this is not a centralized exchange address."
            data-testid="vesting-recipient"
            error={fieldErrors?.recipient?.message || uniqueWalletError}
            {...register(`recipients.${index}.recipient`, {
              onChange: () => trigger("recipients"),
            })}
          />
          <Input
            type="text"
            label="Recipient Email Address"
            placeholder="Optional email to notify"
            classes="col-span-full"
            data-testid="vesting-recipient-email"
            error={fieldErrors?.recipientEmail?.message}
            {...register(`recipients.${index}.recipientEmail`)}
          />
        </div>
      )}
    </div>
  );
};
