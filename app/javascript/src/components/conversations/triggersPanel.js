import React from 'react'
import FormDialog from '../../components/FormDialog'
import Button from '../../components/Button'
import Input from '../../components/forms/Input'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import graphql from '../../graphql/client'
import { BOT_TASKS } from '../../graphql/queries'

// TODO:

// check mode, conversations for users get user bot 
// tasks while visitors got lead bot tasks

function TriggersPanel (props) {
  const [open, setOpen] = React.useState(props.open)
  const [provider, setProvider] = React.useState(null)
  const [providers, setProviders] = React.useState([])
  const [values, setValues] = React.useState({})

  function getAppPackages () {
    graphql(
      BOT_TASKS,
      {
        appKey: props.app.key,
        lang: 'es',
        mode: 'users'
      },
      {
        success: (data) => {
          setProviders(data.app.botTasks)
        },
        error: () => {
          debugger
        }
      }
    )
  }

  React.useEffect(() => {
    getAppPackages()
  }, [])

  React.useEffect(() => {
    setOpen(props.open)
  }, [props.open])

  function handleClickOpen () {
    setOpen(true)
  }

  function handleClose () {
    setOpen(false)
    props.close()
  }

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value })
  }

  function renderItem (o) {
    return (
      <div>
        <p variant="h3">{o.title}</p>
      </div>
    )
  }

  function handleClick (o) {
    setProvider(o)
  }

  function handleSend () {
    const newData = Object.assign({},
      provider,
      provider.editorDefinitions
    )
    props.insertComment({
      provider: newData,
      values: values
    })
  }

  return (
    <FormDialog
      open={open}
      handleClose={handleClose}
      titleContent={'Start a Bot Task'}
      formComponent={
        <div>
          {
            providers.map((o) => {
              return <div
                key={`triggerable-${o.id}`}
                className="m-1">
                <Button
                  variant={'outlined'}
                  key={ `${o.id}-tab` }
                  onClick={() => handleClick(o)}>
                  {o.title}
                </Button>
              </div>
            })
          }

          {
            providers.length === 0 && <p>no tasks available</p>
          }

          {
            provider && renderItem(provider)
          }
        </div>
      }
      dialogButtons={
        <React.Fragment>
          <Button onClick={handleClose}
            variant="outlined" className="ml-2">
            Cancel
          </Button>

          <Button
            onClick={handleSend}>
            Send
          </Button>
        </React.Fragment>
      }
    />
  )
}

function mapStateToProps (state) {
  const { app_user, app } = state
  return {
    app_user,
    app
  }
}

export default withRouter(connect(mapStateToProps)(TriggersPanel))
