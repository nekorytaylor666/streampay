import { ClockIcon } from "@heroicons/react/outline";
import { CheckCircleIcon } from "@heroicons/react/solid";

import { Button } from "../components";

const MultisigPage = () => (
  <div className="mx-auto relative max-w-lg xl:max-w-xl">
    <div
      className={`absolute text-blue bg-gray-900 opacity-60 top-0 bottom-0 left-0 right-0 z-10 block`}
    ></div>
    <div className="text-white mb-4">
      Treasury (<b>MyTr...easury</b>) sends 1 SOL to:
    </div>
    <div className="col-span-3">
      {/* <Recipient onChange={() => null} value="reci...pient" /> */}
      <hr />
      <ul className="text-white mt-4">
        <li>
          1. signature (<b>1337...code</b>) signed at {new Date().toLocaleString()}
          <CheckCircleIcon className="text-green w-6 inline" />
        </li>
        <li>
          2. signature — WAITING <ClockIcon className="text-red-200 w-6 inline" />
        </li>
        <li>
          3. signature — WAITING <ClockIcon className="text-red-200 w-6 inline" />
        </li>
        <li>
          Execution — WAITING <ClockIcon className="text-red-200 w-6 inline" />
        </li>
        <br />
        <Button classes="px-8 py-4" data-testid="create-multisig">
          Sign
        </Button>
      </ul>
    </div>
  </div>
);

export default MultisigPage;
