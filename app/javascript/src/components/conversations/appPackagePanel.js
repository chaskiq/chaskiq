import React from 'react'
import FormDialog from '../../components/FormDialog'
import Button from '../../components/Button'
import Progress from '../../components/Progress'
import ErrorBoundary from '../../components/ErrorBoundary'

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import graphql from '../../graphql/client'
import {
  DefinitionRenderer
} from '../packageBlocks/components'
import { AppList } from '../../pages/settings/AppInserter'
import {
  APP_PACKAGES_BY_CAPABILITY
} from '../../graphql/queries'

function AppPackagePanel (props) {
  const [open, setOpen] = React.useState(props.open)
  const [loading, setLoading] = React.useState(null)
  const [provider, setProvider] = React.useState(null)
  const [providers, setProviders] = React.useState([])
  const [values, setValues] = React.useState({})

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
                  conversation={props.conversation}
                />
            }

            {
              loading && <Progress/>
            }

            {
              provider && <div className="p-4 border shadow flex flex-col">
                <p>preview</p>
                <DefinitionRenderer
                  schema={provider.definitions}
                  // updatePackage={(data, cb)=>{ debugger ; cb() }}
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

export default withRouter(connect(mapStateToProps)(AppPackagePanel))
