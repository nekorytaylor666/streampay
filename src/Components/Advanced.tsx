import { useState } from 'react';

import { format } from 'date-fns';

export default function Advanced({
  visible,
  endDate,
  endTime,
  cliffDate,
  cliffTime,
  cliffAmount,
  timePeriod,
  timePeriodMultiplier,
  updateCliffDate,
  updateCliffTime,
  updateCliffAmount,
  updateTimePeriod,
  updateTimePeriodMultiplier,
}: {
  visible: boolean;
  amount: number;
  endDate: string;
  endTime: string;
  cliffDate: string;
  cliffTime: string;
  cliffAmount: number;
  timePeriod: number;
  timePeriodMultiplier: number;
  updateCliffDate: (value: string) => void;
  updateCliffTime: (value: string) => void;
  updateCliffAmount: (value: number) => void;
  updateTimePeriod: (value: number) => void;
  updateTimePeriodMultiplier: (value: number) => void;
}) {
  const inputClassName =
    'text-white text-bold p-0.5 ml-2 h-6 text-right bg-transparent border-primary border-0 border-b-2 inline focus:border-secondary focus:ring-0';
  const [s, setS] = useState(timePeriodMultiplier > 1 ? 's' : '');

  if (!endDate || !endTime) {
    return (
      <span hidden={!visible} className='text-white'>
        Please specify start and end time.
      </span>
    );
  }

  const lengthSeconds =
    (+new Date(endDate + 'T' + endTime) - +new Date(cliffDate + 'T' + cliffTime)) / 1000;
  const numPeriods = lengthSeconds / (timePeriodMultiplier * timePeriod);
  const releaseRate = (100 - cliffAmount) / (numPeriods > 1 ? numPeriods : 1);

  return (
    <div hidden={!visible} className='relative text-gray-400 -mx-2 p-2 rounded-md mt-4'>
      First
      <input
        required={visible}
        id='cliff_amount'
        name='cliff_amount'
        type='number'
        min={0}
        max={100}
        value={cliffAmount.toString()}
        onChange={(e) => updateCliffAmount(Number(e.target.value))}
        className={inputClassName + ' w-8'}
      />
      <small className='text-white'>%</small> released at
      <input
        required={visible}
        id='cliff_date'
        name='cliff_date'
        type='date'
        value={cliffDate}
        onChange={(e) => updateCliffDate(e.target.value)}
        className={inputClassName}
      />
      <input
        required={visible}
        id='cliff_time'
        name='cliff_time'
        type='time'
        value={cliffTime}
        onChange={(e) => updateCliffTime(e.target.value)}
        className={inputClassName}
      />
      <hr className='my-2 border-0' />
      and then{' '}
      <span className='text-white'>
        {releaseRate.toFixed(3)}
        <small>%</small>
      </span>{' '}
      released every
      <input
        type='number'
        min={1}
        value={timePeriodMultiplier.toString()}
        onChange={(e) => {
          updateTimePeriodMultiplier(Number(e.target.value));
          setS(Number(e.target.value) > 1 ? 's' : '');
        }}
        className={inputClassName + ' w-6'}
      />
      <select
        className={inputClassName + ' pr-7 pb-0 h-auto text-left'}
        value={timePeriod}
        onChange={(e) => updateTimePeriod(Number(e.target.value))}
      >
        <option value={1}>second{s}</option>
        <option value={60}>minute{s}</option>
        <option value={60 * 60}>hour{s}</option>
        <option value={60 * 60 * 24}>day{s}</option>
        <option value={60 * 60 * 7}>week{s}</option>
        {/*  imprecise */}
        <option value={60 * 60 * 24 * 30}>month{s}</option>
        <option value={60 * 60 * 24 * 365}>year{s}</option>
      </select>
      <hr className='my-2 border-0' />
      until{' '}
      <span className='text-white'>
        {format(new Date(endDate + 'T' + endTime), 'ccc do MMM, yy — HH:mm')}
      </span>
      {/*
      <br />
      <input
        type="checkbox"
        readOnly={true}
        checked={true}
        className="text-primary w-6 h-6 rounded-sm"
      />
     <span className="inline-block mt-4">Transferable</span>*/}
    </div>
  );
}
