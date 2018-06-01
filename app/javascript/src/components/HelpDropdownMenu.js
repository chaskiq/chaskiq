import React from 'react';
import AkDropdownMenu from '@atlaskit/dropdown-menu';
import { AkGlobalItem } from '@atlaskit/navigation';
import HelpIcon from '@atlaskit/icon/glyph/question-circle';

export default (
  <AkDropdownMenu
    appearance="tall"
    items={[
      {
        heading: 'Help',
        items: [
          { content: 'Documentation' },
          { content: 'Learn Git' },
          { content: 'Keyboard shortcuts' },
          { content: 'Bitbucket tutorials' },
          { content: 'API' },
          { content: 'Support' },
        ],
      },
    ]}
    position="right bottom"
  >
    <AkGlobalItem>
      <HelpIcon label="Help icon" />
    </AkGlobalItem>
  </AkDropdownMenu>
);
