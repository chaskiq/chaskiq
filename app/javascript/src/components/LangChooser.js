import React from 'react'
import { connect } from 'react-redux'
import {
  UPDATE_AGENT
} from '../graphql/mutations'
import FormDialog from '../components/FormDialog'

import graphql from '../graphql/client'
import { getCurrentUser } from '../actions/current_user'

import Input from '../components/forms/Input'
import CircularProgress from '../components/Progress'

function LangChooser ({
  open,
  handleClose,
  current_user,
  app,
  dispatch
}) {
  const [setted, setSetted] = React.useState(false)

  function setLang (lang) {
    graphql(UPDATE_AGENT, {
      appKey: app.key,
      email: current_user.email,
      params: {
        lang: lang
      }
    }, {
      success: () => {
        // This dispatch will trigger an effect on AppRoutes.js
        // which will refresh the components
        dispatch(getCurrentUser())
        setSetted(true)
      },
      error: () => {

      }
    })
  }

  function handleChange (e) {
    setLang(e.value)
  }

  return (

    <FormDialog
      open={open}
      handleClose={() => handleClose(false)}
      maxWidth={'sm'}
      fullWidth={true}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      titleContent={'select language'}
      formComponent={
        <div>

          {
            setted && <div>
              <CircularProgress/>
            </div>
          }

          {!setted && <Input
            type="select"
            // value={ selectedAgent() }
            onChange={handleChange}
            defaultValue={{
              value: I18n.locale,
              label: I18n.t(`common.langs.${I18n.locale}`)
            }}
            label={'select language'}
            data={{}}
            options={
              [
                { label: I18n.t('common.langs.en'), value: 'en' },
                { label: I18n.t('common.langs.es'), value: 'es' },
                { label: I18n.t('common.langs.pt'), value: 'pt' }
              ]
            }>
          </Input>}

        </div>
      }
      // dialogButtons={}
    >
    </FormDialog>
  )
}

function mapStateToProps (state) {
  const {
    auth,
    app,
    current_user
  } = state
  return {
    auth,
    current_user,
    app
  }
}

export default connect(mapStateToProps)(LangChooser)
