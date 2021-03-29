import React from 'react'
import List, {
  ListItem,
  ListItemText,
  ItemListPrimaryContent,
  ItemListSecondaryContent
} from '../../components/List'

import {
  LeftArrow,
} from '../../components/icons'

import {
  BaseInserter
} from './components'
import Button from '../../components/Button'

import Progress from '../Progress'


export function AppList ({
  handleAdd,
  packages,
  app,
  loading,
  conversation,
  location
}) {
  const [selected, setSelected] = React.useState(null)

  function handleSelect (o) {
    setSelected(o)
  }

  function handleInsert (data) {
    handleAdd(data)
  }

  return (

    <div>

      {
        loading && <Progress/>
      }

      { !loading &&
        <List>
          {
            !selected && packages.map((o) => (
              <ListItem key={o.name}>

                <ListItemText
                  primary={
                    <ItemListPrimaryContent variant="h5">
                      {o.name}
                    </ItemListPrimaryContent>
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

                        <Button onClick={(_e) => handleSelect(o)}>
                          Add
                        </Button>

                      </div>
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))
          }
        </List>
      }

      {
        selected && <div>
          <Button
            variant={'link'}
            size={'xs'}
            onClick={() => setSelected(null)}>
            <LeftArrow/>
            {'back'}
          </Button>

          <BaseInserter
            onItemSelect={handleAdd}
            pkg={selected}
            app={app}
            location={location}
            onInitialize={handleInsert}
            conversation={conversation}
          />
        </div>
      }
    </div>
  )
}