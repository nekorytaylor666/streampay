import { BN } from '@project-serum/anchor';
import swal from 'sweetalert';

import useStore from '../Stores';
import { StreamStatus } from '../types';

export function getExplorerLink(type: string, id: string): string {
  return `https://explorer.solana.com/${type}/${id}?cluster=${useStore.getState().explorerUrl()}`;
}

//todo: add canceled
export function getStreamStatus(start: BN, end: BN, now: BN): StreamStatus {
  if (now.cmp(start) === -1) {
    return StreamStatus.scheduled;
  } else if (now.cmp(end) === -1) {
    return StreamStatus.streaming;
  } else {
    return StreamStatus.complete;
  }
}

export function _swal(): Promise<void> {
  return swal({
    dangerMode: true,
    text: 'Are you sure?',
    icon: 'warning',
    buttons: { cancel: true, confirm: true },
  });
}

export function copyToClipboard(value: string): void {
  const el = document.createElement('textarea');
  el.value = value;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

// export function streamCreated(id: string) {
// const url = window.location.origin + "#" + id;
// swal({
//   buttons: { confirm: { text: "Copy Stream URL" } },
//   icon: "success",
//   title: "Stream created!",
//   //sweet alert accepts pure HTML Node, so some wrapping must be done https://sweetalert.js.org/guides/#using-dom-nodes-as-content
//   content: {
//     element: "a",
//     attributes: {
//       className: "text-primary block truncate max-w-full",
//       href: url,
//       target: "_blank",
//       innerHTML: url,
//     },
//   },
// }).then((clicked) => {
//   if (clicked) {
//     copyToClipboard(url);
//     swal("Link copied to clipboard!", "Send it to the recipient!", "success");
//   }
// });
// }
