import React from 'react';
import { BlockIcon } from '@chaskiq/components/src/components/icons';
import icon from '../images/favicon.png';

export default function definitions() {
  return {
    companyLogo: icon,
    verticalSidebar: false,
    screenHeight: 'calc(92vh)',
    horizontalSidebar: true,
    menuLeft: [
      {
        title: 'lalal',
        icon: icon,
        href: '/sssk',
        key: 'aaa',
      },
      {
        title: 'oooero',
        icon: icon,
        href: '/sssk',
        key: 'aaab',
      },
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
  };
}
