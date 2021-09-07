import { useMemo, useEffect } from 'react'
import useStore from "../Stores"
import swal from "sweetalert"
import {
    getPhantomWallet,
    getSolflareWebWallet,
    getSolflareWallet,
    getSolletWallet,
} from "@solana/wallet-adapter-wallets"
import ButtonPrimary from "./ButtonPrimary"

const storeGetter = state => ({
    walletType: state.walletType,
    setWalletType: state.setWalletType,
    cluster: state.cluster,
})

const div = document.createElement('div')

const addWalletOption = (walletType: Object) => {
    const button = document.createElement('div')
    const p = document.createElement('p')
    const img = document.createElement('img')
    img.src = walletType.icon
    img.className = 'h-8 inline-block mr-4'
    p.innerHTML = walletType.name
    p.className = 'inline-block'
    button.className = 'border-primary border cursor-pointer mb-4 p-4 text-primary rounded-md'
    button.onclick = () => {
        swal.setActionValue({cancel: walletType})
        swal.close()
    }
    button.appendChild(img)
    button.appendChild(p)
    div.appendChild(button)
}

const pickWallet = (walletTypes: Array, setWalletType: Function) => {
    div.innerHTML = ''
    for (const w of walletTypes) {
        addWalletOption(w)
    }
    swal({buttons: {}, content: div, className: "bg-gray-800"})
        .then(setWalletType)
}

export default function SelectWalletType() {
    const {walletType, setWalletType, cluster} = useStore(storeGetter)
    const walletTypes = useMemo(() => [
            getPhantomWallet(),
            getSolflareWebWallet({ network: cluster }),
            getSolflareWallet(),
            getSolletWallet({ network: cluster }),
        ],
        [cluster]
    )

    useEffect(
        () => {
            const type = localStorage.walletType
            if (type) {
                const restoredWalletType = walletTypes.find(w => w.name === type)
                if (restoredWalletType) {
                    setWalletType(restoredWalletType)
                }
            }
        },
        [setWalletType, walletTypes]
    )
    return <ButtonPrimary
        className="font-bold text-2xl my-5"
        type="button"
        onClick={() => pickWallet(walletTypes, setWalletType)}
    >
        Connect
    </ButtonPrimary>
}
