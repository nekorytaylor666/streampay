import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import BufferLayout from "buffer-layout";
import { INSTRUCTION_CREATE_STREAM } from "../constants";
import { StreamData } from "../utils/helpers";
import Wallet from "@project-serum/sol-wallet-adapter";
import useStore from "../Stores";
import program from "./program";
import { BN, web3, Provider, utils } from "@project-serum/anchor";
import { Wallet as AnchorWallet } from "@project-serum/anchor/src/provider";
import { createTokenAccountInstrs } from "@project-serum/common";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TokenAccount } from "../types";

export default async function _createStream(
  data: StreamData,
  connection: Connection,
  wallet: Wallet,
  pda: Keypair,
  tokenAccount: TokenAccount
) {
  const provider = new Provider(connection, wallet as AnchorWallet, {});
  const prg = program(provider);
  const { sender, receiver, amount, start, end } = data;
  const senderPK = new PublicKey(sender);
  const mint = new PublicKey(tokenAccount.token.address);
  let [pdaSigner, nonce] = await web3.PublicKey.findProgramAddress(
    [pda.publicKey.toBuffer()], //(Seeds can be anything but we decided those will be serialized pda's pubkey
    prg.programId
  );
  const pdaTokenAcc = Keypair.generate();
  const r = await prg.rpc.create(
    //order of the parameters must match the ones in program
    new PublicKey(receiver),
    new BN(amount),
    new BN(start),
    new BN(end),
    new BN(1),
    nonce,
    null,
    null,
    {
      accounts: {
        pda: pda.publicKey,
        pdaSigner,
        pdaTokenAcc: pdaTokenAcc.publicKey,
        depositorTokenAcc: tokenAccount.account,
        depositor: senderPK,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      },
      signers: [pda, pdaTokenAcc],
      instructions: [
        ...(await createTokenAccountInstrs(
          provider,
          pdaTokenAcc.publicKey,
          mint,
          pdaSigner
        )),
      ],
    }
  );
  debugger;
  return r;
}

function getCreateStreamInstruction(
  data: StreamData,
  pdaPub: PublicKey
): TransactionInstruction {
  const { sender, receiver } = data;

  return new TransactionInstruction({
    keys: [
      {
        pubkey: new PublicKey(sender),
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: new PublicKey(receiver), //recipient
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: pdaPub, //PDA used for data
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: SystemProgram.programId, //system program required to make a transfer
        isSigner: false,
        isWritable: false,
      },
    ],
    programId: new PublicKey(useStore.getState().programId as string),
    data: encodeInstructionData(data),
  });
}

function encodeInstructionData(data: StreamData) {
  const { amount, start, end } = data;
  // Packed as little endian
  const layout = BufferLayout.struct([
    BufferLayout.u8("instruction"),
    BufferLayout.ns64("start"),
    BufferLayout.ns64("end"),
    // N.B. JS Number has 53 significant bits, so numbers larger than
    // 2^53 can be misrepresented
    BufferLayout.nu64("amount"),
  ]);

  const encoded = Buffer.alloc(layout.span);
  layout.encode(
    {
      instruction: INSTRUCTION_CREATE_STREAM,
      start: start,
      end: end,
      // amount: Number.MAX_SAFE_INTEGER // limited to 2^53 - 1 = 9007199254740991
      amount: Math.trunc(amount * LAMPORTS_PER_SOL),
    },
    encoded
  );

  // UInt64 alternative is to remove the "amount" from layout encoding and
  // use the following code:
  // //encoded.writeBigUInt64LE(BigInt("18446744073709551615"), 9)

  return encoded;
}
