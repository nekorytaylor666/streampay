import EmptyStreams from "../Components/EmptyStreams";
import { _swal } from "../utils/helpers";
import { Stream } from "../Components";
import { getUnixTime } from "date-fns";
import {
  ERR_TOKEN_ACCOUNT_NONEXISTENT,
  ERR_NOT_CONNECTED,
  ProgramInstruction,
  TIMELOCK_PROGRAM_ID,
  TX_FINALITY_CONFIRMED,
  ERR_NO_STREAM,
} from "../constants";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import useStore, { StoreType } from "../Stores";
import { toast } from "react-toastify";
import { useEffect } from "react";
import sendTransaction from "../Actions/sendTransaction";
import { BN } from "@project-serum/anchor";
import { decode } from "@streamflow/timelock/dist/layout";
import {
  CancelStreamData,
  TransferStreamData,
  WithdrawStreamData,
} from "../types";
import { u64 } from "@solana/spl-token";
import { useFormContext } from "../Contexts/FormContext";

const storeGetter = (state: StoreType) => ({
  balance: state.balance,
  setBalance: state.setBalance,
  streams: state.streams,
  addStream: state.addStream,
  deleteStream: state.deleteStream,
  clearStreams: state.clearStreams,
  cluster: state.cluster,
  wallet: state.wallet,
  connection: state.connection(),
  refreshTokenAccounts: state.refreshTokenAccounts,
});

export default function StreamsList() {
  const {
    wallet,
    connection,
    balance,
    setBalance,
    streams,
    addStream,
    deleteStream,
    clearStreams,
    cluster,
    refreshTokenAccounts,
  } = useStore(storeGetter);

  const { token } = useFormContext();

  //componentWillMount
  useEffect(() => {
    clearStreams();
    const savedStreams = JSON.parse(localStorage.streams || "{}");
    const publicKey = wallet?.publicKey?.toBase58();
    if (publicKey === undefined) {
      toast.error(ERR_NOT_CONNECTED);
      return;
    }
    const newStreams = savedStreams?.[cluster]?.[publicKey] || {};
    const streamID = window.location.hash.substring(1);

    if (streamID) {
      try {
        new PublicKey(streamID);
        newStreams[streamID] = undefined; // We're setting the data few lines below
      } catch (e) {
        toast.error(ERR_NO_STREAM);
      }
    }

    connection?.getProgramAccounts(new PublicKey(TIMELOCK_PROGRAM_ID), {
      filters: [
        {
          memcmp: {
            offset: 88, //sender offset
            // @ts-ignore
            bytes: wallet?.publicKey?.toBase58(),
          },
        },
        // {
        //   memcmp: {
        //     offset: 152, //recipient offset
        //     // @ts-ignore
        //     bytes: wallet?.publicKey?.toBase58(),
        //   },
        // },
      ],
    });
    // .then((accounts) => {
    //   console.log("accounts fetched from chain", accounts);
    //   for (let i = 0; i < accounts.length; i++) {
    //     let decoded = decode(accounts[i].account.data);
    //     console.log(
    //       accounts[i].pubkey.toBase58(),
    //       decode(accounts[i].account.data)
    //     );
    //     for (const prop in decoded) {
    //       console.log(
    //         prop,
    //         // @ts-ignore
    //         decoded[prop].toString(),
    //         // @ts-ignore
    //         u64.fromBuffer(decoded[prop].toBuffer())
    //       );
    //     }
    //   }
    // });

    for (const id in newStreams) {
      if (newStreams.hasOwnProperty(id)) {
        //first, the cleanup
        let pk = undefined;
        try {
          pk = new PublicKey(id);
        } catch (e: any) {
          toast.error(e.message + id);
          //removeStream(id, true);
        }

        if (pk) {
          connection?.getAccountInfo(new PublicKey(id)).then((result) => {
            if (result?.data) {
              const d = decode(result.data);
              console.log("data fetched from chain: ", {
                magic: d.magic.toString(),
                start_time: d.start_time.toString(),
                end_time: d.end_time.toString(),
                deposited_amount: d.deposited_amount.toString(),
                total_amount: d.total_amount.toString(),
                period: d.period.toString(),
                cliff: d.cliff.toString(),
                cliff_amount: d.cliff_amount.toString(),
                created_at: d.created_at.toString(),
                withdrawn: d.withdrawn.toString(),
                cancel_time: d.cancel_time.toString(),
                sender: d.sender.toString(),
                sender_tokens: d.sender_tokens.toString(),
                recipient: d.recipient.toString(),
                recipient_tokens: d.recipient_tokens.toString(),
                mint: d.mint.toString(),
                escrow_tokens: d.escrow_tokens.toString(),
              });

              addStream(id, decode(result.data));
            } else {
              if (id === streamID) {
                toast.error(ERR_NO_STREAM);
              }
            }
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function withdrawStream(id: string) {
    if (connection === null || wallet === null || wallet.publicKey === null) {
      toast.error(ERR_NOT_CONNECTED);
      return;
    }
    //TODO: enable withdrawing arbitrary amount via UI
    const success = await sendTransaction(
      connection,
      wallet,
      ProgramInstruction.Withdraw,
      {
        stream: new PublicKey(id),
        amount: new BN(0),
      } as WithdrawStreamData
    );
    if (success) {
      const tokenAccounts = await refreshTokenAccounts(
        connection,
        wallet.publicKey as PublicKey
      );
      if (token === null) {
        throw ERR_TOKEN_ACCOUNT_NONEXISTENT;
      }
      const newBalance = tokenAccounts[token.address].amount;
      const stream = await connection.getAccountInfo(
        new PublicKey(id),
        TX_FINALITY_CONFIRMED
      );
      if (streams[id].mint.equals(new PublicKey(token.address))) {
        // if the stream was in the same "currency" as currently selected => update visible balance
        setBalance(newBalance);
      }
      if (stream !== null) {
        addStream(id, decode(stream.data));
      }
    }
  }

  async function cancelStream(id: string) {
    if (connection === null || wallet === null || wallet.publicKey === null) {
      toast.error(ERR_NOT_CONNECTED);
      return;
    }
    const { deposited_amount } = streams[id];
    const now = new Date();
    const oldBalance = balance;
    const success = await sendTransaction(
      connection,
      wallet,
      ProgramInstruction.Cancel,
      {
        stream: new PublicKey(id),
      } as CancelStreamData
    );
    if (success) {
      const tokenAccounts = await refreshTokenAccounts(
        connection,
        wallet.publicKey as PublicKey
      );
      if (token === null) {
        throw ERR_TOKEN_ACCOUNT_NONEXISTENT;
      }
      const newBalance = tokenAccounts[token.address].amount;
      const newWithdrawn = deposited_amount.subn(newBalance - oldBalance);
      if (streams[id].mint.equals(new PublicKey(token.address))) {
        // if the stream was in the same "currency" as currently selected => update visible balance
        setBalance(newBalance);
      }
      addStream(id, {
        ...streams[id],
        withdrawn: newWithdrawn,
        magic: new BN(getUnixTime(now)), //magic field is used as canceled_at until we update account structure
      });
    }
  }

  async function removeStream(id: string, skipPrompt?: boolean) {
    if (!skipPrompt && (await _swal())) {
      deleteStream(id);
    }
  }

  if (
    Object.keys(streams).length === 0 ||
    wallet?.publicKey?.toBase58() === undefined
  ) {
    return <EmptyStreams />;
  }
  const entries = Object.entries(streams)
    .sort(
      ([, stream1], [, stream2]) =>
        stream2.start_time.toNumber() - stream1.start_time.toNumber()
    )
    .map(([id, data]) => (
      <Stream
        key={id}
        // onStatusUpdate={(status) => addStream(id, { ...streams[id], status })}
        onWithdraw={() => withdrawStream(id)}
        onCancel={() => cancelStream(id)}
        onTransfer={(newRecipient) =>
          sendTransaction(
            connection,
            wallet,
            ProgramInstruction.TransferRecipient,
            {
              stream: new PublicKey(id),
              new_recipient: newRecipient,
            } as TransferStreamData
          )
        }
        id={id}
        data={data}
        myAddress={wallet?.publicKey?.toBase58() as string}
        removeStream={() => removeStream(id)}
      />
    ));
  return <>{entries}</>;
}
