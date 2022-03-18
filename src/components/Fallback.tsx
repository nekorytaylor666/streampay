import { FC } from "react";

import Button from "./Button";

const FallbackComponent: FC = () => (
  <div role="alert" className="flex bg-dark justify-center items-center h-screen flex-col">
    <h2 className="text-gray-light">Error ocurred : (</h2>
    <Button
      background="blue"
      onClick={() => window.location.reload()}
      classes="px-8 py-3 mt-4 mx-auto"
      data-testid="refresh"
    >
      Refresh the page
    </Button>
  </div>
);

export default FallbackComponent;
