import { FC } from "react";

import Button from "./Button";

const FallbackComponent: FC = () => (
  <div role="alert" className="flex justify-center items-center h-screen flex-col">
    <h2 className="text-gray-400">Error ocurred : (</h2>
    <Button primary onClick={() => window.location.reload()} classes="px-8 py-3 mt-4">
      Refresh the page
    </Button>
  </div>
);

export default FallbackComponent;
