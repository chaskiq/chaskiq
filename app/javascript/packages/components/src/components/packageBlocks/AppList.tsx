import React from 'react';
import List, {
  ListItem,
  ListItemText,
  ItemListPrimaryContent,
  ItemListSecondaryContent,
} from '../List';

import { LeftArrow } from '../icons';

import { BaseInserter } from './baseInserter';

import Button from '../Button';

import Progress from '../Progress';

import I18n from '../../../../../src/shared/FakeI18n';

interface IAppList {
  location: string;
  loading?: boolean;
  handleAdd: (data: any) => void;
  packages: any;
  app: any;
  conversation?: any;
  conversation_part?: any;
}

export function AppList({
  handleAdd,
  packages,
  app,
  loading,
  conversation,
  conversation_part,
  location,
}: IAppList) {
  const [selected, setSelected] = React.useState(null);

  function handleSelect(o) {
    setSelected(o);
  }

  function handleInsert(data) {
    handleAdd(data);
  }

  return (
    <div>
      {loading && <Progress />}

      {!loading && (
        <List>
          {!selected &&
            packages.map((o) => (
              <ListItem key={o.name}>
                <ListItemText
                  primary={
                    <ItemListPrimaryContent>{o.name}</ItemListPrimaryContent>
                  }
                  secondary={
                    <ItemListSecondaryContent>
                      {o.description}
                    </ItemListSecondaryContent>
                  }
                  terciary={
                    <React.Fragment>
                      <div
                        className="mt-2 flex items-center
                        text-sm leading-5 text-gray-500 justify-end"
                      >
                        <Button
                          data-cy={`add-package-${o.name}`}
                          onClick={(_e) => handleSelect(o)}
                        >
                          {I18n.t('common.add')}
                        </Button>
                      </div>
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))}
        </List>
      )}

      {selected && (
        <div>
          <Button
            variant={'link'}
            size={'xs'}
            onClick={() => setSelected(null)}
          >
            <LeftArrow />
            {'back'}
          </Button>

          <BaseInserter
            onItemSelect={handleAdd}
            pkg={selected}
            app={app}
            location={location}
            onInitialize={handleInsert}
            conversation={conversation}
            conversation_part={conversation_part}
          />
        </div>
      )}
    </div>
  );
}
