import { connect } from 'react-redux';

import React, { Fragment, useState } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import { DotsVerticalIcon } from '@heroicons/react/solid';
import { useHotkeys } from 'react-hotkeys-hook';
import ErrorBoundary from '@chaskiq/components/src/components/ErrorBoundary';
import { getPackage } from '@chaskiq/components/src/components/packageBlocks/utils';
import { DefinitionRenderer } from '@chaskiq/components/src/components/packageBlocks/components';

const tabs = [
  { name: 'All', href: '#', current: true },
  { name: 'Online', href: '#', current: false },
  { name: 'Offline', href: '#', current: false },
];
const team = [
  {
    name: 'Leslie Alexander',
    handle: 'lesliealexander',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online',
  },
  {
    name: 'Leslie Alexander',
    handle: 'lesliealexander',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'online',
  },
  // More people...
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function PackageSlider({ fixedSlider, dispatch, app, current_user }) {
  const [open, setOpen] = useState(fixedSlider.open);

  useHotkeys('cmd+k', () => setOpen(!open));

  const object = {
    name: 'TwilioPhone',
    definitions: [
      {
        type: 'content',
      },
    ],
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="--fixed inset-0 overflow-hidden"
        onClose={() => console.log('olii')}
      >
        <div className="-absolute inset-0 overflow-hidden">
          {/*<Dialog.Overlay className="absolute inset-0" />*/}

          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        {' '}
                        Team{' '}
                      </Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500"
                          onClick={() => setOpen(false)}
                        >
                          <span className="sr-only">Close panel</span>
                          <XIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="border-b border-gray-200">
                    <div className="px-6">
                      <nav
                        className="-mb-px flex space-x-6"
                        x-descriptions="Tab component"
                      >
                        {tabs.map((tab, i) => (
                          <a
                            key={`${tab.name} ${i}`}
                            href={tab.href}
                            className={classNames(
                              tab.current
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                              'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm'
                            )}
                          >
                            {tab.name}
                          </a>
                        ))}
                      </nav>
                    </div>
                  </div>

                  <AppItem app={app} object={object} app_user={current_user} />

                  <ul
                    role="list"
                    className="flex-1 divide-y divide-gray-200 overflow-y-auto"
                  >
                    {team.map((person) => (
                      <li key={person.handle}>
                        <div className="group relative flex items-center py-6 px-5">
                          <a
                            href={person.href}
                            className="-m-1 block flex-1 p-1"
                          >
                            <div
                              className="absolute inset-0 group-hover:bg-gray-50"
                              aria-hidden="true"
                            />
                            <div className="relative flex min-w-0 flex-1 items-center">
                              <span className="relative inline-block flex-shrink-0">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={person.imageUrl}
                                  alt=""
                                />
                                <span
                                  className={classNames(
                                    person.status === 'online'
                                      ? 'bg-green-400'
                                      : 'bg-gray-300',
                                    'absolute top-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white'
                                  )}
                                  aria-hidden="true"
                                />
                              </span>
                              <div className="ml-4 truncate">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {person.name}
                                </p>
                                <p className="truncate text-sm text-gray-500">
                                  {'@' + person.handle}
                                </p>
                              </div>
                            </div>
                          </a>
                          <Menu
                            as="div"
                            className="relative ml-2 inline-block flex-shrink-0 text-left"
                          >
                            <Menu.Button className="group relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                              <span className="sr-only">Open options menu</span>
                              <span className="flex h-full w-full items-center justify-center rounded-full">
                                <DotsVerticalIcon
                                  className="h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                  aria-hidden="true"
                                />
                              </span>
                            </Menu.Button>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <Menu.Items className="absolute top-0 right-9 z-10 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                  <Menu.Item>
                                    {({ active }) => (
                                      <a
                                        href="#"
                                        className={classNames(
                                          active
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-700',
                                          'block px-4 py-2 text-sm'
                                        )}
                                      >
                                        View profile
                                      </a>
                                    )}
                                  </Menu.Item>
                                  <Menu.Item>
                                    {({ active }) => (
                                      <a
                                        href="#"
                                        className={classNames(
                                          active
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-700',
                                          'block px-4 py-2 text-sm'
                                        )}
                                      >
                                        Send message
                                      </a>
                                    )}
                                  </Menu.Item>
                                </div>
                              </Menu.Items>
                            </Transition>
                          </Menu>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function AppItem({ app, object, app_user }) {
  const pkg = object;
  const [definitions, setDefinitions] = React.useState(object.definitions);

  function updatePackage(packageParams, cb) {
    /* if (packageParams.field.action.type === 'frame') {
      return displayAppBlockFrame({
        message: {},
        data: {
          field: packageParams.field,
          location: packageParams.location,
          id: pkg.name,
          appKey: app.key,
          values: { ...pkg.values, ...packageParams.values }
        }
      })
    } */

    if (packageParams.field.action.type === 'url') {
      return window.open(packageParams.field.action.url);
    }

    const params = {
      id: pkg.name,
      appKey: app.key,
      hooKind: packageParams.field.action.type,
      ctx: {
        field: packageParams.field,
        values: packageParams.values,
      },
    };
    getPackage(params, 'fixed_sidebar', (data) => {
      const defs = data.app.appPackage.callHook.definitions;
      setDefinitions(defs);
      cb && cb();
    });
  }

  return (
    <ErrorBoundary>
      <div className="rounded-md border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 w-full p-2--">
        <p className="hidden text-sm leading-5 font-medium text-gray-900 dark:text-gray-100">
          {object.name}
        </p>

        <DefinitionRenderer
          schema={definitions}
          size="sm"
          appPackage={object}
          location={'fixed_sidebar'}
          // disabled={true}
          updatePackage={updatePackage}
        />
      </div>
    </ErrorBoundary>
  );
}

function mapStateToProps(state) {
  const { fixedSlider, app, current_user } = state;

  return {
    app,
    current_user,
    fixedSlider,
  };
}

export default connect(mapStateToProps)(PackageSlider);
