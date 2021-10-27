import EmptyStreams from "../Components/EmptyStreams";
import { _swal } from "../utils/helpers";
import { Stream } from "../Components";
import {
  ERR_NO_STREAM,
  ERR_NOT_CONNECTED,
  ProgramInstruction,
  TIMELOCK_PROGRAM_ID,
  TIMELOCK_STRUCT_OFFSET_RECIPIENT,
  TIMELOCK_STRUCT_OFFSET_SENDER,
  TX_FINALITY_CONFIRMED,
} from "../constants";
import { PublicKey } from "@solana/web3.js";
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
import swal from "sweetalert";

const storeGetter = (state: StoreType) => ({
  balance: state.balance,
  setBalance: state.setBalance,
  streamingMints: state.streamingMints,
  streams: state.streams,
  addStream: state.addStream,
  addStreamingMint: state.addStreamingMint,
  deleteStream: state.deleteStream,
  clearStreams: state.clearStreams,
  cluster: state.cluster,
  wallet: state.wallet,
  connection: state.connection(),
});

export default function StreamsList() {
  const {
    wallet,
    connection,
    setBalance,
    streams,
    addStream,
    addStreamingMint,
    deleteStream,
    clearStreams,
    cluster,
  } = useStore(storeGetter);

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

    //TODO: handle messy code later!
    connection
      ?.getProgramAccounts(new PublicKey(TIMELOCK_PROGRAM_ID), {
        filters: [
          {
            memcmp: {
              offset: TIMELOCK_STRUCT_OFFSET_SENDER, //sender offset
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
      })
      .then((accounts) => {
        console.log("accounts fetched from chain", accounts);
        for (let i = 0; i < accounts.length; i++) {
          let decoded = decode(accounts[i].account.data);
          console.log(
            accounts[i].pubkey.toBase58(),
            decode(accounts[i].account.data)
          );
          for (const prop in decoded) {
            console.log(
              prop,
              // @ts-ignore
              decoded[prop].toString()
              // @ts-ignore
            );
          }
          addStream(accounts[i].pubkey.toBase58(), decoded);
          addStreamingMint(decoded.mint.toString());
        }
      });
    connection
      ?.getProgramAccounts(new PublicKey(TIMELOCK_PROGRAM_ID), {
        filters: [
          {
            memcmp: {
              offset: TIMELOCK_STRUCT_OFFSET_RECIPIENT, //recipient offset
              // @ts-ignore
              bytes: wallet?.publicKey?.toBase58(),
            },
          },
        ],
      })
      .then((accounts) => {
        console.log("accounts fetched from chain", accounts);
        for (let i = 0; i < accounts.length; i++) {
          let decoded = decode(accounts[i].account.data);
          console.log(
            accounts[i].pubkey.toBase58(),
            decode(accounts[i].account.data)
          );
          for (const prop in decoded) {
            console.log(
              prop,
              // @ts-ignore
              decoded[prop].toString()
              // @ts-ignore
            );
          }
          addStream(accounts[i].pubkey.toBase58(), decoded);
          addStreamingMint(decoded.mint.toString());
        }
      });

    // for (const id in newStreams) {
    //   if (newStreams.hasOwnProperty(id)) {
    //     //first, the cleanup
    //     let pk = undefined;
    //     try {
    //       pk = new PublicKey(id);
    //     } catch (e: any) {
    //       toast.error(e.message + id);
    //       //removeStream(id, true);
    //     }
    //
    //     if (pk) {
    //       connection?.getAccountInfo(new PublicKey(id)).then((result) => {
    //         if (result?.data) {
    //           const d = decode(result.data);
    //           console.log("data fetched from chain: ", {
    //             magic: d.magic.toString(),
    //             start_time: d.start_time.toString(),
    //             end_time: d.end_time.toString(),
    //             deposited_amount: d.deposited_amount.toString(),
    //             total_amount: d.total_amount.toString(),
    //             period: d.period.toString(),
    //             cliff: d.cliff.toString(),
    //             cliff_amount: d.cliff_amount.toString(),
    //             created_at: d.created_at.toString(),
    //             withdrawn_amount: d.withdrawn_amount.toString(),
    //             cancel_time: d.cancel_time.toString(),
    //             sender: d.sender.toString(),
    //             sender_tokens: d.sender_tokens.toString(),
    //             recipient: d.recipient.toString(),
    //             recipient_tokens: d.recipient_tokens.toString(),
    //             mint: d.mint.toString(),
    //             escrow_tokens: d.escrow_tokens.toString(),
    //           });
    //
    //           addStream(id, decode(result.data.toString()));
    //addStreamingMint(decoded.mint);
    //         } else {
    //           if (id === streamID) {
    //             toast.error(ERR_NO_STREAM);
    //           }
    //         }
    //       });
    //     }
    //   }
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function withdrawStream(id: string) {
    if (connection === null || wallet === null || wallet.publicKey === null) {
      toast.error(ERR_NOT_CONNECTED);
      return;
    }
    //TODO: enable withdrawing arbitrary amount via UI
    const success = await sendTransaction(ProgramInstruction.Withdraw, {
      stream: new PublicKey(id),
      amount: new BN(0),
    } as WithdrawStreamData);
    if (success) {
      const newBalance = await connection.getBalance(
        wallet.publicKey,
        TX_FINALITY_CONFIRMED
      );
      const stream = await connection.getAccountInfo(
        new PublicKey(id),
        TX_FINALITY_CONFIRMED
      );

      let tokenAmount = 0;
      if (stream !== null) {
        const decoded = decode(stream.data);
        tokenAmount = decoded.withdrawn_amount.toNumber();
        addStream(id, decode(stream.data));
        addStreamingMint(decoded.mint.toString());
      }
      setBalance(newBalance + tokenAmount);
    }
  }

  async function cancelStream(id: string) {
    if (connection === null || wallet === null || wallet.publicKey === null) {
      toast.error(ERR_NOT_CONNECTED);
      return;
    }

    const success = await sendTransaction(ProgramInstruction.Cancel, {
      stream: new PublicKey(id),
    } as CancelStreamData);
    if (success) {
      const newBalance = await connection.getBalance(
        wallet.publicKey,
        TX_FINALITY_CONFIRMED
      );
      //const newWithdrawn = deposited_amount.toNumber() - (newBalance - oldBalance);
      const stream = await connection.getAccountInfo(
        new PublicKey(id),
        TX_FINALITY_CONFIRMED
      );

      let tokenAmount = 0;
      if (stream !== null) {
        const decoded = decode(stream.data);
        tokenAmount =
          decoded.deposited_amount.toNumber() -
          decoded.withdrawn_amount.toNumber();
        addStream(id, decode(stream.data));
        addStreamingMint(decoded.mint.toString());
      }
      setBalance(newBalance + tokenAmount);
    }
  }

  async function transferStream(id: string) {
    const input = await swal({
      title: "Transfer recipient:",
      content: {
        element: "input",
        attributes: {
          placeholder: "New recipient address",
          type: "text",
        },
      },
    });

    try {
      const newRecipient = new PublicKey(input);
      const success = await sendTransaction(
        ProgramInstruction.TransferRecipient,
        {
          stream: new PublicKey(id),
          new_recipient: new PublicKey(newRecipient),
        } as TransferStreamData
      );
      if (success) {
        toast.success("Stream transferred to " + input);
        deleteStream(id); //todo: let's keep it there, just as readonly.
      }
    } catch (e) {
      toast.error("Invalid address");
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
        onTransfer={() => transferStream(id)}
        id={id}
        data={data}
        myAddress={wallet?.publicKey?.toBase58() as string}
        removeStream={() => removeStream(id)}
      />
    ));
  return <>{entries}</>;
}
