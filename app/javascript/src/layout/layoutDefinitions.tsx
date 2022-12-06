import React from 'react';
import {
  BlockIcon,
  BotIcon,
  CampaignsIcon,
  ChartsIcons,
  ChatIcon,
  DashboardIcon,
  HelpCenterIcon,
  PlatformIcon,
} from '@chaskiq/components/src/components/icons';
import icon from '../images/favicon.png';
import { allowedAccessTo } from '@chaskiq/components/src/components/AccessDenied';
import I18n from '../shared/FakeI18n';

export default function definitions() {
  return {
    companyLogo: icon,
    verticalSidebar: {
      display: true,
      itemClass: `text-gray-700 dark:text-white rounded-md flex  justify-center  cursor-pointer bg-gray-50 dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800  h-10 w-full  items-center  text-2xl font-semibold  my-5 overflow-hidden`,
      displayLabel: false,
      displayTooltip: true,
    },
    // in case the horizontalSidebar a topPadding is needed along with the screen height
    // check the tailwind css config  generalHeight & generalTop
    horizontalMenu: {
      display: false,
      displayLabel: true,
      displayTooltip: false,
      menuLeft: [
        //{
        //  title: 'lalal',
        //  icon: icon,
        //  href: '/sssk',
        //  key: 'aaa',
        //},
        //{
        //  title: 'oooero',
        //  icon: icon,
        //  href: '/sssk',
        //  key: 'aaab',
        //},
      ],
      optionsForFilter: [
        {
          title: 'Create Contact',
          //description: 'Adds a lead or verified user',
          icon: <BlockIcon />,
          id: 'create-contact',
          state: 'create-contact',
          class:
            'text-sm py-2 px-4 rounded hover:bg-light dark:hover:bg-darkColor z-50',
        },
        {
          title: 'Create Contact',
          //description: 'Adds a lead or verified user',
          // icon: <BlockIcon/>,
          icon: <BlockIcon />,
          id: 'acreate-contact',
          state: 'create-contact',
          class:
            'text-sm py-2 px-4 rounded hover:bg-light dark:hover:bg-darkColor z-50',
        },
        {
          title: 'Create Contact',
          //description: 'Adds a lead or verified user',
          // icon: <BlockIcon/>,
          icon: <BlockIcon />,
          id: 'acreate-contactl',
          state: 'create-contact',
          class:
            'text-sm py-2 px-4 rounded hover:bg-light dark:hover:bg-darkColor z-50',
        },
        {
          title: 'Import CSV',
          //description: 'Imports CSV',
          // icon: <UnsubscribeIcon/>,
          icon: <BlockIcon />,
          id: 'import-csv',
          state: 'import-csv',
          class:
            'text-sm py-2 px-4 rounded hover:bg-light dark:hover:bg-darkColor z-50',
        },
      ],
    },
    categories: function (app) {
      return [
        {
          id: 'Dashboard',
          label: I18n.t('navigator.dashboard'),
          icon: <DashboardIcon />,
          url: `/apps/${app.key}`,
          allowed: true,
        },
        {
          id: 'Platform',
          label: I18n.t('navigator.platform'),
          icon: <PlatformIcon />,
          url: `/apps/${app.key}/segments/${
            app.segments.length > 0 ? app.segments[0].id : ''
          }`,
          allowed: allowedAccessTo(app, 'segments'),
        },
        {
          id: 'Conversations',
          label: I18n.t('navigator.conversations'),
          icon: <ChatIcon />,
          url: `/apps/${app.key}/conversations`,
          allowed: allowedAccessTo(app, 'conversations'),
        },
        {
          id: 'Campaigns',
          label: I18n.t('navigator.campaigns'),
          url: `/apps/${app.key}/campaigns`,
          icon: <CampaignsIcon />,
          allowed: allowedAccessTo(app, 'campaigns'),
        },

        {
          id: 'Bot',
          label: I18n.t('navigator.routing_bots'),
          icon: <BotIcon />,
          url: `/apps/${app.key}/bots/settings`,
          allowed: allowedAccessTo(app, 'bots'),
        },

        {
          label: I18n.t('navigator.help_center'),
          id: 'HelpCenter',
          icon: <HelpCenterIcon />,
          url: `/apps/${app.key}/articles`,
          allowed: allowedAccessTo(app, 'help_center'),
        },
        {
          id: 'Reports',
          label: 'Reports',
          icon: <ChartsIcons />,
          url: `/apps/${app.key}/reports`,
          allowed: allowedAccessTo(app, 'reports'),
        },
        {
          id: 'Settings',
          label: I18n.t('navigator.settings'),
          icon: (
            <svg
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
            >
              <path
                clipRule="evenodd"
                d="M5.944.5l-.086.437-.329 1.598a5.52 5.52 0 00-1.434.823L2.487 2.82l-.432-.133-.224.385L.724 4.923.5 5.31l.328.287 1.244 1.058c-.045.277-.103.55-.103.841 0 .291.058.565.103.842L.828 9.395.5 9.682l.224.386 1.107 1.85.224.387.432-.135 1.608-.537c.431.338.908.622 1.434.823l.329 1.598.086.437h3.111l.087-.437.328-1.598a5.524 5.524 0 001.434-.823l1.608.537.432.135.225-.386 1.106-1.851.225-.386-.329-.287-1.244-1.058c.046-.277.103-.55.103-.842 0-.29-.057-.564-.103-.841l1.244-1.058.329-.287-.225-.386-1.106-1.85-.225-.386-.432.134-1.608.537a5.52 5.52 0 00-1.434-.823L9.142.937 9.055.5H5.944z"
                stroke="currentColor"
                strokeLinecap="square"
                strokeLinejoin="round"
              ></path>
              <path
                clipRule="evenodd"
                d="M9.5 7.495a2 2 0 01-4 0 2 2 0 014 0z"
                stroke="currentColor"
                strokeLinecap="square"
                strokeLinejoin="round"
              ></path>
            </svg>
          ),
          url: `/apps/${app.key}/settings`,
          //children: app_settings_items(app, isActivePage),
          allowed: allowedAccessTo(app, 'app_settings'),
        },
      ];
    },
    mainSidebar: {
      displaySectionTitle: false,
      buttons: {
        activeClass: `text-brand hover:text-brand bg-gray-200 dark:bg-black`,
        defaultClass: `
        hover:text-gray-600 hover:bg-gray-100 
        dark:hover:text-gray-300 
        dark:hover:bg-black
        dark:text-gray-100 
        dark:focus:bg-black
        focus:bg-gray-200
        focus:outline-none 
        group 
        flex 
        items-center 
        px-2 py-2 
        text-sm leading-5 
        font-medium 
        text-gray-900 
        rounded-md transition ease-in-out duration-150`,
      },
    },
  };
}
