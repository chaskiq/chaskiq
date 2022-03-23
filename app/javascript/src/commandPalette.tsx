import React, { Fragment, useState } from 'react';
import { Combobox, Dialog, Transition } from '@headlessui/react';
import { SearchIcon } from '@heroicons/react/solid';
import {
  ExclamationIcon,
  FolderIcon,
  SupportIcon,
} from '@heroicons/react/outline';

const projects = [
  {
    id: 1,
    name: 'Workflow Inc. / Website Redesign',
    category: 'Projects',
    url: '#',
  },
  // More projects...
];

const users = [
  {
    id: 1,
    name: 'Leslie Alexander',
    url: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  // More users...
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Example() {
  const [open, setOpen] = useState(true);
  const [rawQuery, setRawQuery] = useState('');

  const query = rawQuery.toLowerCase().replace(/^[#>]/, '');

  const filteredProjects =
    rawQuery === '#'
      ? projects
      : query === '' || rawQuery.startsWith('>')
      ? []
      : projects.filter((project) =>
          project.name.toLowerCase().includes(query)
        );

  const filteredUsers =
    rawQuery === '>'
      ? users
      : query === '' || rawQuery.startsWith('#')
      ? []
      : users.filter((user) => user.name.toLowerCase().includes(query));

  return (
    <Transition.Root
      show={open}
      as={Fragment}
      afterLeave={() => setRawQuery('')}
    >
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20"
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Combobox
            as="div"
            className="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all"
            onChange={(item) => (window.location = item.url)}
          >
            <div className="relative">
              <SearchIcon
                className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              <Combobox.Input
                className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-800 placeholder-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Search..."
                onChange={(event) => setRawQuery(event.target.value)}
              />
            </div>

            {(filteredProjects.length > 0 || filteredUsers.length > 0) && (
              <Combobox.Options
                static
                className="max-h-80 scroll-py-10 scroll-py-10 scroll-pb-2 scroll-pb-2 space-y-4 overflow-y-auto p-4 pb-2"
              >
                {filteredProjects.length > 0 && (
                  <li>
                    <h2 className="text-xs font-semibold text-gray-900">
                      Projects
                    </h2>
                    <ul className="-mx-4 mt-2 text-sm text-gray-700">
                      {filteredProjects.map((project) => (
                        <Combobox.Option
                          key={project.id}
                          value={project}
                          className={({ active }) =>
                            classNames(
                              'flex cursor-default select-none items-center px-4 py-2',
                              active && 'bg-indigo-600 text-white'
                            )
                          }
                        >
                          {({ active }) => (
                            <>
                              <FolderIcon
                                className={classNames(
                                  'h-6 w-6 flex-none',
                                  active ? 'text-white' : 'text-gray-400'
                                )}
                                aria-hidden="true"
                              />
                              <span className="ml-3 flex-auto truncate">
                                {project.name}
                              </span>
                            </>
                          )}
                        </Combobox.Option>
                      ))}
                    </ul>
                  </li>
                )}
                {filteredUsers.length > 0 && (
                  <li>
                    <h2 className="text-xs font-semibold text-gray-900">
                      Users
                    </h2>
                    <ul className="-mx-4 mt-2 text-sm text-gray-700">
                      {filteredUsers.map((user) => (
                        <Combobox.Option
                          key={user.id}
                          value={user}
                          className={({ active }) =>
                            classNames(
                              'flex cursor-default select-none items-center px-4 py-2',
                              active && 'bg-indigo-600 text-white'
                            )
                          }
                        >
                          <img
                            src={user.imageUrl}
                            alt=""
                            className="h-6 w-6 flex-none rounded-full"
                          />
                          <span className="ml-3 flex-auto truncate">
                            {user.name}
                          </span>
                        </Combobox.Option>
                      ))}
                    </ul>
                  </li>
                )}
              </Combobox.Options>
            )}

            {rawQuery === '?' && (
              <div className="py-14 px-6 text-center text-sm sm:px-14">
                <SupportIcon
                  className="mx-auto h-6 w-6 text-gray-400"
                  aria-hidden="true"
                />
                <p className="mt-4 font-semibold text-gray-900">
                  Help with searching
                </p>
                <p className="mt-2 text-gray-500">
                  Use this tool to quickly search for users and projects across
                  our entire platform. You can also use the search modifiers
                  found in the footer below to limit the results to just users
                  or projects.
                </p>
              </div>
            )}

            {query !== '' &&
              rawQuery !== '?' &&
              filteredProjects.length === 0 &&
              filteredUsers.length === 0 && (
                <div className="py-14 px-6 text-center text-sm sm:px-14">
                  <ExclamationIcon
                    className="mx-auto h-6 w-6 text-gray-400"
                    aria-hidden="true"
                  />
                  <p className="mt-4 font-semibold text-gray-900">
                    No results found
                  </p>
                  <p className="mt-2 text-gray-500">
                    We couldn’t find anything with that term. Please try again.
                  </p>
                </div>
              )}

            <div className="flex flex-wrap items-center bg-gray-50 py-2.5 px-4 text-xs text-gray-700">
              Type{' '}
              <kbd
                className={classNames(
                  'mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
                  rawQuery.startsWith('#')
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-gray-400 text-gray-900'
                )}
              >
                #
              </kbd>{' '}
              <span className="sm:hidden">for projects,</span>
              <span className="hidden sm:inline">to access projects,</span>
              <kbd
                className={classNames(
                  'mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
                  rawQuery.startsWith('>')
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-gray-400 text-gray-900'
                )}
              >
                &gt;
              </kbd>{' '}
              for users, and{' '}
              <kbd
                className={classNames(
                  'mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2',
                  rawQuery === '?'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-gray-400 text-gray-900'
                )}
              >
                ?
              </kbd>{' '}
              for help.
            </div>
          </Combobox>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  );
}
