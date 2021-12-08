// import * as anchor from "@project-serum/anchor";
import { BN, Program, Provider } from "@project-serum/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { Idl } from "@project-serum/anchor/dist/cjs/idl";

import airdrop from "../idl/airdrop";
// import { Airdrop } from "../types/airdrop";
import useStore from "../stores";
import { AIRDROP_TEST_TOKEN } from "../constants";

function initProgram(): Program {
  const connection = useStore.getState().connection();
  const wallet = useStore.getState().wallet;
  const programId = airdrop.metadata.address;
  // @ts-ignore
  const provider = new Provider(connection, wallet, {});
  return new Program(airdrop as Idl, programId, provider);
}

export async function initialize() {
  const program = initProgram();
  const airdropAccount = new Keypair();
  const mint = new PublicKey(AIRDROP_TEST_TOKEN);
  const connection = useStore.getState().connection();
  const wallet = useStore.getState().wallet;

  const result = await connection?.getTokenAccountsByOwner(wallet?.publicKey as PublicKey, {
    mint: mint,
  });

  const assTokenAcc = result?.value[0];

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

  console.log("program", program.programId.toString());
  console.log("STRM token", assTokenAcc?.pubkey.toString());
  console.log("airdrop account", airdropAccount.publicKey.toString());
  console.log("wallet ", wallet?.publicKey?.toString());
  // (new Token(connection, wallet?.publicKey, )).createAssociatedTokenAccount()

  let tx;
  try {
    tx = await program.rpc.initializeAirdrop(new BN(1000000 * 10 ** 9), new BN(10000 * 10 ** 9), {
      accounts: {
        initializer: wallet?.publicKey,
        initializerDepositTokenAccount: assTokenAcc?.pubkey,
        airdropAccount: airdropAccount.publicKey,
        airdropTokenAccount: assAirdropTokAcc,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [airdropAccount],
      instructions: [instr],
    });
    console.log("hehe", tx);
  } catch (e) {
    console.log(e);
  }

  return tx;
}

export async function getAirdrop() {
  const mint = new PublicKey(AIRDROP_TEST_TOKEN);
  const connection = useStore.getState().connection();
  const wallet = useStore.getState().wallet;
  // @ts-ignore
  const airdropAccount = (
    await connection?.getProgramAccounts(new PublicKey(airdrop.metadata.address))
  )[0];

  const program = initProgram();
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
  console.log("pda", pda.toString());
  console.log("_pda", _pda.toString());
  const assAirdropTokAcc = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    pda
  );

  console.log("program", program.programId.toString());
  console.log("STRM token", assTokenAcc.toString());
  console.log("airdrop account", airdropAccount.pubkey.toString());
  console.log("wallet ", wallet?.publicKey?.toString());

  try {
    await program.rpc.getAirdrop({
      accounts: {
        taker: wallet?.publicKey,
        takerReceiveTokenAccount: assTokenAcc,
        airdropAccount: airdropAccount.pubkey,
        airdropTokenAccount: assAirdropTokAcc,
        pdaAccount: _pda,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });
  } catch (e) {
    console.log(e);
  }
}

export async function cancel() {
  const mint = new PublicKey(AIRDROP_TEST_TOKEN);
  const connection = useStore.getState().connection();
  const wallet = useStore.getState().wallet;
  // @ts-ignore
  const airdropAccount = (
    await connection?.getProgramAccounts(new PublicKey(airdrop.metadata.address))
  )[0];

  const program = initProgram();
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

  const assAirdropTokAcc = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mint,
    pda
  );

  await program.rpc.cancelAirdrop({
    accounts: {
      initializer: wallet?.publicKey,
      initializerDepositTokenAccount: assTokenAcc,
      pdaAccount: pda,
      airdropAccount: airdropAccount.pubkey,
      airdropTokenAccount: assAirdropTokAcc,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });
}
