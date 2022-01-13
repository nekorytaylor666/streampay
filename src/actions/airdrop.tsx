import { BN, Program, Provider } from "@project-serum/anchor";
import { Wallet } from "@project-serum/anchor/src/provider";
import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { Idl } from "@project-serum/anchor/dist/cjs/idl";
import type { TransactionSignature } from "@solana/web3.js";

import airdrop from "../idl/airdrop";
import { AIRDROP_TEST_TOKEN } from "../constants";

const PROGRAM_ID = "HqDGZjaVRXJ9MGRQEw7qDc2rAr6iH1n1kAQdCZaCMfMZ";

function initProgram(connection: Connection, wallet: Wallet): Program {
  const provider = new Provider(connection, wallet, {});
  return new Program(airdrop as Idl, PROGRAM_ID, provider);
}

export async function initialize(
  connection: Connection,
  wallet: Wallet
): Promise<TransactionSignature> {
  const program = initProgram(connection, wallet);
  const airdropAccount = new Keypair();
  const mint = new PublicKey(AIRDROP_TEST_TOKEN);

  const assTokenAccount = (
    await connection?.getTokenAccountsByOwner(wallet?.publicKey as PublicKey, {
      mint: mint,
    })
  ).value[0].pubkey;

  const assAirdropTokAcc = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    airdropAccount.publicKey
  );

  const instr = Token.createAssociatedTokenAccountInstruction(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    assAirdropTokAcc,
    airdropAccount.publicKey,
    wallet?.publicKey as PublicKey
  );

  // console.log("program", program.programId.toString());
  // console.log("STRM token", assTokenAcc?.pubkey.toString());
  // console.log("airdrop account", airdropAccount.publicKey.toString());
  // console.log("wallet ", wallet?.publicKey?.toString());

  const tx = await program.rpc.initializeAirdrop(new BN(1000000 * 10 ** 9), new BN(100 * 10 ** 9), {
    accounts: {
      initializer: wallet?.publicKey,
      initializerDepositTokenAccount: assTokenAccount,
      airdropAccount: airdropAccount.publicKey,
      airdropTokenAccount: assAirdropTokAcc,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    signers: [airdropAccount],
    instructions: [instr],
  });

  return tx;
}

export async function getAirdrop(
  connection: Connection,
  wallet: Wallet
): Promise<TransactionSignature> {
  const mint = new PublicKey(AIRDROP_TEST_TOKEN);
  // @ts-ignore
  const airdropAccount = (
    await connection?.getProgramAccounts(new PublicKey(airdrop.metadata.address))
  )[0];

  const program = initProgram(connection, wallet);
  // @ts-ignore
  const assTokenAcc = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    wallet?.publicKey as PublicKey
  );

  // const [_pda] = await PublicKey.findProgramAddress(
  //   [Buffer.from(anchor.utils.bytes.utf8.encode("streamflow-airdrop"))],
  //   new PublicKey(airdrop.metadata.address)
  // );

  const result = await connection?.getProgramAccounts(program.programId);
  // @ts-ignore
  const pda = result[0].pubkey;
  const [_pda] = await PublicKey.findProgramAddress(
    [Buffer.from("streamflow-airdrop", "utf-8")],
    program.programId
  );
  // console.log("pda", pda.toString());
  // console.log("_pda", _pda.toString());
  const assAirdropTokAcc = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    pda
  );

  // console.log("program", program.programId.toString());
  // console.log("STRM token", assTokenAcc.toString());
  // console.log("airdrop account", airdropAccount.pubkey.toString());
  // console.log("wallet ", wallet?.publicKey?.toString());

  const tx = await program.rpc.getAirdrop({
    accounts: {
      taker: wallet?.publicKey,
      takerReceiveTokenAccount: assTokenAcc,
      airdropAccount: airdropAccount.pubkey,
      airdropTokenAccount: assAirdropTokAcc,
      mint,
      pdaAccount: _pda,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    },
  });
  return tx;
}

export async function cancel(
  connection: Connection,
  wallet: Wallet
): Promise<TransactionSignature> {
  const program = initProgram(connection, wallet);
  const mint = new PublicKey(AIRDROP_TEST_TOKEN);

  // @ts-ignore
  const airdropAccount = (
    await connection?.getProgramAccounts(new PublicKey(airdrop.metadata.address))
  )[0];
  // @ts-ignore
  const assTokenAcc = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    wallet?.publicKey as PublicKey
  );

  const result = await connection?.getProgramAccounts(program.programId);
  // @ts-ignore
  const pda = result[0].pubkey;

  const [_pda] = await PublicKey.findProgramAddress(
    [Buffer.from("streamflow-airdrop", "utf-8")],
    program.programId
  );

  const assAirdropTokAcc = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    pda
  );

  // console.log("wallet", wallet?.publicKey?.toString());
  // console.log("associated STRM token", assTokenAcc.toString());
  // console.log("airdrop account", airdropAccount.pubkey.toString());
  // console.log("pda", pda.toString());
  // console.log("_pda", _pda.toString());
  // console.log("program", program.programId.toString());

  const tx = await program.rpc.cancelAirdrop({
    accounts: {
      initializer: wallet?.publicKey,
      initializerDepositTokenAccount: assTokenAcc,
      pdaAccount: _pda,
      airdropAccount: airdropAccount.pubkey,
      airdropTokenAccount: assAirdropTokAcc,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });

  return tx;
}
