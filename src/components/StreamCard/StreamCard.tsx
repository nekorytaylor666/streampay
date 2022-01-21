import { useEffect, useState, FC, useRef } from "react";

import { BN } from "@project-serum/anchor";
import { format, fromUnixTime } from "date-fns";
import { PublicKey } from "@solana/web3.js";
import { Stream as StreamData } from "@streamflow/timelock/dist/layout";
import { ExternalLinkIcon } from "@heroicons/react/outline";
import cx from "classnames";
import Stream from "@streamflow/timelock";
import { toast } from "react-toastify";
import * as Sentry from "@sentry/react";

import {
  EXPLORER_TYPE_ADDR,
  STREAM_STATUS_COLOR,
  ProgramInstruction,
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
  onTopup: () => Promise<void>;
}

const storeGetter = ({
  myTokenAccounts,
  updateStream,
  deleteStream,
  connection,
  wallet,
  token,
}: StoreType) => ({
  myTokenAccounts,
  updateStream,
  deleteStream,
  connection: connection(),
  wallet,
  token,
});

const calculateReleaseFrequency = (period: number, cliffTime: number, endTime: number) => {
  const timeBetweenCliffAndEnd = endTime - cliffTime;
  return timeBetweenCliffAndEnd < period ? timeBetweenCliffAndEnd : period;
};

const StreamCard: FC<StreamProps> = ({ data, myAddress, id, onCancel, onWithdraw, onTopup }) => {
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
    can_topup,
  } = data;

  const address = mint.toBase58();
  const { myTokenAccounts, connection, updateStream, deleteStream, token } = useStore(storeGetter);
  const decimals = myTokenAccounts[address].uiTokenAmount.decimals;
  const symbol = myTokenAccounts[address].info.symbol;
  const isCliffDateAfterStart = cliff > start_time;
  const isCliffAmount = cliff_amount.toNumber() > 0;
  const isSender = myAddress === sender.toBase58();
  const isRecipient = myAddress === recipient.toBase58();

  const releaseFrequency = calculateReleaseFrequency(
    period.toNumber(),
    cliff.toNumber(),
    end_time.toNumber()
  );

  const withdrawModalRef = useRef<ModalRef>(null);
  const topupModalRef = useRef<ModalRef>(null);
  const transferModalRef = useRef<ModalRef>(null);

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
    isRecipient;

  const showCancelOnSender =
    cancelable_by_sender &&
    isSender &&
    (status === StreamStatus.streaming || status === StreamStatus.scheduled);

  const showCancelOnRecipient =
    cancelable_by_recipient &&
    isRecipient &&
    (status === StreamStatus.streaming || status === StreamStatus.scheduled);

  const showCancel = showCancelOnSender || showCancelOnRecipient;

  const showTransferOnSender =
    transferable_by_sender && isSender && status !== StreamStatus.canceled;

  const showTransferOnRecipient =
    transferable_by_recipient && isRecipient && status !== StreamStatus.canceled;

  const showTransfer = showTransferOnSender || showTransferOnRecipient;

  const showTopup =
    can_topup &&
    isSender &&
    (status === StreamStatus.streaming || status === StreamStatus.scheduled);

  const handleWithdraw = async () => {
    const withdrawAmount = (await withdrawModalRef?.current?.show()) as unknown as number;
    if (!connection || !withdrawAmount) return;

    const isWithdrawn = await sendTransaction(ProgramInstruction.Withdraw, {
      stream: new PublicKey(id),
      amount: new BN(withdrawAmount * 10 ** decimals),
    });

    if (isWithdrawn) {
      const stream = await Stream.getOne(connection, new PublicKey(id));
      if (stream) {
        onWithdraw();
        updateStream([id, stream]);
      }
    }
  };

  const handleTopup = async () => {
    let topupAmount = (await topupModalRef?.current?.show()) as unknown as number;
    if (!connection || !topupAmount) return;
    if (topupAmount === roundAmount(parseInt(token?.uiTokenAmount.amount) || 0, decimals)) {
      // todo max
      topupAmount = 0;
    }

    const isTopupped = await sendTransaction(ProgramInstruction.Topup, {
      stream: new PublicKey(id),
      amount: new BN(topupAmount * 10 ** decimals),
    });

    if (isTopupped) {
      const stream = await Stream.getOne(connection, new PublicKey(id));
      if (stream) {
        onTopup();
        updateStream([id, stream]);
      }
    }
  };

  async function handleTransfer() {
    if (!connection) return;
    const newRecipientAddress = await transferModalRef?.current?.show();

    if (newRecipientAddress !== undefined) {
      if (!newRecipientAddress) {
        toast.error("You didn't provide the address.");
        return;
      }

      if (
        (isSender && newRecipientAddress === sender.toBase58()) ||
        (isRecipient && newRecipientAddress === recipient.toBase58())
      ) {
        toast.error("You can't transfer stream to yourself.");
        return;
      }

      try {
        const newRecipient = new PublicKey(newRecipientAddress);
        const success = await sendTransaction(ProgramInstruction.TransferRecipient, {
          stream: new PublicKey(id),
          new_recipient: new PublicKey(newRecipient),
        });
        if (success) {
          toast.success("Stream transferred to " + newRecipientAddress);

          if (isSender) {
            const stream = await Stream.getOne(connection, new PublicKey(id));
            updateStream([id, stream]);
          } else deleteStream(id);
        }
      } catch (err) {
        Sentry.captureException(err);
        toast.error("Invalid address");
      }
    }
  }

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
  }, [status, streamed, withdrawn_amount]);

  useEffect(() => {
    if (status === StreamStatus.complete) {
      setStreamed(net_deposited_amount);
      setAvailable(net_deposited_amount.toNumber() - withdrawn_amount.toNumber());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

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
            can_topup
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
                      getNextUnlockTime(
                        cliff.toNumber(),
                        period.toNumber(),
                        end_time.toNumber(),
                        cliff_amount.toNumber()
                      )
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
                onClick={handleTransfer}
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
        symbol={symbol}
        type="range"
        min={0}
        max={roundAmount(parseInt(token?.uiTokenAmount?.amount) || 0, decimals)}
        confirm={{ color: "green", text: "Top Up" }}
      />
      <Modal
        ref={transferModalRef}
        title="Transfer recipient:"
        type="text"
        disclaimer={
          isSender
            ? ""
            : "All unlocked tokens that are not withdrawn will be transferred. Please check if you want to withdraw before transferring."
        }
        placeholder="Recipient address"
        confirm={{ color: "blue", text: "Transfer" }}
      />
    </>
  );
};

export default StreamCard;
