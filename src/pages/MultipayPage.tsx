import { UploadIcon } from "@heroicons/react/outline";

import { Button } from "../components";

const MultipayPage = () => (
  <div className="mx-auto relative max-w-lg grid gap-2 xl:grid-cols-5 xl:max-w-2xl">
    <div
      className={`absolute text-blue bg-gray-900 opacity-60 top-0 bottom-0 left-0 right-0 z-10 block`}
    ></div>
    <Button
      classes=" px-8 py-4 col-span-5 block m-auto my-10 w-80"
      primary
      children={
        <span>
          Upload CSV <UploadIcon className="inline w-6" />
        </span>
      }
    />
    <div className="col-span-3">
      {/* <Recipient onChange={() => null} value="1337...c0de" /> */}
    </div>
    <div>
      <label htmlFor="amount" className="block font-medium text-gray-light">
        Amount
      </label>
      <input
        type="number"
        value={Math.floor(Math.random() * 666) / 10}
        className="mt-1 text-white bg-gray-dark border-blue block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
      />
    </div>
    <input
      value="reci...pient2"
      type="text"
      className="col-span-3 text-white bg-gray-dark border-blue block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
    />
    <select
      className="text-white bg-gray-dark border-blue block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
      defaultValue="SOL"
    >
      <option>SRM</option>
    </select>
    <input
      type="number"
      value={Math.floor(Math.random() * 666) / 10}
      className="text-white bg-gray-dark border-blue block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
    />
    <div className="text-white text-xl col-span-5 text-center">...</div>

    <input
      value="reci...pientN"
      type="text"
      className="col-span-3 text-white bg-gray-dark border-blue block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
    />
    <select
      className="text-white bg-gray-dark border-blue block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
      defaultValue="SOL"
    >
      <option>STRM</option>
    </select>
    <input
      type="number"
      value={Math.floor(Math.random() * 666) / 10}
      className="text-white bg-gray-dark border-blue block w-full border-black rounded-md focus:ring-secondary focus:border-secondary"
    />
  </div>
);

export default MultipayPage;
