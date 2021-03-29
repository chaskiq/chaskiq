import React from 'react'
import FormDialog from '../../components/FormDialog'
import Button from '../../components/Button'
import ErrorBoundary from '../../components/ErrorBoundary'

import arrayMove from 'array-move'


import { connect } from 'react-redux'

import {
  sortableContainer,
  sortableElement,
  sortableHandle
} from 'react-sortable-hoc'



import {
  APP_PACKAGES_BY_CAPABILITY
} from '../../graphql/queries'
import graphql from '../../graphql/client'
import {
  QueueIcon,
  DeleteIcon
} from '../../components/icons'

import {
  DefinitionRenderer,
} from '../../components/packageBlocks/components'

import {
  AppList,
} from '../../components/packageBlocks/AppList'


const SortableContainer = sortableContainer(({ children }) => {
  return <ul className="border-b">{children}</ul>
})

const DragHandle = sortableHandle(() => (
  <div>
    <QueueIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
  </div>
))

const SortableItem = sortableElement(
  ({ object, deleteItem, _edit, _updatePackage }) => (
    <li>
      <div>

        <div key={`apps-${object.id}`}
          className="bg-gray-100 mb-2 p-4 flex justify-between items-center">

          <div className="border-md bg-white p-4 shadow w-full mx-2 ">
            <p>{object.name}</p>

            <DefinitionRenderer
              schema={object.definitions}
              disabled={true}
              // updatePackage={(params, cb) => updatePackage(params, object, cb)}
            />
          </div>

          <div className="flex flex-col items-center">
            <div className="mb-2 cursor-move">
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
      </div>
    </li>
  )
)

function AppInserter ({ app, update }) {
  const options = [
    {
      name: 'users',
      namespace: 'userHomeApps',
      n: 'user_home_apps',
      classes: 'rounded-l-lg'
    },
    {
      name: 'visitors',
      namespace: 'visitorHomeApps',
      n: 'visitor_home_apps',
      classes: 'rounded-r-lg'
    }
  ]

  const [option, setOption] = React.useState(options[0])

  const activeClass = 'bg-indigo-600 text-gray-100 border-indigo-600 pointer-events-none'

  function handleClick (o) {
    setOption(o)
  }

  return (
    <div className="flex flex-col">
      <div className="inline-flex mt-4">
        {
          options.map((o, i) => (
            <button onClick={(_e) => handleClick(o)}
              key={`tabtab-${i}`}
              className={
                `${option.name === o.name ? activeClass : ''}
                
                focus:outline-none 
                focus:shadow-outline-gray 

                outline-none border bg-white
                font-light py-2 px-4
                ${o.classes}
                `}>
              {o.name}
            </button>
          ))
        }
      </div>

      <HomeAppInserter
        app={app}
        update={update}
        option={option}
        capability={'home'}
      />
    </div>
  )
}

function HomeAppInserter ({ app, update, option, capability }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [items, setItems] = React.useState(app[option.namespace] || [])
  const [packages, setPackages] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  function getPackages () {
    setLoading(true)
    graphql(APP_PACKAGES_BY_CAPABILITY, {
      appKey: app.key,
      kind: capability
    },
    {
      success: (data) => {
        setLoading(false)
        setPackages(data.app.appPackagesCapabilities)
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
    update(data)
  }

  return (
    <div className="my-4">

      <div className="flex justify-around items-center">
        <div>
          <h2 className="text-lg leading-6 font-medium text-gray-900">
            Add apps to your Messenger
          </h2>

          <p>Help your customers before they start a conversation</p>
        </div>

        <div className="flex justify-end my-8">
          <Button
            variant={'success'}
            onClick={() => setIsOpen(true)}>
            Add app
          </Button>
        </div>
      </div>

      <div>
        {isOpen && (
          <FormDialog
            open={isOpen}
            handleClose={closeHandler}
            titleContent={'Add apps to chat home'}
            formComponent={
              <div className="h-64 overflow-auto">

                <ErrorBoundary>
                  <AppList
                    location={'home'}
                    loading={loading}
                    handleAdd={handleAdd}
                    packages={packages}
                    app={app}
                  />
                </ErrorBoundary>

              </div>
            }
            dialogButtons={
              <React.Fragment>

                {/* <Button onClick={deleteHandler} className="ml-2" variant="danger">
                {I18n.t('common.delete')}
              </Button> */}
                <Button onClick={closeHandler} variant="outlined">
                  {I18n.t('common.cancel')}
                </Button>
              </React.Fragment>
            }
          ></FormDialog>
        )}
      </div>

      <div className="w-2/4">
        <SortableContainer onSortEnd={onSortEnd} useDragHandle>
          {items && items.map((o, index) => (
            <SortableItem
              key={`item-${index}`}
              index={index}
              value={o.id}
              object={o}
              // updatePackage={ (params, cb) => updatePackage(params, o, index, cb) }
              deleteItem={() => deleteItem(o, index)}
            />
          ))}
        </SortableContainer>

        <Button
          onClick={handleSubmit}
          size="md"
          variant={'success'}
          className="mt-5">
          {I18n.t('common.save')}
        </Button>
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
export const AppInserterInner = connect(mapStateToProps)(HomeAppInserter)

export default connect(mapStateToProps)(AppInserter)
