/* This example requires Tailwind CSS v2.0+ */
import { Dispatch, SetStateAction } from 'react';

import { Switch } from '@headlessui/react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Toggle({
  enabled,
  label,
  setEnabled,
}: {
  enabled: boolean;
  label: string;
  setEnabled: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Switch.Group as='div' className='flex items-center'>
      <Switch.Label as='span' className='mr-3'>
        <span className='text-white'>{label}</span>
      </Switch.Label>
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className={classNames(
          enabled ? 'bg-primary' : 'bg-gray-900',
          'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 ring-1 ring-primary focus:outline-none focus:ring-2 focus:ring-secondary',
        )}
      >
        <span
          aria-hidden='true'
          className={classNames(
            enabled ? 'translate-x-5' : 'translate-x-0',

            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200',
          )}
        />
      </Switch>
    </Switch.Group>
  );
}
