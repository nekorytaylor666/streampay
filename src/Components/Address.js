import {copyToClipboard} from "../utils/helpers";
import {DuplicateIcon, CheckIcon} from "@heroicons/react/outline";
import {useState} from "react";

export default function Address(props: { address: string, className: string }) {
    const {address, className} = props;
    const iconClassName = "h-4 inline mr-1 cursor-pointer hover:opacity-80 align-text-bottom ";
    const [copied, setCopied] = useState(false)

    function copy() {
        copyToClipboard(address);
        setCopied(true);
        setTimeout(() => {
            setCopied(false)
        }, 1000)
    }

    return (
        <span className={"block truncate " + className}>
            {copied
                ? (<span className="text-green-300 mr-1"><CheckIcon className={iconClassName}/><small>Copied!</small></span>)
                : <DuplicateIcon className={iconClassName} onClick={copy}/>}
            {address}</span>
    )
}


