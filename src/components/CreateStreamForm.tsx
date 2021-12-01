// import { useRef, useState } from "react";

// import "fs";
// import "buffer-layout";
// import { BN } from "@project-serum/anchor";
// import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
// import { getUnixTime } from "date-fns";
// import { toast } from "react-toastify";
// import { format } from "date-fns";

// import { formatPeriodOfTime } from "../utils/helpers";
// import sendTransaction from "../actions/sendTransaction";
// import {
//   ERR_NO_TOKEN_SELECTED,
//   ERR_NOT_CONNECTED,
//   ProgramInstruction,
//   TIME_SUFFIX,
// } from "../constants";
// import { useFormContext } from "../contexts/FormContext";
// import useStore, { StoreType } from "../stores";
// import { CreateStreamData } from "../types";
// import { getTokenAmount } from "../utils/helpers";

// const storeGetter = (state: StoreType) => ({
//   addStream: state.addStream,
//   connection: state.connection(),
//   wallet: state.wallet,
//   token: state.token,
//   setToken: state.setToken,
//   myTokenAccounts: state.myTokenAccounts,
//   setMyTokenAccounts: state.setMyTokenAccounts,
// });

// export default function CreateStreamForm({
//   setLoading,
// }: {
//   loading: boolean;
//   setLoading: (value: boolean) => void;
// }) {
//   const newStream = Keypair.generate();

//   const [advanced, setAdvanced] = useState(false);

//   const { connection, wallet, addStream, token, setToken, myTokenAccounts, setMyTokenAccounts } =
//     useStore(storeGetter);

//   const ticker = token?.info?.symbol ? token.info.symbol.toUpperCase() : "";

//   async function validate(element: HTMLFormElement): Promise<string> {
//     const { name, value } = element;
//     let start, end, cliff;
//     let msg = "invalid";
//     switch (name) {
//       case "start":
//         start = new Date(value + TIME_SUFFIX);
//         const now = new Date(new Date().toDateString());
//         msg = start < now ? "Cannot start the stream in the past." : "";
//         break;
//       case "start_time":
//         start = new Date(startDate + "T" + value);
//         msg = start < new Date() ? "Cannot start the stream in the past." : "";
//         break;
//       case "end":
//         msg =
//           new Date(value + TIME_SUFFIX) < new Date(startDate + TIME_SUFFIX)
//             ? "Umm... end date before the start date?"
//             : "";
//         break;
//       case "end_time":
//         start = new Date(startDate + "T" + startTime);
//         end = new Date(endDate + "T" + value);
//         msg = end < start ? "Err... end time before the start time?" : "";
//         break;
//       case "cliff_date":
//         start = new Date(startDate + TIME_SUFFIX);
//         cliff = new Date(value + TIME_SUFFIX);
//         end = new Date(endDate + TIME_SUFFIX);
//         msg =
//           advanced && (cliff < start || cliff > end)
//             ? "Cliff must be between start and end date."
//             : "";
//         break;
//       case "cliff_time":
//         start = new Date(startDate + "T" + startTime);
//         cliff = new Date(cliffDate + "T" + value);
//         end = new Date(endDate + "T" + endTime);
//         msg =
//           advanced && (cliff < start || cliff > end)
//             ? "Cliff must be between start and end date."
//             : "";
//         break;
//       case "amount":
//         msg = amount === 0 ? "Please enter amount larger than 0." : "";
//         break;
//       case "account":
//         let pubKey = null;
//         try {
//           pubKey = new PublicKey(value);
//         } catch {
//           msg = "Please enter a valid Solana wallet address.";
//           break;
//         }
//         const receiverAccount = await connection?.getAccountInfo(pubKey);
//         if (receiverAccount == null) {
//           msg = "";
//           break;
//         }
//         if (!receiverAccount.owner.equals(SystemProgram.programId)) {
//           msg = "Please enter a valid Solana wallet address";
//           break;
//         }
//         if (receiverAccount.executable) {
//           msg = "Recipient cannot be a program.";
//           break;
//         }
//         msg = "";
//         break;
//       default:
//         msg = "";
//         break;
//     }
//     return msg;
//   }

//   async function createStream(e: any) {
//     e.preventDefault();

//     if (!wallet?.publicKey || !connection) {
//       toast.error(ERR_NOT_CONNECTED);
//       return false;
//     }

//     if (!token) {
//       toast.error(ERR_NO_TOKEN_SELECTED);
//       return false;
//     }

//     const form = document.getElementById("form") as HTMLFormElement;

//     if (!form) {
//       return false;
//     }

//     for (let i = 0; i < form.elements.length; i++) {
//       const elem = form.elements[i] as HTMLObjectElement; //todo: this is not a valid type.
//       const errorMsg = await validate(form.elements[i] as HTMLFormElement);
//       if (errorMsg) {
//         elem.setCustomValidity(errorMsg);
//         elem.reportValidity();
//         elem.setCustomValidity("");
//         return false;
//       }
//     }

//     if (!form.checkValidity()) {
//       form.reportValidity();
//       return false;
//     }

//     const start = getUnixTime(new Date(startDate + "T" + startTime));
//     let end = getUnixTime(new Date(endDate + "T" + endTime));
//     // Make sure that end time is always AFTER start time
//     if (end === start) {
//       end = start + 1;
//     }

//     setLoading(true);

//     const data = {
//       deposited_amount: new BN(amount * 10 ** token.uiTokenAmount.decimals),
//       recipient: new PublicKey(receiver),
//       mint: new PublicKey(token.info.address),
//       start_time: new BN(start),
//       end_time: new BN(end),
//       period: new BN(advanced ? timePeriod * timePeriodMultiplier : 1),
//       cliff: new BN(advanced ? +new Date(cliffDate + "T" + cliffTime) / 1000 : start),
//       cliff_amount: new BN(
//         (advanced ? (cliffAmount / 100) * amount : 0) * 10 ** token.uiTokenAmount.decimals
//       ),
//       release_rate: new BN(0),
//       new_stream_keypair: newStream,
//       stream_name: subject,
//       cancelable_by_sender: senderCanCancel,
//       cancelable_by_recipient: recipientCanCancel,
//       transferable: ownershipTransferable,
//       withdrawal_public: false,
//     } as CreateStreamData;

//     const receiverAccount = await connection?.getAccountInfo(new PublicKey(receiver));

//     if (!receiverAccount) {
//       const shouldContinue = await modalRef?.current?.show();

//       if (!shouldContinue) {
//         setLoading(false);
//         return false;
//       }
//     }

//     const success = await sendTransaction(ProgramInstruction.Create, data);
//     setLoading(false);

//     if (success) {
//       addStream(newStream.publicKey.toBase58(), {
//         ...data,
//         closable_at: new BN(end),
//         last_withdrawn_at: new BN(0),
//         withdrawn_amount: new BN(0),
//         canceled_at: new BN(0),
//         created_at: new BN(+new Date() / 1000),
//         escrow_tokens: undefined as any,
//         magic: new BN(0),
//         recipient_tokens: undefined as any,
//         sender: wallet.publicKey,
//         sender_tokens: undefined as any,
//         total_amount: new BN(amount),
//       });

//       const mint = token.info.address;

//       const updatedTokenAmount = await getTokenAmount(connection, wallet, mint);
//       setMyTokenAccounts({
//         ...myTokenAccounts,
//         [mint]: { ...myTokenAccounts[mint], uiTokenAmount: updatedTokenAmount },
//       });
//       setToken({ ...token, uiTokenAmount: updatedTokenAmount });
//     }
//   }

//   // const updateStartTime = (startTime: string) => {
//   //   setStartTime(startTime);
//   //   setCliffTime(startTime);
//   // };

//   return (
//     <form onSubmit={createStream} id="form" className="mb-0 lg:mb-11">
//       <div className="col-span-full">
//         <p className="text-gray-400 pt-2 mt-4 text-sm leading-6">
//           <b className="font-bold block">Overview:</b>
//           First
//           <span className="text-white text-sm">
//             {` ${cliffAmount}% (${(((amount || 0) * cliffAmount) / 100).toFixed(2)} ${ticker}) `}
//           </span>
//           <br className="sm:hidden" />
//           released on
//           <span className="text-white text-sm">{` ${cliffDate} `}</span>at
//           <span className="text-white text-sm">{` ${cliffTime}`}</span>.
//         </p>
//         <p className="text-gray-400 text-sm leading-6 sm:inline-block">
//           And then
//           <span className="text-white text-sm">{` ${releaseRate.toFixed(3)}% (${(
//             (amount || 0) * releaseRate
//           ).toFixed(2)} ${ticker}) `}</span>
//           <br className="sm:hidden" />
//           released every
//           <span className="text-white text-sm">{` ${formatPeriodOfTime(
//             timePeriod * timePeriodMultiplier
//           )} `}</span>
//           <br />
//           until
//           <span className="text-white text-sm">{` ${format(
//             new Date(endDate + "T" + endTime),
//             "ccc do MMM, yyyy - HH:mm"
//           )}`}</span>
//           .
//         </p>
//       </div>
//     </form>
//   );
// }

export default {};
