import React from 'react'
import Button from '../Button'
import arrayMove from 'array-move'
import { connect } from 'react-redux'
import {
  sortableContainer,
  sortableElement,
  sortableHandle
} from 'react-sortable-hoc'
import {
  APP_PACKAGES_BY_CAPABILITY,
} from '../../graphql/queries'
import graphql from '../../graphql/client'
import {
  QueueIcon,
  DeleteIcon
} from '../icons'
import {
  DefinitionRenderer,
} from '../packageBlocks/components'
import InserterForm from '../packageBlocks/InserterForm'

const SortableContainer = sortableContainer(({ children }) => {
  return <ul className="border-b">{children}</ul>
})

const DragHandle = sortableHandle(() => (
  <div>
    <QueueIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
  </div>
))

const SortableItem = sortableElement(
  ({ object, deleteItem, _edit, _updatePackage, customRenderer }) => (
    <li>
      <div>

        <div key={`apps-${object.id}`}
          className="bg-gray-100 mb-2 p-4-- flex flex-col justify-between items-center">

          <div className="border-md bg-white p-3 shadow w-full mx-2 ">

            <div className="flex justify-between items-center">

              <div>
                <p className="text-xs leading-4 font-bold text-gray-700">
                  {object.name}
                </p>

                <p className="text-xs leading-6 font-medium text-gray-400">
                  {JSON.stringify(object.values)}
                </p>
              </div>

              <div className="flex justify-end items-center w-full">
                <div className="cursor-move">
                  <DragHandle />
                </div>
                <Button
                  className="h-10 w-10"
                  variant='icon'
                  size="small"
                  onClick={deleteItem}>
                  <DeleteIcon />
                </Button>
              </div>
            </div>

            {
              customRenderer &&
              object.type === 'internal' &&
              customRenderer(object)
            }

            { !customRenderer && <DefinitionRenderer
              schema={object.definitions}
              disabled={true}
              size="sm"
              // updatePackage={(params, cb) => updatePackage(params, object, cb)}
            />}
          </div>

        </div>
      </div>
    </li>
  )
)

function AppInserter ({
  app,
  update,
  capability,
  option,
  customRenderer,
  setEditable,
  location
}) {
  return (
    <div className="flex flex-col">
      <SidebarAppInserter
        app={app}
        location={location}
        update={update}
        option={option}
        capability={capability}
        customRenderer={customRenderer}
        setEditable={setEditable}
      />
    </div>
  )
}

function SidebarAppInserter ({
  app,
  update,
  option,
  capability,
  customRenderer,
  setEditable,
  location
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [items, setItems] = React.useState(app[option.namespace] || [])
  const [packages, setPackages] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  // support for internal plugins, just in case we want to add a
  // super high customization within the code
  const internalPackages = [
    // { type: 'internal', name: 'UserBlock' },
    // { type: 'internal', name: 'TagBlocks' },
    // { type: 'internal', name: 'ConversationBlock' },
    // { type: 'internal', name: 'AssigneeBlock' }
  ]

  function getPackages () {
    setLoading(true)
    graphql(APP_PACKAGES_BY_CAPABILITY, {
      appKey: app.key,
      kind: capability
    },
    {
      success: (data) => {
        setLoading(false)
        setPackages(
          internalPackages.concat(data.app.appPackagesCapabilities)
        )
      },
      error: () => {}
    })
  }

  React.useEffect(() => {
    if (isOpen) getPackages()
  }, [isOpen])

  React.useEffect(() => {
    if (option) setItems(app[option.namespace] || [])
  }, [option])

  function closeHandler () {
    setIsOpen(false)
  }

  function handleAdd (item) {
    setItems(items.concat(item))
    setIsOpen(false)
  }

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setItems(arrayMove(items, oldIndex, newIndex))
  }

  function deleteItem (item, index) {
    setItems(items.filter((o, i) => i !== index))
  }

  function handleSubmit (e) {
    e.preventDefault()
    const data = {
      app: {
        [option.n]: items
      }
    }
    update(data, () => {
      setEditable(false)
    })
  }

  return (
    <div className="">

      <div className="flex justify-between border-b border-gray-200 mt-3 pb-2">
        <div className="w-full flex justify-between">
          <Button
            variant={'outlined'}
            size="xs"
            onClick={ () => setEditable(false) }>
              cancel
          </Button>
          <Button
            size="xs"
            onClick={ handleSubmit }>
              done
          </Button>
        </div>
      </div>

      <div className="flex flex-col justify-around
        items-center border rounded-md my-2 py-2">
        <div>
          <h2 className="text-sm leading-6 font-medium text-gray-900">
            Add apps to inbox sidebar
          </h2>
        </div>

        <div className="flex justify-end my-2">
          <Button
            size="xs"
            variant={'success'}
            onClick={() => setIsOpen(true)}>
            Add app
          </Button>
        </div>
      </div>

      <InserterForm 
        isOpen={isOpen} 
        app={app} 
        closeHandler={closeHandler}
        handleAdd={handleAdd}
        packages={packages}
        loading={loading}
      />

      <div className="w-full">
        <SortableContainer
          onSortEnd={onSortEnd}
          useDragHandle>
          {items && items.map((o, index) => (
            <SortableItem
              key={`item-${index}`}
              index={index}
              value={o.id}
              object={o}
              customRenderer={customRenderer}
              // updatePackage={ (params, cb) => updatePackage(params, o, index, cb) }
              deleteItem={() => deleteItem(o, index)}
            />
          ))}
        </SortableContainer>

        {/* <Button
          onClick={handleSubmit}
          className="mt-5">
          Save changes
        </Button> */}
      </div>
    </div>
  )
}

function mapStateToProps (state) {
  const { app_user, app } = state
  return {
    app_user,
    app
  }
}

// export default ShowAppContainer
export const AppInserterInner = connect(mapStateToProps)(SidebarAppInserter)

export default connect(mapStateToProps)(AppInserter)
