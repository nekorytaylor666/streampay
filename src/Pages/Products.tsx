import { ClockIcon, UploadIcon } from "@heroicons/react/outline";
import { CheckCircleIcon } from "@heroicons/react/solid";

import { ButtonPrimary, Recipient } from "../Components";
import { PRODUCT_MULTIPAY, PRODUCT_MULTISIG, PRODUCT_STREAMS, PRODUCT_VESTING } from "../constants";
import { Main } from "./index";

export default function Products({ product }: { product: string }) {
  switch (product) {
    case PRODUCT_STREAMS:
    case PRODUCT_VESTING:
      return <Main />;
    case PRODUCT_MULTIPAY:
      return (
        <div className='mx-auto relative max-w-lg grid gap-2 xl:grid-cols-5 xl:max-w-2xl'>
          <div
            className={`absolute text-primary bg-gray-900 opacity-60 top-0 bottom-0 left-0 right-0 z-10 block`}
          ></div>
          <ButtonPrimary
            className=' px-8 py-4 col-span-5 block m-auto my-10 w-80'
            children={
              <span>
                Upload CSV <UploadIcon className='inline w-6' />
              </span>
            }
          />
          <div className='col-span-3'>
            <Recipient onChange={() => null} value='1337...c0de' />
          </div>
          <div>
            <label htmlFor='amount' className='block font-medium text-gray-100'>
              Amount
            </label>
            <input
              type='number'
              value={Math.floor(Math.random() * 666) / 10}
              className='mt-1 text-white bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary'
            />
          </div>
          <input
            value='reci...pient2'
            type='text'
            className='col-span-3 text-white bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary'
          />
          <select
            className='text-white bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary'
            defaultValue='SOL'
          >
            <option>SRM</option>
          </select>
          <input
            type='number'
            value={Math.floor(Math.random() * 666) / 10}
            className='text-white bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary'
          />
          <div className='text-white text-xl col-span-5 text-center'>...</div>

          <input
            value='reci...pientN'
            type='text'
            className='col-span-3 text-white bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary'
          />
          <select
            className='text-white bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary'
            defaultValue='SOL'
          >
            <option>STRM</option>
          </select>
          <input
            type='number'
            value={Math.floor(Math.random() * 666) / 10}
            className='text-white bg-gray-800 border-primary block w-full border-black rounded-md focus:ring-secondary focus:border-secondary'
          />
        </div>
      );
    case PRODUCT_MULTISIG:
      return (
        <div className='mx-auto relative max-w-lg xl:max-w-xl'>
          <div
            className={`absolute text-primary bg-gray-900 opacity-60 top-0 bottom-0 left-0 right-0 z-10 block`}
          ></div>
          <div className='text-white mb-4'>
            Treasury (<b>MyTr...easury</b>) sends 1 SOL to:
          </div>
          <div className='col-span-3'>
            <Recipient onChange={() => null} value='reci...pient' />
            <hr />
            <ul className='text-white mt-4'>
              <li>
                1. signature (<b>1337...code</b>) signed at {new Date().toLocaleString()}
                <CheckCircleIcon className='text-green-200 w-6 inline' />
              </li>
              <li>
                2. signature — WAITING <ClockIcon className='text-red-200 w-6 inline' />
              </li>
              <li>
                3. signature — WAITING <ClockIcon className='text-red-200 w-6 inline' />
              </li>
              <li>
                Execution — WAITING <ClockIcon className='text-red-200 w-6 inline' />
              </li>
              <br />
              <ButtonPrimary className='px-8 py-4'>Sign</ButtonPrimary>
            </ul>
          </div>
        </div>
      );
    default:
      return <div></div>;
  }
}
