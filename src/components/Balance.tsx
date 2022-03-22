import { FC } from "react";

import cx from "classnames";
import { Cluster } from "@streamflow/stream";

import useStore, { StoreType } from "../stores";
import { Airdrop } from "./";

const storeGetter = ({ token, myTokenAccounts, cluster }: StoreType) => ({
  token,
  myTokenAccounts,
  isDevnet: cluster === Cluster.Devnet,
});

interface BalanceProps {
  classes?: string;
}

const Balance: FC<BalanceProps> = ({ classes }) => {
  const { token, myTokenAccounts, isDevnet } = useStore(storeGetter);
  const hasTokens = Object.keys(myTokenAccounts).length;

  const tokenSymbol = token?.info?.symbol;

  return (
    <div className={`${classes} mt-5`}>
      <div className="pb-5 text-white flex-row">
        {token && (
          <>
            <label className="text-white text-base font-bold block mb-1">Balance</label>
          </>
        )}
        <div className={cx("col-span-1", hasTokens ? "" : "col-start-2")}></div>
        <div className="flex items-stretch">
          {token && (
            <p className="text-base text-blue font-bold">{token?.uiTokenAmount?.uiAmountString} </p>
          )}
          {tokenSymbol && (
            <p className="ml-3 text-base font-bold text-sm text-gray-light">{` ${tokenSymbol}`}</p>
          )}
        </div>
      </div>
      {isDevnet && <Airdrop classes="sm:hidden" />}
    </div>
  );
};

export default Balance;
