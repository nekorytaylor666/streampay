import BufferLayout from "buffer-layout";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { u64 } from "@solana/spl-token";
import { getUnixTime } from "date-fns";
import swal from "sweetalert";
import useStore from "../Stores";
import { StreamStatus } from "../types";

export function getExplorerLink(type: string, id: string): string {
  return `https://explorer.solana.com/${type}/${id}?cluster=${useStore
    .getState()
    .explorerUrl()}`;
}

//todo: add cancelled
export function getStreamStatus(start: number, end: number, now: number)  {
  if (now < start) {
    return StreamStatus.scheduled;
  } else if (now < end) {
    return StreamStatus.streaming;
  } else {
    return StreamStatus.complete;
  }
}

export function _swal(): Promise<void> {
  return swal({ text: "Are you sure?", icon: "warning", buttons: [true] });
}

export function copyToClipboard(value: string): void {
  const el = document.createElement("textarea");
  el.value = value;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

export function streamCreated(id: string) {
  const url = window.location.origin + "#" + id;
  swal({
    buttons: ["Copy Stream URL"],
    icon: "success",
    title: "Stream created!",
    //sweet alert accepts pure HTML Node, so some wrapping must be done https://sweetalert.js.org/guides/#using-dom-nodes-as-content
    content: {
      element: "a",
      attributes: {
        className: "text-primary block truncate max-w-full",
        href: url,
        target: "_blank",
        innerHTML: url,
      },
    },
  }).then((clicked) => {
    if (clicked) {
      copyToClipboard(url);
      swal("Link copied to clipboard!", "Send it to the recipient!", "success");
    }
  });
}
