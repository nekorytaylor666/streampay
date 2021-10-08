import { web3, Program, Provider, Idl } from "@project-serum/anchor";
import idl from "../idl/timelock";

const programId = new web3.PublicKey(
  "5djoymgGTPSAZwR7XcEJzvhwoT2ZK98BEhJkjbHxfXeC"
);

const program = (provider: Provider) =>
  new Program(idl as Idl, programId, provider);

export default program;
