import { useEffect, useState, FC, useRef } from "react";

import { BN } from "@project-serum/anchor";
import { format, fromUnixTime } from "date-fns";
import { PublicKey } from "@solana/web3.js";
import { decode, TokenStreamData } from "@streamflow/timelock/dist/layout";

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
  data: TokenStreamData;
  myAddress: string;
  id: string;
  onCancel: () => Promise<boolean>;
  onWithdraw: () => Promise<void>;
  onTransfer: () => void;
}

const storeGetter = ({ myTokenAccounts, addStream, connection, wallet, token }: StoreType) => ({
  myTokenAccounts,
  addStream,
  connection: connection(),
  wallet,
  token,
});

const Stream: FC<StreamProps> = ({ data, myAddress, id, onCancel, onTransfer, onWithdraw }) => {
  const {
    start_time,
    end_time,
    period,
    cliff,
    cliff_amount,
    withdrawn_amount,
    deposited_amount,
    canceled_at,
    recipient,
    sender,
    mint,
  } = data;

  const address = mint.toBase58();
  const { myTokenAccounts, connection, addStream } = useStore(storeGetter);
  const decimals = myTokenAccounts[address].uiTokenAmount.decimals;
  const symbol = myTokenAccounts[address].info.symbol;
  const isAdvanced = cliff > start_time; //cliff exists

  const modalRef = useRef<ModalRef>(null);

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
      start_time.toNumber(),
      end_time.toNumber(),
      cliff.toNumber(),
      cliff_amount.toNumber(),
      deposited_amount.toNumber(),
      period.toNumber()
    )
  );

  const [available, setAvailable] = useState(streamed.toNumber() - withdrawn_amount.toNumber());

  const showWithdraw =
    (status === StreamStatus.streaming ||
      (status === StreamStatus.complete &&
        withdrawn_amount.toNumber() < deposited_amount.toNumber())) &&
    myAddress === recipient.toBase58();

  const showCancel =
    (status === StreamStatus.streaming || status === StreamStatus.scheduled) &&
    myAddress === sender.toBase58();

  const handleWithdraw = async () => {
    const withdrawAmount = await modalRef?.current?.show();
    if (!connection || !withdrawAmount) return;

    const isWithdrawn = await sendTransaction(ProgramInstruction.Withdraw, {
      stream: new PublicKey(id),
      amount: new BN(withdrawAmount),
    });

    if (isWithdrawn) {
      const stream = await connection.getAccountInfo(new PublicKey(id), TX_FINALITY_CONFIRMED);
      if (stream) {
        onWithdraw();
        addStream(id, decode(stream.data));
      }
    }
  };

  useEffect(() => {
    if (status === StreamStatus.scheduled || status === StreamStatus.streaming) {
      const interval = setInterval(() => {
        setStreamed(
          getStreamed(
            start_time.toNumber(),
            end_time.toNumber(),
            cliff.toNumber(),
            cliff_amount.toNumber(),
            deposited_amount.toNumber(),
            period.toNumber()
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, canceled_at, streamed, withdrawn_amount]);

  return (
    <>
      <dl
        className={`text-white text-base my-4 grid gap-y-4 gap-x-2 grid-cols-12 p-4 bg-${color}-300 bg-opacity-10 hover:bg-opacity-20 shadow rounded-lg`}
      >
        <Badge classes="col-span-full" type={status} color={color} />
        <Duration
          start_time={start_time}
          end_time={end_time}
          canceled_at={canceled_at}
          isCanceled={isCanceled}
          cliff={cliff}
          isAdvanced={isAdvanced}
        />
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
        {isAdvanced && (
          <>
            <dd className="col-span-4 sm:col-span-3">
              Unlocked
              <small className="text-xs block text-gray-300 align-top">at cliff date</small>
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
          {isAdvanced && (
            <small className="text-xs block text-gray-300 align-top">after cliff date</small>
          )}
        </dd>
        <dt className="col-span-8 sm:col-span-9 text-gray-400 pt-2">
          {`${formatAmount(
            calculateReleaseRate(
              end_time.toNumber(),
              cliff.toNumber(),
              deposited_amount.toNumber(),
              cliff_amount.toNumber(),
              period.toNumber()
            ),
            decimals,
            DEFAULT_DECIMAL_PLACES
          )} ${symbol} per ${formatPeriodOfTime(period.toNumber())}`}
        </dt>
        <Progress
          title="Withdrawn"
          value={withdrawn_amount.toNumber()}
          max={deposited_amount}
          decimals={decimals}
          symbol={symbol}
        />
        {status === StreamStatus.canceled && (
          <Progress
            title="Returned"
            value={deposited_amount.toNumber() - withdrawn_amount.toNumber()}
            max={deposited_amount}
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
                    fromUnixTime(getNextUnlockTime(cliff.toNumber(), period.toNumber())),
                    "ccc do MMM, yy HH:mm:ss"
                  )}
                </dt>
              </>
            )}
            <Progress
              title="Unlocked"
              value={streamed.toNumber()}
              max={deposited_amount}
              decimals={decimals}
              symbol={symbol}
            />
            {showWithdraw && (
              <>
                <dd className="col-span-4">
                  Available
                  <br />
                  <sup className="text-xs text-gray-300 align-top">for withdrawal</sup>
                </dd>
                <dt className="col-span-8 pt-1.5">
                  ~ {formatAmount(available, decimals, DEFAULT_DECIMAL_PLACES)} {symbol}
                </dt>
                <Button
                  onClick={handleWithdraw}
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
      <Modal
        ref={modalRef}
        title={`You can withdraw between 0 and ${roundAmount(available, decimals)} ${symbol}.`}
        type="range"
        config={{
          defaultValue: roundAmount(available, decimals),
          min: 0,
          max: roundAmount(available, decimals),
        }}
        confirm={{ color: "green", text: "Withdraw" }}
      />
    </>
  );
};

export default Stream;
