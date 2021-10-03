import BufferLayout from "buffer-layout";
import { INSTRUCTION_CANCEL_STREAM } from "../constants";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { StreamData } from "../utils/helpers";
import sendTransaction from "./sendTransaction";
import Wallet from "@project-serum/sol-wallet-adapter";
import useStore from "../Stores";

export default async function _cancelStream(
  account_id: string,
  data: StreamData,
  connection: Connection,
  wallet: Wallet
) {
  const { sender, receiver } = data;
  const instruction = getCancelStreamInstruction(account_id, sender, receiver);
  const tx = new Transaction().add(instruction);
  return await sendTransaction(
    INSTRUCTION_CANCEL_STREAM,
    tx,
    connection,
    wallet
  );
}

function getCancelStreamInstruction(
  account_id: string,
  sender: string,
  receiver: string
) {
  return new TransactionInstruction({
    keys: [
      {
        pubkey: new PublicKey(sender),
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: new PublicKey(receiver),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: new PublicKey(account_id),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: new PublicKey(useStore.getState().programId as string),
    data: encodeInstructionData(),
  });
}

function encodeInstructionData() {
  const layout = BufferLayout.struct([BufferLayout.u8("instruction")]);
  const data = Buffer.alloc(layout.span);

  layout.encode({ instruction: INSTRUCTION_CANCEL_STREAM }, data);

  return data;
}
