import {toast} from "react-toastify";
import {Connection, Keypair, Transaction} from "@solana/web3.js";
import ToastrLink from "../Components/ToastrLink";
import Wallet from "@project-serum/sol-wallet-adapter";
import {INSTRUCTION_CREATE_STREAM} from "../constants/constants";
import {getExplorerLink} from "../utils/helpers";

export default async function sendTransaction(type: number, transaction: Transaction, connection: Connection, wallet: Wallet, network?: string, pda?: Keypair) {
    try {
        transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
        toast.info('Sending request to wallet...');
        transaction.feePayer = wallet.publicKey;

        if (type === INSTRUCTION_CREATE_STREAM) {
            transaction.partialSign(pda);
        }

        const signed = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signed.serialize());
        toast.info('Submitted transaction. Awaiting confirmation...', {autoClose:15000});

        // can use 'finalized' which gives 100% certainty, but requires much longer waiting.
        await connection.confirmTransaction(signature, 'finalized')
        const transactionUrl = getExplorerLink('tx', signature, network);
        toast.success(<ToastrLink
            url={transactionUrl}
            urlText="View on explorer"
            nonUrlText="Transaction finalized!"
        />, {autoClose: 20000, closeOnClick: false});
        return true;
    } catch (e) {
        console.warn(e);
        //todo log the error somewhere for our reference
        toast.error('Error: ' + e.message);
        return false;
    }
}