import { useEffect, useState, FC } from "react";

import { BN } from "@project-serum/anchor";
import { TokenStreamData } from "@streamflow/timelock/dist/layout";

import { EXPLORER_TYPE_ADDR, STREAM_STATUS_COLOR } from "../../constants";
import { StreamStatus } from "../../types";
import { getExplorerLink, formatAmmount } from "../../utils/helpers";
import { getStreamStatus, getStreamed, updateStatus } from "./helpers";
import { Address, Link, Button } from "../index";
import Badge from "./Badge";
import Duration from "./Duration";
import Progress from "./Progress";
import useStore, { StoreType } from "../../stores";

interface StreamProps {
  data: TokenStreamData;
  myAddress: string;
  id: string;
  onCancel: () => Promise<boolean>;
  onWithdraw: () => void; //TODO: add support for input
  onTransfer: () => void;
}

const storeGetter = ({ myTokenAccounts }: StoreType) => ({
  myTokenAccounts,
});

const Stream: FC<StreamProps> = ({ data, myAddress, id, onCancel, onWithdraw, onTransfer }) => {
  const {
    start_time,
    end_time,
    withdrawn_amount,
    deposited_amount,
    canceled_at,
    recipient,
    sender,
    mint,
  } = data;
  const address = mint.toBase58();
  const { myTokenAccounts } = useStore(storeGetter);
  const decimals = myTokenAccounts[address].uiTokenAmount.decimals;
  const symbol = myTokenAccounts[address].info.symbol;

  const status_enum = getStreamStatus(
    canceled_at,
    start_time,
    end_time,
    new BN(+new Date() / 1000)
  );
  const color = STREAM_STATUS_COLOR[status_enum];

  const [status, setStatus] = useState(status_enum);
  const [streamed, setStreamed] = useState(
    getStreamed(start_time.toNumber(), end_time.toNumber(), deposited_amount.toNumber())
  );
  const [available, setAvailable] = useState(streamed.toNumber() - withdrawn_amount.toNumber());

  const showWithdraw =
    (status === StreamStatus.streaming ||
      (status === StreamStatus.complete && withdrawn_amount < deposited_amount)) &&
    myAddress === recipient.toBase58();

  const showCancel =
    (status === StreamStatus.streaming || status === StreamStatus.scheduled) &&
    myAddress === sender.toBase58();

  useEffect(() => {
    if (status === StreamStatus.scheduled || status === StreamStatus.streaming) {
      const interval = setInterval(() => {
        setStreamed(
          getStreamed(start_time.toNumber(), end_time.toNumber(), deposited_amount.toNumber())
        );

        setAvailable(streamed.toNumber() - withdrawn_amount.toNumber());

        const tmpStatus = updateStatus(
          status,
          start_time.toNumber(),
          end_time.toNumber(),
          canceled_at.toNumber()
        );
        if (tmpStatus !== status) {
          setStatus(tmpStatus);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, canceled_at]);

  return (
    <dl
      className={`text-white my-4 grid gap-y-4 gap-x-2 grid-cols-12 p-4 bg-${color}-300 bg-opacity-10 hover:bg-opacity-20 shadow rounded-lg`}
    >
      <Badge classes="col-span-full" type={status} color={color} />
      <Duration start_time={start_time} end_time={end_time} status={status} />
      <Link
        url={getExplorerLink(EXPLORER_TYPE_ADDR, id)}
        title={"Stream ID"}
        classes="col-span-4 sm:col-span-3 text-sm text-base"
      />
      <Address address={id} classes="col-span-8 sm:col-span-9 text-sm text-gray-400 pt-0.5" />
      <Link
        url={getExplorerLink(EXPLORER_TYPE_ADDR, recipient.toBase58())}
        title={"Recipient"}
        classes="col-span-4 sm:col-span-3 text-base"
      />
      <Address
        address={recipient.toBase58()}
        classes="col-span-8 sm:col-span-9 text-sm text-gray-400 pt-0.5"
      />
      <Progress
        title="Withdrawn"
        value={withdrawn_amount.toNumber()}
        max={deposited_amount}
        decimals={decimals}
      />
      {status === StreamStatus.canceled && (
        <Progress
          title="Returned"
          value={deposited_amount.toNumber() - withdrawn_amount.toNumber()}
          max={deposited_amount}
          rtl={true}
          decimals={decimals}
        />
      )}
      {status !== StreamStatus.canceled && (
        <>
          <Progress
            title="Streamed"
            value={streamed.toNumber()}
            max={deposited_amount}
            decimals={decimals}
          />
          {showWithdraw && (
            <>
              <dt className="col-span-4">
                Available
                <br />
                <sup className="text-xs text-gray-300 align-top">for withdrawal</sup>
              </dt>
              <dd className="col-span-8 pt-1.5">
                {formatAmmount(available, decimals)} {symbol}
              </dd>
              <Button
                onClick={onWithdraw}
                background={STREAM_STATUS_COLOR[StreamStatus.streaming]}
                classes="col-span-4 text-sm py-1 w-full"
              >
                Withdraw
              </Button>
              <Button
                onClick={onTransfer}
                background={STREAM_STATUS_COLOR[StreamStatus.complete]}
                classes="col-span-4 text-sm py-1 w-full"
              >
                Transfer
              </Button>
            </>
          )}
          {showCancel && (
            <Button
              onClick={onCancel}
              background={STREAM_STATUS_COLOR[StreamStatus.canceled]}
              classes="col-span-4 text-sm py-1 w-full"
            >
              Cancel
            </Button>
          )}
        </>
      )}
    </dl>
  );
};

export default Stream;
