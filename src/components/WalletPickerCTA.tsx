import { FC, useRef } from "react";

import { WalletPicker, ModalRef, Button } from ".";

interface WalletPickerProps {
  classes: string;
  title: string;
}

const WalletPickerCTA: FC<WalletPickerProps> = ({ title, classes }) => {
  const walletPickerRef = useRef<ModalRef>(null);

  // useEffect(() => {
  //   if (walletType) return;

  //   const type = localStorage.walletType;
  //   if (!type || type === "undefined") return;

  //   const restoredWalletType = walletTypes.find((w) => w.name === type);
  //   if (restoredWalletType) {
  //     setWalletType(restoredWalletType);

  //     trackEvent(
  //       EVENT_CATEGORY.WALLET,
  //       EVENT_ACTION.CONNECTED,
  //       // localStorage.wallet?.publicKey?.toBase58(),
  //       EVENT_LABEL.NONE,
  //       0
  //     );
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <>
      <Button primary classes={classes} onClick={() => walletPickerRef?.current?.show()}>
        {title}
      </Button>
      <WalletPicker ref={walletPickerRef} />
    </>
  );
};

export default WalletPickerCTA;
