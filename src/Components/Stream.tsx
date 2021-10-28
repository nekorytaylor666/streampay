import Badge from "./Stream/Badge";
import ActionButton from "./Stream/ActionButton";
import { getUnixTime } from "date-fns";
import Duration from "./Stream/Duration";
import Progress from "./Stream/Progress";
import { useEffect, useState } from "react";
import { getExplorerLink, getStreamStatus } from "../utils/helpers";
import { EXPLORER_TYPE_ADDR, STREAM_STATUS_COLOR } from "../constants";
import { Address, Link } from "./index";
import { StreamStatus } from "../types";
import { TokenStreamData } from "@streamflow/timelock/dist/layout";
import { BN } from "@project-serum/anchor";

// const storeGetter = (state: StoreType) => ({
//   tokensStreaming: state.tokensStreaming,
// });

export default function Stream(props: {
  data: TokenStreamData;
  myAddress: string;
  id: string;
  removeStream: () => void;
  // onStatusUpdate: (status: StreamStatus) => void;
  onCancel: () => void;
  onWithdraw: () => void; //TODO: add support for input
  onTransfer: () => void;
}) {
  const {
    magic,
    start_time,
    end_time,
    withdrawn_amount,
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

  // const { tokensStreaming } = useStore(storeGetter);

  const [streamed, setStreamed] = useState(
    getStreamed(
      start_time.toNumber(),
      end_time.toNumber(),
      deposited_amount.toNumber()
    )
  );
  let status_enum = getStreamStatus(
    start_time,
    end_time,
    new BN(+new Date() / 1000)
  );
  if (magic.toNumber() > 0) {
    status_enum = StreamStatus.canceled;
  }

  const [status, setStatus] = useState(status_enum);

  const color = STREAM_STATUS_COLOR[status_enum];
  const [available, setAvailable] = useState(
    streamed.toNumber() - withdrawn_amount.toNumber()
  );

  const showWithdraw =
    (status === StreamStatus.streaming ||
      (status === StreamStatus.complete &&
        withdrawn_amount < deposited_amount)) &&
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
      setAvailable(streamed.toNumber() - withdrawn_amount.toNumber());
      const tmpStatus = updateStatus(
        status,
        start_time.toNumber(),
        end_time.toNumber(),
        magic.toNumber()
      );
      if (tmpStatus !== status) {
        setStatus(tmpStatus);
      }
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
        value={withdrawn_amount.toNumber()}
        max={deposited_amount}
      />

      {status === StreamStatus.canceled && (
        <Progress
          title="Returned"
          value={deposited_amount.toNumber() - withdrawn_amount.toNumber()}
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
              <dd className="col-span-2">
                {available}
                {/*{available / 10 ** tokensStreaming[mint.toBase58()].decimals}{" "}*/}
                {/*{tokensStreaming[mint.toBase58()].symbol}*/}
              </dd>
              <ActionButton
                title="Withdraw"
                action={onWithdraw}
                color={STREAM_STATUS_COLOR[StreamStatus.streaming]}
              />
              <ActionButton
                title="Transfer"
                action={onTransfer}
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
  current_status: StreamStatus,
  start_time: number,
  end_time: number,
  canceled_time?: number
): StreamStatus {
  if (canceled_time) {
    return StreamStatus.canceled;
  }
  const now = getUnixTime(new Date());
  if (current_status === StreamStatus.scheduled && now >= start_time) {
    return StreamStatus.streaming;
  } else if (current_status === StreamStatus.streaming && now >= end_time) {
    return StreamStatus.complete;
  } else {
    return current_status;
  }
}
