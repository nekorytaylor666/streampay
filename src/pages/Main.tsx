import { useState } from "react";

import NewStreamForm from "./NewStreamPage/NewStreamForm";
import VestingForm from "./VestingPage/VestingForm";

const Main = ({ page }: { page: "vesting" | "streams" }) => {
  const [loading, setLoading] = useState(false);
  const isVesting = page === "vesting";

  return (
    <div className="grid-cols-1 max-w-lg lg:gap-x-10 lg:grid-cols-2 lg:max-w-6xl pt-4 grid">
      {isVesting ? (
        <VestingForm loading={loading} setLoading={setLoading} />
      ) : (
        <NewStreamForm loading={loading} setLoading={setLoading} />
      )}
    </div>
  );
};

export default Main;
