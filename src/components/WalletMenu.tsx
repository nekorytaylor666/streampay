import { FC, Dispatch, SetStateAction, useEffect } from "react";

import { ChevronDownIcon } from "@heroicons/react/solid";
import { Cluster } from "@streamflow/stream";
import { Menu } from "@headlessui/react";
import { DuplicateIcon } from "@heroicons/react/outline";

import { abbreviateAddress, copyToClipboard } from "../utils/helpers";
import { getTokenAccounts, sortTokenAccounts } from "../utils/helpers";
import Toggle from "./Toggle";
import useStore, { StoreType } from "../stores";
import Link from "../components/Link";

interface WalletMenuProps {
  clusterChange?: Dispatch<SetStateAction<any>>;
}

const storeGetter = (state: StoreType) => ({
  cluster: state.cluster,
  connection: state.connection(),
  wallet: state.wallet,
  disconnectWallet: state.disconnectWallet,
  setMyTokenAccounts: state.setMyTokenAccounts,
  setMyTokenAccountsSorted: state.setMyTokenAccountsSorted,
  setToken: state.setToken,
});

const WalletMenu: FC<WalletMenuProps> = ({ clusterChange }) => {
  const {
    wallet,
    cluster,
    disconnectWallet,
    connection,
    setMyTokenAccounts,
    setMyTokenAccountsSorted,
    setToken,
  } = useStore(storeGetter);
  const isDevnet = cluster === Cluster.Devnet;

  const walletAddressFormatted = wallet?.publicKey ? abbreviateAddress(wallet?.publicKey) : "";

  const walletPubKey = wallet?.publicKey ? wallet?.publicKey.toBase58() : "";

  function copy() {
    copyToClipboard(walletPubKey);
  }

  useEffect(() => {
    (async () => {
      const myTokenAccounts = await getTokenAccounts(connection!, wallet!, cluster);
      const myTokenAccountsSorted = sortTokenAccounts(myTokenAccounts);

      setMyTokenAccounts(myTokenAccounts);
      setMyTokenAccountsSorted(myTokenAccountsSorted);
      setToken(myTokenAccountsSorted[0]);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, connection, cluster]);

  return (
    <div className="flex bg-gray-dark rounded-lg items-center">
      <div className="flex font-bold items-center text-white text-left text-sm relative">
        <div className="w-12 pr-2"></div>
        <DuplicateIcon
          className="h-4 inline mr-1 align-text-bottom hover:opacity-60 cursor-pointer"
          onClick={copy}
        />
        <div>
          <p className="font-bold text-sm text-white">{walletAddressFormatted}</p>
        </div>
      </div>

      <div className="relative ">
        <Menu>
          {({ open }) => (
            <>
              <Menu.Button
                className={`cursor-pointer default-transition h-12 w-12 px-2 focus:outline-none`}
              >
                <ChevronDownIcon
                  className={`${
                    open ? "transform rotate-180" : "transform rotate-360"
                  } default-transition h-5 m-auto ml-1 text-primary-light fill-[#718298] w-5`}
                />
              </Menu.Button>
              <Menu.Items className="absolute bg-gray-dark border border-[#445264] p-2 right-0 top-14 shadow-md outline-none rounded-md w-48 z-20">
                <>
                  <Menu.Item key={"documentation"}>
                    <div className="flex h-9 items-center p-2 w-full">
                      <Link
                        url="https://docs.streamflow.finance/"
                        title={"Documentation"}
                        classes="col-span-4 sm:col-span-3 text-white font-bold text-sm"
                      />
                    </div>
                  </Menu.Item>
                  <Menu.Item key={"twitter"}>
                    <div className="flex h-9 items-center p-2 w-full">
                      <Link
                        url="https://twitter.com/streamflow_fi"
                        title={"Twitter"}
                        classes="col-span-4 sm:col-span-3 text-white font-bold text-sm"
                      />
                    </div>
                  </Menu.Item>
                  <Menu.Item key={"discord"}>
                    <div className="flex h-9 items-center p-2 w-full">
                      <Link
                        url="https://discord.com/invite/9yyr8UBZjr"
                        title={"Join Our Discord"}
                        classes="col-span-4 sm:col-span-3 text-white font-bold text-sm"
                      />
                    </div>
                  </Menu.Item>
                  <hr className={`border border-[#445264] opacity-50 mt-2 mb-2`}></hr>
                  <Menu.Item key={"disconnect"} onClick={disconnectWallet}>
                    <button className="flex default-transition h-9 items-center p-2 w-full hover:bg-gray-dark hover:cursor-pointer hover:rounded font-normal focus:outline-none">
                      <span className="text-sm font-bold text-red">Disconnect Wallet</span>
                    </button>
                  </Menu.Item>
                  <Menu.Item key={"devnet"} onClick={clusterChange}>
                    <div className="flex h-9 items-center p-2 w-full">
                      <span className="text-sm text-white">Devnet</span>
                      <Toggle
                        checked={isDevnet}
                        customChange={clusterChange}
                        classes="hidden sm:flex mr-2 ml-5"
                      />
                    </div>
                  </Menu.Item>
                </>
              </Menu.Items>
            </>
          )}
        </Menu>
      </div>
    </div>
  );
};

export default WalletMenu;
