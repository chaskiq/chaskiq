import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment, useEffect, useRef, useState } from 'react';

export default function Example({
  options,
  label = 'Options',
  icon,
  filterHandler,
}) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-md bg-opacity-20 hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
          <span className={'mr-1'}>{label}</span> {icon}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-1 py-1">
            {options.map((item) => (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => filterHandler(item)}
                    className={`${
                      active ? 'bg-violet-500 text-gray-600' : 'text-gray-900'
                    } group flex items-center w-full px-2 py-2 text-sm hover:bg-gray-200`}
                  >
                    <span>{item.name}</span>
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
