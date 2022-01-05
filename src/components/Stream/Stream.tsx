import { useEffect, useState, FC, useRef } from "react";

import { BN } from "@project-serum/anchor";
import { format, fromUnixTime } from "date-fns";
import { PublicKey } from "@solana/web3.js";
import { decode, Stream as StreamData } from "@streamflow/timelock/dist/packages/timelock/layout";
import { ExternalLinkIcon } from "@heroicons/react/outline";
import cx from "classnames";

import {
  EXPLORER_TYPE_ADDR,
  STREAM_STATUS_COLOR,
  ProgramInstruction,
  TX_FINALITY_CONFIRMED,
  DEFAULT_DECIMAL_PLACES,
} from "../../constants";
import { StreamStatus } from "../../types";
import {
  getExplorerLink,
  formatAmount,
  formatPeriodOfTime,
  roundAmount,
} from "../../utils/helpers";
import {
  getStreamStatus,
  getStreamed,
  updateStatus,
  calculateReleaseRate,
  getNextUnlockTime,
} from "./helpers";
import { Address, Link, Button, Modal, ModalRef } from "../index";
import Badge from "./components/Badge";
import Duration from "./components/Duration";
import Progress from "./components/Progress";
import useStore, { StoreType } from "../../stores";
import sendTransaction from "../../actions/sendTransaction";

interface StreamProps {
  data: StreamData;
  myAddress: string;
  id: string;
  onCancel: () => Promise<boolean>;
  onWithdraw: () => Promise<void>;
  onTransfer: () => Promise<void>;
  onTopup: () => Promise<void>;
}

const storeGetter = ({ myTokenAccounts, addStream, connection, wallet, token }: StoreType) => ({
  myTokenAccounts,
  addStream,
  connection: connection(),
  wallet,
  token,
});

const calculateReleaseFrequency = (period: number, cliffTime: number, endTime: number) => {
  const timeBetweenCliffAndEnd = endTime - cliffTime;
  return timeBetweenCliffAndEnd < period ? timeBetweenCliffAndEnd : period;
};

const Stream: FC<StreamProps> = ({
  data,
  myAddress,
  id,
  onCancel,
  onTransfer,
  onWithdraw,
  onTopup,
}) => {
  const {
    start_time,
    end_time,
    period,
    cliff,
    cliff_amount,
    withdrawn_amount,
    net_deposited_amount,
    canceled_at,
    recipient,
    stream_name,
    sender,
    mint,
    cancelable_by_sender,
    cancelable_by_recipient,
    transferable_by_sender,
    transferable_by_recipient,
    amount_per_period,
  } = data;

  const address = mint.toBase58();
  const { myTokenAccounts, connection, addStream, token } = useStore(storeGetter);
  const decimals = myTokenAccounts[address].uiTokenAmount.decimals;
  const symbol = myTokenAccounts[address].info.symbol;
  const isCliffDateAfterStart = cliff > start_time;
  const isCliffAmount = cliff_amount.toNumber() > 0;

  const isStreaming = !amount_per_period.isZero();

  const releaseFrequency = calculateReleaseFrequency(
    period.toNumber(),
    cliff.toNumber(),
    end_time.toNumber()
  );

  const withdrawModalRef = useRef<ModalRef>(null);
  const topupModalRef = useRef<ModalRef>(null);

  const status_enum = getStreamStatus(
    canceled_at,
    start_time,
    end_time,
    new BN(+new Date() / 1000)
  );
  const color = STREAM_STATUS_COLOR[status_enum];

  const [status, setStatus] = useState(status_enum);
  const isCanceled = status === StreamStatus.canceled;
  const [streamed, setStreamed] = useState(
    getStreamed(
      end_time.toNumber(),
      cliff.toNumber(),
      cliff_amount.toNumber(),
      net_deposited_amount.toNumber(),
      period.toNumber(),
      amount_per_period.toNumber()
    )
  );

  const [available, setAvailable] = useState(streamed.toNumber() - withdrawn_amount.toNumber());

  const showWithdraw =
    (status === StreamStatus.streaming ||
      (status === StreamStatus.complete &&
        withdrawn_amount.toNumber() < net_deposited_amount.toNumber())) &&
    myAddress === recipient.toBase58();

  const showCancelOnSender =
    cancelable_by_sender &&
    (status === StreamStatus.streaming || status === StreamStatus.scheduled) &&
    myAddress === sender.toBase58();

  const showCancelOnRecipient =
    cancelable_by_recipient &&
    myAddress === recipient.toBase58() &&
    status === StreamStatus.streaming;

  const showCancel = showCancelOnSender || showCancelOnRecipient;

  const showTransferOnSender =
    transferable_by_sender &&
    myAddress === sender.toBase58() &&
    (status === StreamStatus.streaming || status === StreamStatus.complete);

  const showTransferOnRecipient =
    transferable_by_recipient &&
    myAddress === recipient.toBase58() &&
    (status === StreamStatus.streaming || status === StreamStatus.complete);

  const showTransfer = showTransferOnSender || showTransferOnRecipient;

  const showTopup =
    myAddress === sender.toBase58() &&
    isStreaming &&
    (status === StreamStatus.streaming || status === StreamStatus.scheduled);

  const handleWithdraw = async () => {
    const withdrawAmount = (await withdrawModalRef?.current?.show()) as unknown as number;
    if (!connection || !withdrawAmount) return;

    //
    // if ((withdrawAmount = roundAmount(available, decimals))) {
    //   //max
    //   withdrawAmount = new BN(2 ** 64 - 1);//todo: how to pass u64::MAX (i.e. 2^64-1)
    // }

    const isWithdrawn = await sendTransaction(ProgramInstruction.Withdraw, {
      stream: new PublicKey(id),
      amount: new BN(withdrawAmount * 10 ** decimals),
    });

    if (isWithdrawn) {
      const stream = await connection.getAccountInfo(new PublicKey(id), TX_FINALITY_CONFIRMED);
      if (stream) {
        onWithdraw();
        addStream(id, decode(stream.data));
      }
    }
  };

  const handleTopup = async () => {
    let topupAmount = (await topupModalRef?.current?.show()) as unknown as number;
    if (!connection || !topupAmount) return;

    if (topupAmount === roundAmount(parseInt(token?.uiTokenAmount.amount) || 0, decimals)) {
      //max
      topupAmount = 0;
    }

    const isTopupped = await sendTransaction(ProgramInstruction.Topup, {
      stream: new PublicKey(id),
      amount: new BN(topupAmount * 10 ** decimals),
    });

    if (isTopupped) {
      const stream = await connection.getAccountInfo(new PublicKey(id), TX_FINALITY_CONFIRMED);
      if (stream) {
        onTopup();
        addStream(id, decode(stream.data));
      }
    }
  };

  useEffect(() => {
    if (status === StreamStatus.scheduled || status === StreamStatus.streaming) {
      const interval = setInterval(() => {
        setStreamed(
          getStreamed(
            end_time.toNumber(),
            cliff.toNumber(),
            cliff_amount.toNumber(),
            net_deposited_amount.toNumber(),
            period.toNumber(),
            amount_per_period.toNumber()
          )
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
    } else {
      setAvailable(streamed.toNumber() - withdrawn_amount.toNumber());
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, canceled_at, streamed, withdrawn_amount]);

  return (
    <>
      <dl
        className={`text-gray-100 text-base my-4 grid gap-y-4 gap-x-2 grid-cols-12 p-4 bg-${color}-300 bg-opacity-10 hover:bg-opacity-20 shadow rounded-lg`}
      >
        <Badge classes="col-span-full" type={status} color={color} />
        <Duration
          start_time={start_time}
          end_time={end_time}
          canceled_at={canceled_at}
          isCanceled={isCanceled}
          cliff={cliff}
          isAdvanced={isCliffDateAfterStart}
        />
        <p className="col-span-4 sm:col-span-3">Subject</p>
        <p className="col-span-8 sm:col-span-9 text-gray-400 pt-0.5 capitalize">{stream_name}</p>
        <Link
          url={getExplorerLink(EXPLORER_TYPE_ADDR, id)}
          title={"Stream ID"}
          classes="col-span-4 sm:col-span-3 text-sm text-base"
          Icon={ExternalLinkIcon}
        />
        <Address address={id} classes="col-span-8 sm:col-span-9 text-sm text-gray-400 pt-0.5" />
        <Link
          url={getExplorerLink(EXPLORER_TYPE_ADDR, recipient.toBase58())}
          title={"Recipient"}
          classes="col-span-4 sm:col-span-3 text-base"
          Icon={ExternalLinkIcon}
        />
        <Address
          address={recipient.toBase58()}
          classes="col-span-8 sm:col-span-9 text-sm text-gray-400 pt-0.5"
        />
        {isCliffAmount && (
          <>
            <dd className="col-span-4 sm:col-span-3">
              Unlocked
              <small className="text-xs block text-gray-400 align-top">{`at ${
                isCliffDateAfterStart ? "cliff" : "start"
              } date`}</small>
            </dd>
            <dt className="col-span-8 sm:col-span-9 text-gray-400 pt-2">{`${formatAmount(
              cliff_amount.toNumber(),
              decimals,
              DEFAULT_DECIMAL_PLACES
            )} ${symbol}`}</dt>
          </>
        )}
        <dd className="col-span-4 sm:col-span-3">
          Release rate
          {isCliffDateAfterStart && (
            <small className="text-xs block text-gray-400 align-top">after cliff date</small>
          )}
        </dd>
        <dt
          className={cx("col-span-8 sm:col-span-9 text-gray-400", {
            "pt-2": isCliffDateAfterStart,
          })}
        >
          {`${formatAmount(
            isStreaming
              ? amount_per_period.toNumber()
              : calculateReleaseRate(
                  end_time.toNumber(),
                  cliff.toNumber(),
                  net_deposited_amount.toNumber(),
                  cliff_amount.toNumber(),
                  period.toNumber()
                ),
            decimals,
            DEFAULT_DECIMAL_PLACES
          )} ${symbol} per ${formatPeriodOfTime(releaseFrequency)}`}
        </dt>
        <Progress
          title="Withdrawn"
          value={withdrawn_amount.toNumber()}
          max={net_deposited_amount}
          decimals={decimals}
          symbol={symbol}
        />
        {status === StreamStatus.canceled && (
          <Progress
            title="Returned"
            value={net_deposited_amount.toNumber() - withdrawn_amount.toNumber()}
            max={net_deposited_amount}
            rtl={true}
            decimals={decimals}
            symbol={symbol}
          />
        )}
        {status !== StreamStatus.canceled && (
          <>
            {(status === StreamStatus.streaming || status === StreamStatus.scheduled) && (
              <>
                <dd className="col-span-4 sm:col-span-3 text-sm">Next unlock</dd>
                <dt className="col-span-8 text-gray-400 text-sm">
                  {format(
                    fromUnixTime(
                      getNextUnlockTime(cliff.toNumber(), period.toNumber(), end_time.toNumber())
                    ),
                    "ccc do MMM, yy HH:mm:ss"
                  )}
                </dt>
              </>
            )}
            <Progress
              title="Unlocked"
              value={streamed.toNumber()}
              max={net_deposited_amount}
              decimals={decimals}
              symbol={symbol}
            />
            {showTopup && (
              <Button onClick={handleTopup} primary classes="col-span-3 text-sm py-1 w-full">
                Top Up
              </Button>
            )}
            {showWithdraw && (
              <>
                <dd className="col-span-4">
                  Available
                  <br />
                  <sup className="text-xs text-gray-400 align-top">for withdrawal</sup>
                </dd>
                <dt className="col-span-8 pt-1.5">
                  ~ {formatAmount(available, decimals, DEFAULT_DECIMAL_PLACES)} {symbol}
                </dt>
                <Button
                  onClick={handleWithdraw}
                  background={STREAM_STATUS_COLOR[StreamStatus.streaming]}
                  classes="col-span-3 text-sm py-1 w-full"
                >
                  Withdraw
                </Button>
              </>
            )}
            {showTransfer && (
              <Button
                onClick={onTransfer}
                background={STREAM_STATUS_COLOR[StreamStatus.complete]}
                classes="col-span-3 text-sm py-1 w-full"
              >
                Transfer
              </Button>
            )}
            {showCancel && (
              <Button
                onClick={onCancel}
                background={STREAM_STATUS_COLOR[StreamStatus.canceled]}
                classes="col-span-3 text-sm py-1 w-full"
              >
                Cancel
              </Button>
            )}
          </>
        )}
      </dl>
      <Modal
        ref={withdrawModalRef}
        title={`You can withdraw between 0 and ${roundAmount(available, decimals)} ${symbol}.`}
        type="range"
        min={0}
        max={roundAmount(available, decimals)}
        confirm={{ color: "green", text: "Withdraw" }}
      />
      <Modal
        ref={topupModalRef}
        title={`You can top up between 0 and ${roundAmount(
          parseInt(token?.uiTokenAmount?.amount) || 0,
          decimals
        )} ${symbol}.`}
        type="range"
        min={0}
        max={roundAmount(parseInt(token?.uiTokenAmount?.amount) || 0, decimals)}
        confirm={{ color: "green", text: "Top Up" }}
      />
    </>
  );
};

export default Stream;
