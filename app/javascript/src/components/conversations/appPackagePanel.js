import React from 'react'
import FormDialog from '../../components/FormDialog'
import Button from '../../components/Button'
import Progress from '../../components/Progress'
import ErrorBoundary from '../../components/ErrorBoundary'

import { connect } from 'react-redux'
import graphql from '../../graphql/client'
import {
  DefinitionRenderer
} from '../packageBlocks/components'
import {
  APP_PACKAGES_BY_CAPABILITY
} from '../../graphql/queries'
import {
  getPackage
} from '../packageBlocks/utils'
import { AppList } from '../packageBlocks/AppList'


function AppPackagePanel (props) {
  const [open, setOpen] = React.useState(props.open)
  const [loading, setLoading] = React.useState(null)
  const [provider, setProvider] = React.useState(null)
  const [providers, setProviders] = React.useState([])
  //const [values, setValues] = React.useState({})
  const [contentSchema, setContentSchema] = React.useState(null)

  function getAppPackages () {
    setLoading(true)
    graphql(APP_PACKAGES_BY_CAPABILITY, {
      appKey: props.app.key,
      kind: props.kind || 'conversations'
    },
    {
      success: (data) => {
        setLoading(false)
        setProviders(data.app.appPackagesCapabilities)
      },
      error: () => {
        setLoading(false)
      }
    })
  }

  React.useEffect(() => {
    getAppPackages()
  }, [])

  React.useEffect(() => {
    setOpen(props.open)
  }, [props.open])

  function handleClose () {
    setOpen(false)
    props.close()
  }

  function handleAdd (data) {
    setProvider(data)
  }

  function handleSend () {
    const newData = {
      name: provider.name,
      schema: provider.definitions,
      wait_for_input: provider.wait_for_input
    }

    props.insertComment({
      provider: newData,
      values: provider.values
    })
  }

  return (
    <FormDialog
      open={open}
      handleClose={handleClose}
      titleContent={'Send App Package'}
      formComponent={
        <div className="overflow-auto h-64">

          <ErrorBoundary>

            {
              !provider &&
                <AppList
                  handleAdd={handleAdd}
                  packages={providers}
                  app={props.app}
                  location={props.kind}
                  conversation={props.conversation}
                />
            }

            {
              loading && <Progress/>
            }

            {
              provider && <div className="p-4 border shadow flex flex-col">

                <div className="mt-1 flex justify-between items-baseline md:block lg:flex">
                  <div className="inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 md:mt-2 lg:mt-0">
                    <svg className="-ml-1 mr-0.5 flex-shrink-0 self-center h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>
                      Preview
                    </span>
                  </div>
                </div>

                <DefinitionRenderer
                  schema={contentSchema || provider.definitions}
                  location={props.location}
                  updatePackage={(data, cb) => {
                    // check only if content kind!
                    if (data.field.action.type !== 'content') { return }

                    const params = {
                      id: provider.name,
                      appKey: props.app.key,
                      hooKind: data.field.action.type,
                      ctx: {
                        conversation_key: props.conversation.key,
                        field: data.field,
                        definitions: [data.field.action],
                        location: props.kind,
                        values: data.values
                      }
                    }

                    getPackage(params, 'conversartion', (d) => {
                      setContentSchema(d.app.appPackage.callHook.definitions)
                    })
                    cb()
                  }}
                />
              </div>
            }
          </ErrorBoundary>
        </div>
      }
      dialogButtons={
        <React.Fragment>
          <Button onClick={handleClose}
            variant="outlined" className="ml-2">
            Cancel
          </Button>

          { provider &&
            <Button
              variant={'success'}
              onClick={handleSend}>
              Send App
            </Button>
          }
        </React.Fragment>
      }
    />
  )
}

function mapStateToProps (state) {
  const { app_user, app, conversation } = state
  return {
    app_user,
    app,
    conversation
  }
}

export default connect(mapStateToProps)(AppPackagePanel)
