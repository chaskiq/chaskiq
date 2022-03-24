import { connect } from 'react-redux';

import React, { Fragment, useState } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import { DotsVerticalIcon } from '@heroicons/react/solid';
import { useHotkeys } from 'react-hotkeys-hook';
import ErrorBoundary from '@chaskiq/components/src/components/ErrorBoundary';
import { getPackage } from '@chaskiq/components/src/components/packageBlocks/utils';
import { DefinitionRenderer } from '@chaskiq/components/src/components/packageBlocks/components';
import { Link } from 'react-router-dom';
import Tooltip from 'rc-tooltip';
import { IntegrationsIcon } from "@chaskiq/components/src/components/icons";
import { APP_PACKAGES_BY_CAPABILITY } from '@chaskiq/store/src/graphql/queries';
import graphql from '@chaskiq/store/src/graphql/client';

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

const categories = [
  {
    url: "/",
    label: "oeoe",
    icon: "https://logo.clearbit.com/spotify.com"
  }
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function PackageSlider({ fixedSlider, dispatch, app, current_user }) {
  const [open, setOpen] = useState(fixedSlider.open);
  const [providers, setProviders] = React.useState([]);

  useHotkeys('cmd+k', () => setOpen(!open));

  const object = {
    name: 'TwilioPhone',
    definitions: [
      {
        type: 'content',
      },
    ],
  };

  React.useEffect(() => {
    getAppPackages();
  }, []);

  function getAppPackages() {
    graphql(
      APP_PACKAGES_BY_CAPABILITY,
      {
        appKey: app.key,
        kind: "fixed_sidebar",
      },
      {
        success: (data) => {
          
          setProviders(data.app.appPackagesCapabilities);
        },
        error: () => {},
      }
    );
  }


  return (

    <React.Fragment>

        {!open && <div
          className={`md:block 
          bg-gray-100 dark:bg-black
          text-purple-lighter 
          flex-none w-23 
          p-2 
          border-r border-gray-300 dark:border-gray-800 border-l`}
        >
          <div className="cursor-pointer mb-4">
            <div className="bg-white h-10 w-10 flex items-center justify-center text-black text-2xl font-semibold rounded-lg mb-1 overflow-hidden">
              <Tooltip
                  placement="right"
                  overlay={"go to app packages"}
                >
                <Link to={`/apps/${app.key}/integrations`}>
                  {<IntegrationsIcon/>}
                </Link>
              </Tooltip>
            </div>
          </div>

          <div className="overflow-y-auto h-full">
            {providers.map((o) => (
              <Tooltip
                key={`sidebar-categories-${o.id}`}
                placement="right"
                overlay={o.name}
              >
                <button
                  onClick={()=> setOpen(true)}
                  aria-label={o.name}
                  className="text-gray-700 dark:text-white
                  rounded-md flex 
                  justify-center 
                  cursor-pointer bg-gray-50 dark:bg-black
                  hover:bg-gray-100 dark:hover:bg-gray-800 
                  h-10 w-full 
                  items-center 
                  text-2xl font-semibold 
                  my-5 overflow-hidden"
                >
                  <img src={o.icon} height={20} width={20}/>
                </button>
              </Tooltip>
            ))}
          </div>
        </div>}

     
        {open && <div className="pointer-events-auto w-screen max-w-md">
          <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {' '}
                  Team{' '}
                </h3>
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

            {app && <AppItem app={app} object={object} app_user={current_user} />}

          </div>
        </div>}
    </React.Fragment>
    
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
      // return window.open(packageParams.field.action.url);
      return window.open(
        packageParams.field.action.url,
        'win',
        packageParams.field.action.options
      );
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
