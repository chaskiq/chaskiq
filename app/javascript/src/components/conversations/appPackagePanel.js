import React from 'react'
/* import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import p from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Tab from '@material-ui/core/Tab' */

import FormDialog from '../../components/FormDialog'
import Button from '../../components/Button'
import Input from '../../components/forms/Input'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import graphql from '../../graphql/client'
import { EDITOR_APP_PACKAGES } from '../../graphql/queries'

function AppPackagePanel (props) {
  const [open, setOpen] = React.useState(props.open)
  const [provider, setProvider] = React.useState(null)
  const [providers, setProviders] = React.useState([])
  const [values, setValues] = React.useState({})

  function getAppPackages () {
    graphql(
      EDITOR_APP_PACKAGES,
      {
        appKey: props.app.key
      },
      {
        success: (data) => {
          setProviders(data.app.editorAppPackages)
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
    const { requires } = o.editorDefinitions
    return (
      <div mt={2}>
        <p variant="h3">{o.name}</p>

        {requires.map((r) => renderRequirement(r))}
      </div>
    )
  }

  function renderRequirement (item) {
    switch (item.type) {
      case 'input':
        return (
          <Input
            type={'text'}
            label={item.name}
            value={values[item.name]}
            onChange={handleChange(item.name)}
            placeholder={item.placeholder}
            helperText={item.hint}
            margin="normal"
          />
        )
      default:
        return <p>no input</p>
    }
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
      titleContent={'Send App Package'}
      formComponent={
        <div>
          {
            providers.map((o) => {
              return <div 
                key={`app-package-${o.name}`} className="m-1">
                <Button
                  variant={'outlined'}
                  key={ `${o.name}-tab` }
                  onClick={() => handleClick(o)}>
                  <img className="mr-2"
                    src={o.icon}
                    width={20}
                    height={20}
                  />
                  {' '}
                  {o.name}
                </Button>
              </div>
            })
          }

          {
            provider && renderItem(provider)
          }
        </div>
      }
      dialogButtons={
        <React.Fragment>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>

          <Button
            onClick={handleSend}
            color="primary">
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

export default withRouter(connect(mapStateToProps)(AppPackagePanel))
