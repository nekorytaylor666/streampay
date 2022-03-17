import { IcnLogo } from "../assets/icons";

const DesktopMode = () => (
  <div className="flex flex-col justify-center items-center sm:hidden p-6">
    <IcnLogo fill="rgb(113, 130, 152)" classes="w-14 h-14 mt-10 bg-gray-dark rounded-lg" />
    <h3 className="text-white font-bold mb-2 mt-5">Resize to Desktop Mode</h3>
    <p className="text-p2 text-gray-light text-center">
      Please resize your screen or use desktop mode to view your streams until fully responsive
      Streamflow version is released.
    </p>
  </div>
);

export default DesktopMode;
