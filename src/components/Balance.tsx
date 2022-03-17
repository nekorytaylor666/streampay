import { FC } from "react";

import cx from "classnames";

import useStore, { StoreType } from "../stores";

const storeGetter = ({ token, myTokenAccounts }: StoreType) => ({
  token,
  myTokenAccounts,
});

const Balance: FC = () => {
  const { token, myTokenAccounts } = useStore(storeGetter);
  const hasTokens = Object.keys(myTokenAccounts).length;

  const tokenSymbol = token?.info?.symbol;

  return (
    <div className="mt-5">
      <div className="pb-5 text-white flex-row">
        {token && (
          <>
            <label className="text-gray-light text-base font-bold block mb-2">Balance</label>
          </>
        )}
        <div className={cx("col-span-1", hasTokens ? "" : "col-start-2")}></div>
        <div className="flex items-stretch">
          {token && (
            <p className="text-base text-blue font-bold">{token?.uiTokenAmount?.uiAmountString} </p>
          )}
          {tokenSymbol && (
            <p className="ml-3 text-base font-bold text-sm text-blue">{` ${tokenSymbol}`}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Balance;
