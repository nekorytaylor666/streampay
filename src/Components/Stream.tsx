import Badge from "./Stream/Badge";
import ActionButton from "./Stream/ActionButton";
import { getUnixTime } from "date-fns";
import Duration from "./Stream/Duration";
import Progress from "./Stream/Progress";
import { useEffect, useState } from "react";
import { getExplorerLink, getStreamStatus } from "../utils/helpers";
import { XIcon } from "@heroicons/react/outline";
import { EXPLORER_TYPE_ADDR, STREAM_STATUS_COLOR } from "../constants";
import { Address, Link } from "./index";
import { StreamStatus } from "../types";
import { PublicKey } from "@solana/web3.js";
import { Stream as StreamType } from "@streamflow/timelock/dist/layout";
import { BN } from "@project-serum/anchor";

export default function Stream(props: {
  data: StreamType;
  myAddress: string;
  id: string;
  removeStream: () => void;
  // onStatusUpdate: (status: StreamStatus) => void;
  onCancel: () => void;
  onWithdraw: () => void; //TODO: add support for input
  onTransfer: (value: PublicKey) => void; //TODO: pass real data.
}) {
  const {
    start_time,
    end_time,
    withdrawn,
    deposited_amount,
    recipient,
    sender,
  } = props.data;
  const {
    myAddress,
    removeStream,
    // onStatusUpdate,
    onCancel,
    onWithdraw,
    onTransfer,
    id,
  } = props;

  const [streamed, setStreamed] = useState(
    new BN(0)
    // getStreamed(
    //   start_time.toNumber(),
    //   end_time.toNumber(),
    //   deposited_amount.toNumber()
    // )
  );
  const status_enum = getStreamStatus(
    start_time,
    end_time,
    new BN(+new Date() / 1000)
  );

  const [status, setStatus] = useState(status_enum);

  const color = STREAM_STATUS_COLOR[status_enum];
  const [available, setAvailable] = useState(
    streamed.toNumber() - withdrawn.toNumber()
  );

  const showWithdraw =
    (status === StreamStatus.streaming ||
      (status === StreamStatus.complete && withdrawn < deposited_amount)) &&
    myAddress === recipient.toBase58();
  const showCancel =
    (status === StreamStatus.streaming || status === StreamStatus.scheduled) &&
    myAddress === sender.toBase58();
  useEffect(() => {
    const interval = setInterval(() => {
      setStreamed(
        getStreamed(
          start_time.toNumber(),
          end_time.toNumber(),
          deposited_amount.toNumber()
        )
      );
      setAvailable(streamed.toNumber() - withdrawn.toNumber());
      // const tmpStatus = updateStatus(status, start_time, end_time);
      // if (tmpStatus !== status) {
      // onStatusUpdate(tmpStatus);
      // }
    }, 1000);
    return () => clearInterval(interval);
  });

  return (
    <dl
      className={`text-white my-4 grid gap-y-4 gap-x-2 grid-cols-3 p-4 bg-${color}-300 bg-opacity-10 hover:bg-opacity-20 shadow rounded-lg`}
    >
      <div className="col-span-full">
        <Badge type={status} color={color} />
        <button
          onClick={removeStream}
          className={`p-1.5 h-6 w-6 float-right align-top rounded-sm hover:bg-${color}-100 focus:outline-none focus:ring-1`}
        >
          {/*<XIcon className="float-right w-3 h-3" />*/}
        </button>
      </div>
      <Duration start_time={start_time} end_time={end_time} />
      <Link url={getExplorerLink(EXPLORER_TYPE_ADDR, id)} title={"Stream ID"} />
      <Address address={id} className="col-span-2 text-sm text-gray-400" />
      <Link
        url={getExplorerLink(EXPLORER_TYPE_ADDR, recipient.toBase58())}
        title={"Recipient"}
      />
      <Address
        address={recipient.toBase58()}
        className="col-span-2 text-sm text-gray-400"
      />
      <Progress
        title="Withdrawn"
        value={withdrawn.toNumber()}
        max={deposited_amount}
      />

      {status === StreamStatus.canceled && (
        <Progress
          title="Returned"
          value={deposited_amount.toNumber() - withdrawn.toNumber()}
          max={deposited_amount}
          rtl={true}
        />
      )}
      {status !== StreamStatus.canceled && (
        <>
          <Progress
            title="Streamed"
            value={streamed.toNumber()}
            max={deposited_amount}
          />
          {showWithdraw && (
            <>
              <dt>
                Available
                <br />
                <sup className="text-xs text-gray-300 align-top">
                  for withdrawal
                </sup>
              </dt>
              <dd className="col-span-2">◎{available}</dd>
              <ActionButton
                title="Withdraw"
                action={onWithdraw}
                color={STREAM_STATUS_COLOR[StreamStatus.streaming]}
              />
              <ActionButton
                title="Transfer"
                action={() => onTransfer(new PublicKey(""))}
                color={STREAM_STATUS_COLOR[StreamStatus.complete]}
              />
            </>
          )}
          {showCancel && (
            <ActionButton
              title={"Cancel"}
              action={onCancel}
              color={STREAM_STATUS_COLOR[StreamStatus.canceled]}
            />
          )}
        </>
      )}
    </dl>
  );
}

export function getStreamed(
  start_time: number,
  end_time: number,
  deposited_amount: number,
  timestamp?: number
): BN {
  timestamp = timestamp || getUnixTime(new Date());

  if (timestamp < start_time) return new BN(0);
  if (timestamp > end_time) return new BN(deposited_amount);
  console.log("streamed");
  return new BN(
    ((timestamp - start_time) / (end_time - start_time)) * deposited_amount
  );
}

function updateStatus(
  status: StreamStatus,
  start_time: number,
  end_time: number
): StreamStatus {
  const now = getUnixTime(new Date());
  if (status === StreamStatus.scheduled && now >= start_time) {
    return StreamStatus.streaming;
  } else if (status === StreamStatus.streaming && now >= end_time) {
    return StreamStatus.complete;
  } else {
    return status;
  }
}
