import React, { useEffect, useState, FC, useRef } from "react";

import { format, fromUnixTime } from "date-fns";
import Stream, { Stream as StreamData, getBN } from "@streamflow/stream";
// import cx from "classnames";
import { toast } from "react-toastify";
// import { ExternalLinkIcon } from "@heroicons/react/outline";
import MiddleEllipsis from "react-middle-ellipsis";
import ReactTooltip from "react-tooltip";

import {
  EXPLORER_TYPE_ADDR,
  STREAM_STATUS_COLOR,
  DEFAULT_DECIMAL_PLACES,
  TRANSACTION_VARIANT,
  DATA_LAYER_VARIABLE,
} from "../../constants";
import { StreamStatus, StreamType } from "../../types";
import {
  getExplorerLink,
  formatAmount,
  formatPeriodOfTime,
  copyToClipboard,
  roundAmount,
} from "../../utils/helpers";
import {
  getStreamStatus,
  getStreamed,
  updateStatus,
  getNextUnlockTime,
  formatStreamData,
} from "./helpers";
import { ModalRef } from "../index";
import Badge from "./components/Badge";
import Progress from "./components/Progress";
import useStore, { StoreType } from "../../stores";
import { withdrawStream, topupStream, transferStream } from "../../api/transactions";
import { trackEvent, trackTransaction } from "../../utils/marketing_helpers";
import { EVENT_CATEGORY, EVENT_ACTION, EVENT_LABEL } from "../../constants";
import { Link, Tooltip, Modal } from "../../components";
import { ReactComponent as IcnIncoming } from "../../assets/icons/icn-incoming.svg";
import { ReactComponent as IcnOutgoing } from "../../assets/icons/icn-outgoing.svg";
import { IcnCopy, IcnArrowRight, IcnArrowDown } from "../../assets/icons";

interface StreamProps {
  data: StreamData;
  myAddress: string;
  id: string;
  onCancel: () => Promise<void>;
  onWithdraw: () => Promise<void>;
  onTopup: () => Promise<void>;
}

const storeGetter = ({
  myTokenAccounts,
  updateStream,
  deleteStream,
  connection,
  wallet,
  walletType,
  token,
  tokenPriceUsd,
  cluster,
}: StoreType) => ({
  myTokenAccounts,
  updateStream,
  deleteStream,
  connection: connection(),
  wallet,
  walletType,
  token,
  tokenPriceUsd,
  cluster,
});

const calculateReleaseFrequency = (period: number, cliffTime: number, endTime: number) => {
  const timeBetweenCliffAndEnd = endTime - cliffTime;
  return timeBetweenCliffAndEnd < period ? timeBetweenCliffAndEnd : period;
};

// const ctaOptions = [
//   { value: "topup", label: "Top Up", color: "green" },
//   { value: "transfer", label: "Transfer", color: "blue" },
//   { value: "withdraw", label: "Withdraw", color: "green" },
//   { value: "cancel", label: "Cancel", color: "red" },
// ];

const StreamCard: FC<StreamProps> = ({ data, id, onWithdraw, myAddress, onTopup, onCancel }) => {
  const [isFullCardVisible, setIsFullCardVisible] = useState(false);
  const {
    myTokenAccounts,
    connection,
    updateStream,
    deleteStream,
    token,
    tokenPriceUsd,
    cluster,
    wallet,
    walletType,
  } = useStore(storeGetter);
  const decimals = myTokenAccounts[data.mint]?.uiTokenAmount.decimals;

  const {
    start,
    end,
    period,
    cliff,
    cliffAmount,
    withdrawnAmount,
    depositedAmount,
    canceledAt,
    recipient,
    name,
    sender,
    mint,
    cancelableBySender,
    cancelableByRecipient,
    transferableBySender,
    transferableByRecipient,
    amountPerPeriod,
    canTopup,
    automaticWithdrawal,
    withdrawalFrequency,
  } = formatStreamData(data, decimals);
  const symbol = myTokenAccounts[mint].info.symbol;
  const icon = myTokenAccounts[mint].info.logoURI || "";
  // const isCliffDateAfterStart = cliff > start;
  // const isCliffAmount = cliffAmount > 0;
  const isSender = myAddress === sender;
  const isRecipient = myAddress === recipient;

  const releaseFrequency = calculateReleaseFrequency(period, cliff, end);

  const withdrawModalRef = useRef<ModalRef>(null);
  const topupModalRef = useRef<ModalRef>(null);
  const transferModalRef = useRef<ModalRef>(null);

  const statusAtStart = getStreamStatus(canceledAt, start, end, +new Date() / 1000);
  const color = STREAM_STATUS_COLOR[statusAtStart];

  const [status, setStatus] = useState(statusAtStart);
  const isCanceled = status === StreamStatus.canceled;
  const [streamed, setStreamed] = useState(
    getStreamed(end, cliff, cliffAmount, depositedAmount, period, amountPerPeriod)
  );

  const [available, setAvailable] = useState(streamed - withdrawnAmount);
  const showWithdraw =
    (status === StreamStatus.streaming ||
      (status === StreamStatus.complete && withdrawnAmount < depositedAmount)) &&
    isRecipient;

  const showCancelOnSender =
    cancelableBySender &&
    isSender &&
    (status === StreamStatus.streaming || status === StreamStatus.scheduled);

  const showCancelOnRecipient =
    cancelableByRecipient &&
    isRecipient &&
    (status === StreamStatus.streaming || status === StreamStatus.scheduled);

  const showCancel = showCancelOnSender || showCancelOnRecipient;

  const showTransferOnSender = transferableBySender && isSender && status !== StreamStatus.canceled;

  const showTransferOnRecipient =
    transferableByRecipient && isRecipient && status !== StreamStatus.canceled;

  const showTransfer = showTransferOnSender || showTransferOnRecipient;

  const showTopup =
    canTopup &&
    isSender &&
    (status === StreamStatus.streaming || status === StreamStatus.scheduled);

  const handleWithdraw = async () => {
    const withdrawAmount = (await withdrawModalRef?.current?.show()) as unknown as number;
    if (!connection || !withdrawAmount) return;

    const isWithdrawn = await withdrawStream(
      { id, amount: getBN(withdrawAmount, decimals) },
      connection,
      wallet,
      cluster
    );

    if (isWithdrawn) {
      const stream = await Stream.getOne({ connection, id });
      if (stream) {
        onWithdraw();
        updateStream([id, stream]);
      }

      trackEvent(
        data.canTopup ? EVENT_CATEGORY.STREAM : EVENT_CATEGORY.VESTING,
        EVENT_ACTION.WITHDRAW,
        EVENT_LABEL.NONE,
        withdrawAmount * tokenPriceUsd,
        {
          [DATA_LAYER_VARIABLE.TOKEN_SYMBOL]: symbol,
          [DATA_LAYER_VARIABLE.STREAM_ADDRESS]: id,
          [DATA_LAYER_VARIABLE.TOKEN_WITHDRAW_USD]: withdrawnAmount * tokenPriceUsd,
          [DATA_LAYER_VARIABLE.WALLET_TYPE]: walletType?.name,
        }
      );
    }
  };

  const fetchStream = async () => {
    if (!connection) return;
    const stream = await Stream.getOne({ connection, id });

    if (stream) {
      onWithdraw();
      updateStream([id, stream]);
    }
  };

  const handleTopup = async () => {
    let topupAmount = (await topupModalRef?.current?.show()) as unknown as number;
    if (!connection || !topupAmount) return;
    if (topupAmount === roundAmount(parseInt(token?.uiTokenAmount.amount) || 0, decimals)) {
      // todo max
      topupAmount = 0;
    }

    const isTopupped = await topupStream(
      { id, amount: getBN(topupAmount, decimals) },
      connection,
      wallet,
      cluster
    );

    if (isTopupped) {
      const stream = await Stream.getOne({ connection, id });
      if (stream) {
        onTopup();
        updateStream([id, stream]);
      }
      trackTransaction(
        id,
        token.info.symbol,
        token.info.name,
        tokenPriceUsd,
        TRANSACTION_VARIANT.TOP_UP_STREAM,
        topupAmount * 0.0025 * tokenPriceUsd,
        topupAmount * 0.0025,
        topupAmount,
        topupAmount * tokenPriceUsd,
        walletType?.name
      );
    }
  };

  async function handleTransfer() {
    if (!connection || !wallet || !wallet?.publicKey) return;
    const newRecipient = await transferModalRef?.current?.show();

    if (newRecipient !== undefined) {
      if (!newRecipient) {
        toast.error("You didn't provide the address.");
        return;
      }

      if ((isSender && newRecipient === sender) || (isRecipient && newRecipient === recipient)) {
        toast.error("You can't transfer stream to yourself.");
        return;
      }

      const response = await transferStream(
        { id, recipientId: newRecipient },
        connection,
        wallet,
        cluster
      );

      if (response) {
        toast.success("Stream transferred to " + newRecipient);

        if (isSender) {
          const stream = await Stream.getOne({ connection, id });
          updateStream([id, stream]);
        } else deleteStream(id);
      }
    }
  }

  useEffect(() => {
    if (automaticWithdrawal && status === StreamStatus.streaming) {
      const withdrawalInterval = setInterval(() => {
        fetchStream();
      }, (withdrawalFrequency + 2) * 1000);

      return () => clearInterval(withdrawalInterval);
    }

    if (status === StreamStatus.complete) {
      setStreamed(depositedAmount);
      setAvailable(depositedAmount - withdrawnAmount);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (status === StreamStatus.scheduled || status === StreamStatus.streaming) {
      const interval = setInterval(() => {
        setStreamed(getStreamed(end, cliff, cliffAmount, depositedAmount, period, amountPerPeriod));
        setAvailable(streamed - withdrawnAmount);

        const tmpStatus = updateStatus(status, start, end, canceledAt);
        if (tmpStatus !== status) {
          setStatus(tmpStatus);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setAvailable(streamed - withdrawnAmount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, streamed, withdrawnAmount, canceledAt]);

  const toggleCardVisibility = () => setIsFullCardVisible(!isFullCardVisible);

  const tooltipAddressRef = useRef<any>(null);
  const tooltipSenderRef = useRef<any>(null);
  const tooltipRecipientRef = useRef<any>(null);

  function copy(address: string, tooltip: React.MutableRefObject<any>) {
    copyToClipboard(address);
    ReactTooltip.show(tooltip.current!);
    setTimeout(() => {
      ReactTooltip.hide(tooltip.current!);
    }, 1000);
  }

  return (
    <div
      className={`grid grid-cols-7 rounded-2xl px-6 py-4 mb-1 gap-x-3 sm:gap-x-5 ${
        isFullCardVisible && "bg-gray-dark"
      }`}
    >
      <div className="flex items-center">
        {isFullCardVisible ? (
          <IcnArrowDown onClick={toggleCardVisibility} classes="hover:cursor-pointer" fill="gray" />
        ) : (
          <IcnArrowRight
            onClick={toggleCardVisibility}
            fill="gray"
            classes="hover:cursor-pointer"
          />
        )}
        <Badge type={status} color={color} classes="ml-6 mb-1" />
      </div>
      <div>
        <p className="text-white text-p2"> {canTopup ? StreamType.Stream : StreamType.Vesting}</p>
        <div className="flex items-center">
          {isRecipient ? <IcnIncoming className="w-3 h-3" /> : <IcnOutgoing className="w-3 h-3" />}
          <p className="text-gray-light text-p3 ml-1">{isRecipient ? "Incoming" : "Outgoing"}</p>
        </div>
      </div>
      <div>
        <p className="text-white text-p2 font-bold">{name}</p>
        <div className="flex items-center relative leading-5">
          <Link
            url={getExplorerLink(EXPLORER_TYPE_ADDR, id)}
            title={"Stream ID"}
            classes="text-gray-light text-p3"
          />
          <span ref={tooltipAddressRef} data-tip="tooltip" data-for={`addressCopied-${id}`}></span>
          <Tooltip
            content={<p className="p-1 text-p2">Address copied!</p>}
            id={`addressCopied-${id}`}
          />
          <button onClick={() => copy(id, tooltipAddressRef)}>
            <IcnCopy classes="text-gray mx-2 fill-current hover:text-blue hover:cursor-pointer w-4 h-4" />
          </button>
          <div className="w-28 mb-1">
            <MiddleEllipsis>
              <span className="text-p3 font-bold text-white">{id}</span>
            </MiddleEllipsis>
          </div>
        </div>
        {isFullCardVisible && (
          <>
            <div className="flex items-center relative leading-5 mt-2.5">
              <Link
                url={getExplorerLink(EXPLORER_TYPE_ADDR, id)}
                title={"From"}
                classes="text-gray-light text-p3"
              />
              <span
                ref={tooltipSenderRef}
                data-tip="tooltip"
                data-for={`addressCopied-${sender}`}
              ></span>
              <Tooltip
                content={<p className="p-1 text-p2">Address copied!</p>}
                id={`addressCopied-${sender}`}
              />
              <button onClick={() => copy(sender, tooltipSenderRef)}>
                <IcnCopy classes="text-gray mx-2 fill-current hover:text-blue hover:cursor-pointer w-4 h-4" />
              </button>
              <div className="w-28 mb-1">
                <MiddleEllipsis>
                  <span className="text-p3 font-bold text-white">{sender}</span>
                </MiddleEllipsis>
              </div>
            </div>
            <div className="flex items-center relative leading-5">
              <Link
                url={getExplorerLink(EXPLORER_TYPE_ADDR, recipient)}
                title={"To"}
                classes="text-gray-light text-p3"
              />
              <span
                ref={tooltipRecipientRef}
                data-tip="tooltip"
                data-for={`addressCopied-${recipient}`}
              ></span>
              <Tooltip
                content={<p className="p-1 text-p2">Address copied!</p>}
                id={`addressCopied-${recipient}`}
              />
              <button onClick={() => copy(recipient, tooltipRecipientRef)}>
                <IcnCopy classes="text-gray mx-2 fill-current hover:text-blue hover:cursor-pointer w-4 h-4" />
              </button>
              <div className="w-28 mb-1">
                <MiddleEllipsis>
                  <span className="text-p3 font-bold text-white">{recipient}</span>
                </MiddleEllipsis>
              </div>
            </div>
          </>
        )}
      </div>
      <div>
        <p className="text-p2 text-gray-light flex items-center">
          <img src={icon} alt={symbol} className="w-6 h-6 mr-2" />
          <span className="font-bold text-white">
            {`${formatAmount(withdrawnAmount, decimals, DEFAULT_DECIMAL_PLACES)}`}
          </span>
          /{`${formatAmount(depositedAmount, decimals, DEFAULT_DECIMAL_PLACES)}`}
        </p>
        <Progress value={withdrawnAmount} max={depositedAmount} color={color} />
        {isFullCardVisible && (
          <>
            <p className="text-p3 text-gray-light mt-5 mb-1">Start Date</p>
            <p className="font-bold text-white text-p3">
              {format(fromUnixTime(start), "ccc do MMM, yy")}
              <span className="font-normal text-gray-light"> at </span>
              {format(fromUnixTime(start), "HH:mm")}
            </p>
          </>
        )}
      </div>
      <div>
        <p className="text-p2 text-gray-light flex items-center">
          <img src={icon} alt={symbol} className="w-6 h-6 mr-2" />
          <span className="font-bold text-white">
            {status === StreamStatus.canceled
              ? formatAmount(depositedAmount - withdrawnAmount, decimals, DEFAULT_DECIMAL_PLACES)
              : formatAmount(streamed, decimals, DEFAULT_DECIMAL_PLACES)}
          </span>

          {`/${formatAmount(depositedAmount, decimals, DEFAULT_DECIMAL_PLACES)} ${symbol}`}
        </p>
        {status !== StreamStatus.canceled && (
          <Progress value={streamed} max={depositedAmount} color={color} />
        )}
        {status === StreamStatus.canceled && (
          <Progress value={depositedAmount - withdrawnAmount} max={depositedAmount} color={color} />
        )}
        {isFullCardVisible && (
          <>
            <p className="text-p3 text-gray-light mt-5 mb-1">
              {isCanceled ? "Canceled At" : "End Date"}
            </p>
            <p className="font-bold text-white text-p3">
              {format(fromUnixTime(isCanceled ? canceledAt || 0 : end), "ccc do MMM, yy")}
              <span className="font-normal text-gray-light"> at </span>
              {format(fromUnixTime(isCanceled ? canceledAt || 0 : end), "HH:mm")}
            </p>
          </>
        )}
      </div>
      <div>
        <div className="flex items-center">
          <img src={icon} alt={symbol} className="w-6 h-6 mr-2" />
          <p className="text-p2 font-bold text-white">{`${formatAmount(
            amountPerPeriod,
            decimals,
            DEFAULT_DECIMAL_PLACES
          )} ${symbol}`}</p>
        </div>
        <p className="text-p3 text-gray-light mt-1">{`Per ${formatPeriodOfTime(
          releaseFrequency
        )}`}</p>
        {isFullCardVisible &&
          (status === StreamStatus.streaming || status === StreamStatus.scheduled) && (
            <>
              <p className="text-p3 text-gray-light mt-4 mb-1">Next Unlock</p>
              <p className="font-bold text-p3 text-white">
                {format(
                  fromUnixTime(getNextUnlockTime(cliff, period, end, cliffAmount)),
                  "ccc do MMM, yy"
                )}
                <span className="font-normal text-gray-light"> at </span>
                {format(fromUnixTime(getNextUnlockTime(cliff, period, end, cliffAmount)), "HH:mm")}
              </p>
            </>
          )}
      </div>
      <div>
        <div className="bg-gray-dark rounded-lg w-28">
          {showTopup && (
            <button
              className="text-p2 font-bold text-green py-0.5 hover:cursor-pointer flex justify-center items-center w-28"
              onClick={handleTopup}
            >
              Topup
            </button>
          )}
          {showTransfer && (
            <button
              className="text-p2 font-bold text-blue py-0.5 hover:cursor-pointer w-28"
              onClick={handleTransfer}
            >
              Transfer
            </button>
          )}
          {showCancel && (
            <button
              className="text-p2 font-bold text-red py-0.5 hover:cursor-pointer flex justify-center items-center w-28"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          {showWithdraw && (
            <button
              className="text-p2 font-bold text-green py-0.5 hover:cursor-pointer flex justify-center items-center w-28"
              onClick={handleWithdraw}
            >
              Withdraw
            </button>
          )}
        </div>
      </div>
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
          parseFloat(token?.uiTokenAmount?.amount) / 10 ** decimals || 0
        )} ${symbol}.`}
        symbol={symbol}
        type="range"
        min={0}
        max={roundAmount(parseFloat(token?.uiTokenAmount?.amount) / 10 ** decimals || 0)}
        confirm={{ color: "blue", text: "Top Up" }}
        automaticWithdrawal={automaticWithdrawal}
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
    </div>
    // <>
    /* <dl
        className={`text-gray-light text-base my-4 grid gap-y-4 gap-x-2 grid-cols-12 p-4 bg-gray-dark bg-opacity-10 hover:bg-opacity-20 shadow rounded-lg`}
      >
        <Badge classes="col-span-full" type={status} color={color} />
        <Duration
          start={start}
          end={end}
          canceledAt={canceledAt}
          isCanceled={isCanceled}
          cliff={cliff}
          hasCliff={isCliffDateAfterStart || cliffAmount > 0}
        />
        <p className="col-span-4 sm:col-span-3">Subject</p>
        <p className="col-span-8 sm:col-span-9 text-gray-light pt-0.5 capitalize">{name}</p>
        <Link
          url={getExplorerLink(EXPLORER_TYPE_ADDR, id)}
          title={"Stream ID"}
          Icon={ExternalLinkIcon}
          classes="col-span-4 sm:col-span-3 text-blue"
        />
        <Address address={id} classes="col-span-8 sm:col-span-9 text-sm text-gray-light pt-0.5" />
        <Link
          url={getExplorerLink(EXPLORER_TYPE_ADDR, recipient)}
          title={"Recipient"}
          Icon={ExternalLinkIcon}
          classes="col-span-4 sm:col-span-3 text-blue"
        />
        <Address
          address={recipient}
          classes="col-span-8 sm:col-span-9 text-sm text-gray-light pt-0.5"
        />
        {isCliffAmount && (
          <>
            <dd className="col-span-4 sm:col-span-3">
              Unlocked
              <small className="text-xs block text-gray-light align-top">{`at ${
                isCliffDateAfterStart ? "cliff" : "start"
              } date`}</small>
            </dd>
            <dt className="col-span-8 sm:col-span-9 text-gray-light pt-2">{`${formatAmount(
              cliffAmount,
              decimals,
              DEFAULT_DECIMAL_PLACES
            )} ${symbol}`}</dt>
          </>
        )}
        <dd className="col-span-4 sm:col-span-3">
          Release rate
          {isCliffDateAfterStart && (
            <small className="text-xs block text-gray-light align-top">after cliff date</small>
          )}
        </dd>
        <dt
          className={cx("col-span-8 sm:col-span-9 text-gray-light", {
            "pt-2": isCliffDateAfterStart,
          })}
        >
          {`${formatAmount(
            amountPerPeriod,
            decimals,
            DEFAULT_DECIMAL_PLACES
          )} ${symbol} per ${formatPeriodOfTime(releaseFrequency)}`}
        </dt>
        <Progress
          title="Withdrawn"
          value={withdrawnAmount}
          max={depositedAmount}
          decimals={decimals}
          symbol={symbol}
          subtitle={automaticWithdrawal ? "Automatic withdrawal enabled." : ""}
        />
        {status === StreamStatus.canceled && (
          <Progress
            title="Returned"
            value={depositedAmount - withdrawnAmount}
            max={depositedAmount}
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
                <dt className="col-span-8 text-gray-light text-sm">
                  {format(
                    fromUnixTime(getNextUnlockTime(cliff, period, end, cliffAmount)),
                    "ccc do MMM, yy HH:mm:ss"
                  )}
                </dt>
              </>
            )}
            <Progress
              title="Unlocked"
              value={streamed}
              max={depositedAmount}
              decimals={decimals}
              symbol={symbol}
            />
            {showWithdraw && (
              <>
                <dd className="col-span-4">
                  Available
                  <br />
                  <sup className="text-xs text-gray-light align-top">for withdrawal</sup>
                </dd>
                <dt className="col-span-8 pt-1.5">
                  ~ {formatAmount(available, decimals, DEFAULT_DECIMAL_PLACES)} {symbol}
                </dt>
              </>
            )}
            {showTopup && (
              <Button
                onClick={handleTopup}
                background="blue"
                classes="col-span-3 text-sm py-1 w-full"
              >
                Top Up
              </Button>
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
            {showWithdraw && (
              <>
                <Button
                  onClick={handleWithdraw}
                  background={STREAM_STATUS_COLOR[StreamStatus.streaming]}
                  classes="col-span-3 text-sm py-1 w-full"
                >
                  Withdraw
                </Button>
              </>
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
          parseFloat(token?.uiTokenAmount?.amount) / 10 ** decimals || 0
        )} ${symbol}.`}
        symbol={symbol}
        type="range"
        min={0}
        max={roundAmount(parseFloat(token?.uiTokenAmount?.amount) / 10 ** decimals || 0)}
        confirm={{ color: "blue", text: "Top Up" }}
        automaticWithdrawal={automaticWithdrawal}
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
      /> */
    /* </> */
  );
};

export default StreamCard;
