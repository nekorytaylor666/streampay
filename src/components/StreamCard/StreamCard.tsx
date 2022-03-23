import React, { useEffect, useState, FC, useRef, Fragment } from "react";

import { format, fromUnixTime } from "date-fns";
import { Stream as StreamData, getBN } from "@streamflow/stream";
import { Menu, Transition } from "@headlessui/react";
import { toast } from "react-toastify";
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
import { parseStreamName } from "../../utils/helpers";
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
  StreamInstance,
  myTokenAccounts,
  updateStream,
  deleteStream,
  wallet,
  walletType,
  token,
  tokenPriceUsd,
}: StoreType) => ({
  StreamInstance,
  myTokenAccounts,
  updateStream,
  deleteStream,
  connection: StreamInstance?.getConnection(),
  wallet,
  walletType,
  token,
  tokenPriceUsd,
});

const calculateReleaseFrequency = (period: number, cliffTime: number, endTime: number) => {
  const timeBetweenCliffAndEnd = endTime - cliffTime;
  return timeBetweenCliffAndEnd < period ? timeBetweenCliffAndEnd : period;
};

const StreamCard: FC<StreamProps> = ({ data, id, onWithdraw, myAddress, onTopup, onCancel }) => {
  const [isFullCardVisible, setIsFullCardVisible] = useState(false);
  const {
    StreamInstance,
    myTokenAccounts,
    connection,
    updateStream,
    deleteStream,
    token,
    tokenPriceUsd,
    wallet,
    walletType,
  } = useStore(storeGetter);

  const decimals = myTokenAccounts[data.mint]?.uiTokenAmount.decimals || 0;

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
    withdrawFrequency,
  } = formatStreamData(data, decimals);
  let symbol = "";
  try {
    symbol = myTokenAccounts[mint].info.symbol;
  } catch (error) {}
  const icon = myTokenAccounts[mint]?.info.logoURI || "";
  // const isCliffDateAfterStart = cliff > start;
  // const isCliffAmount = cliffAmount > 0;
  const streamName = parseStreamName(name);
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
    if (!connection || !StreamInstance || !withdrawAmount) return;

    const isWithdrawn = await withdrawStream(
      StreamInstance,
      { id, amount: getBN(withdrawAmount, decimals) },
      wallet
    );

    if (isWithdrawn) {
      const stream = await StreamInstance.getOne(id);
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
    if (!StreamInstance || !connection) return;
    const stream = await StreamInstance.getOne(id);

    if (stream) {
      onWithdraw();
      updateStream([id, stream]);
    }
  };

  const handleTopup = async () => {
    let topupAmount = (await topupModalRef?.current?.show()) as unknown as number;
    if (!StreamInstance || !connection || !topupAmount) return;
    if (topupAmount === roundAmount(parseInt(token?.uiTokenAmount.amount) || 0, decimals)) {
      // todo max
      topupAmount = 0;
    }

    const isTopupped = await topupStream(
      StreamInstance,
      { id, amount: getBN(topupAmount, decimals) },
      wallet
    );

    if (isTopupped) {
      const stream = await StreamInstance.getOne(id);
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
    if (!StreamInstance || !connection || !wallet || !wallet?.publicKey) return;
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
        StreamInstance,
        { id, recipientId: newRecipient },
        wallet
      );

      if (response) {
        toast.success("Stream transferred to " + newRecipient);

        if (isSender) {
          const stream = await StreamInstance.getOne(id);
          updateStream([id, stream]);
        } else deleteStream(id);
      }
    }
  }

  const ctaOptions = [];
  if (showTopup)
    ctaOptions.push({ value: "topup", label: "Top Up", color: "green", handler: handleTopup });
  if (showTransfer)
    ctaOptions.push({
      value: "transfer",
      label: "Transfer",
      color: "blue",
      handler: handleTransfer,
    });
  if (showWithdraw)
    ctaOptions.push({
      value: "withdraw",
      label: "Withdraw",
      color: "green",
      handler: handleWithdraw,
    });
  if (showCancel)
    ctaOptions.push({ value: "cancel", label: "Cancel", color: "red", handler: onCancel });

  useEffect(() => {
    if (automaticWithdrawal && status === StreamStatus.streaming) {
      const withdrawalInterval = setInterval(() => {
        fetchStream();
      }, (withdrawFrequency + 2) * 1000);

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
  const tooltipAddressMobileRef = useRef<any>(null);
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
    <>
      <div
        className={`hidden sm:grid sm:grid-cols-8 xl:grid-cols-11 rounded-2xl px-4 py-4 mb-1 sm:gap-x-3 ${
          isFullCardVisible && "bg-gray-dark"
        }`}
        data-test-id={id}
      >
        <div className="flex flex-col">
          <div className="flex items-center">
            {isFullCardVisible ? (
              <IcnArrowDown
                onClick={toggleCardVisibility}
                classes="hover:cursor-pointer"
                fill="rgb(113, 130, 152)"
              />
            ) : (
              <IcnArrowRight
                onClick={toggleCardVisibility}
                fill="rgb(113, 130, 152)"
                classes="hover:cursor-pointer"
              />
            )}
            <Badge type={status} color={color} classes="ml-3 sm:ml-2 mb-1" />
          </div>
          {isFullCardVisible && (
            <div className="ml-6 hidden sm:block xl:hidden">
              <p className="text-white text-p2">
                {canTopup ? StreamType.Stream : StreamType.Vesting}
              </p>
              <div className="flex items-center">
                {isRecipient ? (
                  <IcnIncoming className="w-3 h-3" />
                ) : (
                  <IcnOutgoing className="w-3 h-3" />
                )}
                <p className="text-gray-light text-p3 ml-1">
                  {isRecipient ? "Incoming" : "Outgoing"}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="sm:hidden xl:block">
          <p className="text-white text-p2"> {canTopup ? StreamType.Stream : StreamType.Vesting}</p>
          <div className="flex items-center">
            {isRecipient ? (
              <IcnIncoming className="w-3 h-3" />
            ) : (
              <IcnOutgoing className="w-3 h-3" />
            )}
            <p className="text-gray-light text-p3 ml-1">{isRecipient ? "Incoming" : "Outgoing"}</p>
          </div>
        </div>
        <div className="col-span-2">
          <p className="text-white text-p2 font-bold">{streamName}</p>
          <div className="flex items-center relative leading-5">
            <Link
              url={getExplorerLink(EXPLORER_TYPE_ADDR, id)}
              title={"Stream ID"}
              classes="text-gray-light text-p3"
            />
            <span
              ref={tooltipAddressRef}
              data-tip="tooltip"
              data-for={`addressCopied-${id}`}
            ></span>
            <Tooltip
              content={<p className="p-1 text-p2">Address copied!</p>}
              id={`addressCopied-${id}`}
            />
            <button onClick={() => copy(id, tooltipAddressRef)}>
              <IcnCopy classes="text-gray mx-2 fill-current hover:text-blue hover:cursor-pointer w-4 h-4" />
            </button>
            <div className="w-40 sm:w-32 xl:w-34 mb-1">
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
                <div className="w-40 sm:w-32 xl:w-34 mb-1">
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
                <div className="w-40 sm:w-32 xl:w-34 mb-1">
                  <MiddleEllipsis>
                    <span className="text-p3 font-bold text-white">{recipient}</span>
                  </MiddleEllipsis>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="col-span-2">
          <p className="text-p2 text-gray-light flex items-center">
            <img src={icon} alt={symbol} className="w-6 h-6 mr-2" />
            <span className="font-bold text-white">
              {`${formatAmount(withdrawnAmount, decimals, DEFAULT_DECIMAL_PLACES)}`}
            </span>
            /{`${formatAmount(depositedAmount, decimals, DEFAULT_DECIMAL_PLACES)} ${symbol}`}
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
        <div className="col-span-2">
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
            <Progress
              value={depositedAmount - withdrawnAmount}
              max={depositedAmount}
              color={color}
            />
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
              {status === StreamStatus.scheduled ||
                (status === StreamStatus.streaming && (
                  <>
                    <p className="text-p3 text-gray-light mt-2">Release Rate</p>
                    <p className="text-p2 font-bold text-white">
                      {`${formatAmount(
                        amountPerPeriod,
                        decimals,
                        DEFAULT_DECIMAL_PLACES
                      )} ${symbol}`}{" "}
                      <span className="text-p3 text-gray-light mt-1">
                        {`Per ${formatPeriodOfTime(releaseFrequency)}`}
                      </span>
                    </p>
                  </>
                ))}
            </>
          )}
        </div>
        <div className="sm:hidden xl:block col-span-2">
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
                  {format(
                    fromUnixTime(getNextUnlockTime(cliff, period, end, cliffAmount)),
                    "HH:mm"
                  )}
                </p>
              </>
            )}
        </div>
        {!!ctaOptions.length && (
          <Menu as="div" className="relative inline-block text-center">
            <div>
              <Menu.Button className="flex justify-center items-center w-10 h-8 font-bold text-gray hover:text-gray-light bg-gray-dark rounded-md hover:bg-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                ...
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute z-50 left-0 w-32 mt-1 origin-top-right bg-gray-dark divide-y rounded-md shadow-lg focus:outline-none">
                <div className="px-1 py-1">
                  {ctaOptions.map(({ label, color, handler }) => (
                    <Menu.Item as="div" key={label}>
                      <button
                        onClick={handler}
                        className={`text-p2 flex pl-6 font-bold text-${color} py-0.5 hover:cursor-pointer hover:bg-opacity-20`}
                      >
                        {label}
                      </button>
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        )}
      </div>
      <div className="relative sm:hidden p-5 bg-gray-dark rounded-lg mb-3">
        <Badge type={status} color={color} classes="mb-4" />
        <div className="flex mb-3.5">
          <div className="flex">
            <p className="text-white text-p3 mr-1 font-bold">
              {`${canTopup ? StreamType.Stream : StreamType.Vesting}, `}
            </p>
            {isRecipient ? (
              <IcnIncoming className="w-3 h-3 mt-0.5" />
            ) : (
              <IcnOutgoing className="w-3 h-3 mt-0.5" />
            )}
            <p className="text-gray-light text-p3 ml-1">{isRecipient ? "Incoming" : "Outgoing"}</p>
          </div>
        </div>
        <p className="text-white text-p2 font-bold">{streamName}</p>
        <div className="flex items-center relative leading-4 mb-4">
          <Link
            url={getExplorerLink(EXPLORER_TYPE_ADDR, id)}
            title={"Stream ID"}
            classes="text-gray-light text-p3"
          />
          <span
            ref={tooltipAddressMobileRef}
            data-tip="tooltip"
            data-for={`addressCopied-mobile-${id}`}
          ></span>
          <Tooltip
            content={<p className="p-1 text-p2">Address copied!</p>}
            id={`addressCopied-mobile-${id}`}
          />
          <button onClick={() => copy(id, tooltipAddressMobileRef)}>
            <IcnCopy classes="text-gray mx-2 fill-current hover:text-blue hover:cursor-pointer w-4 h-4" />
          </button>
          <div className="w-40 sm:w-32 xl:w-34 mb-1">
            <MiddleEllipsis>
              <span className="text-p3 font-bold text-white">{id}</span>
            </MiddleEllipsis>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-2 mb-2">
          <div className="mb-1">
            <p className="text-gray-light text-p3">Withdrawn</p>
            <p className="text-p3 text-gray-light flex items-center">
              <span className="font-bold text-white">
                {`${formatAmount(withdrawnAmount, decimals, DEFAULT_DECIMAL_PLACES)}`}
              </span>
              /{`${formatAmount(depositedAmount, decimals, DEFAULT_DECIMAL_PLACES)} ${symbol}`}
            </p>
          </div>
          <div>
            <p className="text-gray-light text-p3">Unlocked (Returned)</p>
            <p className="text-p3 text-gray-light flex items-center">
              <span className="font-bold text-white">
                {status === StreamStatus.canceled
                  ? formatAmount(
                      depositedAmount - withdrawnAmount,
                      decimals,
                      DEFAULT_DECIMAL_PLACES
                    )
                  : formatAmount(streamed, decimals, DEFAULT_DECIMAL_PLACES)}
              </span>
              {`/${formatAmount(depositedAmount, decimals, DEFAULT_DECIMAL_PLACES)} ${symbol}`}
            </p>
          </div>
        </div>
        <div>
          <p className="text-gray-light text-p3">Release Rate</p>
          <p className="text-p2 font-bold text-white">
            {`${formatAmount(amountPerPeriod, decimals, DEFAULT_DECIMAL_PLACES)} ${symbol}`}
            <span className="text-xxs text-gray-light font-normal ml-1">{`Per ${formatPeriodOfTime(
              releaseFrequency
            )}`}</span>
          </p>
        </div>
        {!!ctaOptions.length && (
          <Menu as="div" className="top-6 right-6 absolute inline-block text-center">
            <div>
              <Menu.Button className="flex justify-center items-center w-10 h-8 font-bold text-gray hover:text-gray-light bg-gray-200 rounded-md hover:bg-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                ...
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute z-50 right-0 w-36 mt-1 origin-top-right bg-gray-dark divide-y rounded-md shadow-lg focus:outline-none">
                <div className="px-1 py-1">
                  {ctaOptions.map(({ label, color, handler }) => (
                    <Menu.Item as="div" key={label}>
                      <button
                        onClick={handler}
                        className={`text-p2 flex pl-6 font-bold text-${color} py-0.5 hover:cursor-pointer hover:bg-opacity-20`}
                      >
                        {label}
                      </button>
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        )}
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
    </>
  );
};

export default StreamCard;
