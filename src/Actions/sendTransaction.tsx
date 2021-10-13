import {toast} from "react-toastify";
import {Connection, Keypair, PublicKey} from "@solana/web3.js";
import ToastrLink from "../Components/ToastrLink";
import Wallet from "@project-serum/sol-wallet-adapter";
import {ERR_NOT_CONNECTED, ProgramInstruction, TX_FINALITY_FINALIZED,} from "../constants";
import {getExplorerLink} from "../utils/helpers";
// @ts-ignore
import Timelock from "@timelock/timelock"

export default async function sendTransaction(
    instruction: ProgramInstruction,
    connection: Connection,
    wallet: Wallet,
    stream: PublicKey,
    data: any,
    newStreamAccount?: Keypair,
) {
    try {
        if (!wallet.publicKey) {
            throw ERR_NOT_CONNECTED;
        }

        toast.info("Please confirm transaction in your wallet.");
        let tx;
        switch (instruction) {
            case ProgramInstruction.Create:
                const {recipient, mint, deposited_amount, start_time, end_time, period, cliff, cliff_amount} = data;
                // @ts-ignore
                tx = await Timelock.create(connection, wallet, newStreamAccount, recipient, mint, deposited_amount, start_time, end_time, period, cliff, cliff_amount)
                break;
            case ProgramInstruction.Withdraw:
                // @ts-ignore
                tx = await Timelock.withdraw(connection, wallet, stream, data)
                break;
            case ProgramInstruction.Cancel:
                // @ts-ignore
                tx = await Timelock.cancel(connection, wallet, stream)
                break;
            case ProgramInstruction.TransferRecipient:
                // @ts-ignore
                tx = await Timelock.transferRecipient(connection, wallet, stream, data)
                break;
        }
        // toast.dismiss();
        // toast.info("Submitted transaction. Awaiting confirmation...");
        const url = getExplorerLink("tx", tx);//todo print transaction here.
        toast.dismiss();
        toast.success(
            <ToastrLink
                url={url}
                urlText="View on explorer"
                nonUrlText={
                    `Transaction ${connection.commitment}!` +
                    (connection.commitment !== TX_FINALITY_FINALIZED
                        ? " Please allow it few seconds to finalize."
                        : "")
                }
            />,
            {autoClose: 15000, closeOnClick: true}
        );
        return true;
    } catch (e: any) {
        console.warn(e);
        //todo log these errors somewhere for our reference
        toast.error("Error: " + e.message);
        return false;
    }
}
