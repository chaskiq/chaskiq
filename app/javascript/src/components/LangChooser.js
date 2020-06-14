import React from 'react'
import { connect } from 'react-redux'
import {
  UPDATE_AGENT
} from '../graphql/mutations'
import FormDialog from '../components/FormDialog'

import graphql from '../graphql/client'
import { getCurrentUser } from '../actions/current_user'
import Button from '../components/Button'

function LangChooser ({ 
  open, 
  handleClose,
  auth,
  current_user,
  app,
  dispatch
}) {
  function setLang (lang) {
    graphql(UPDATE_AGENT, {
      appKey: app.key,
      email: current_user.email,
      params: {
        lang: lang
      }
    }, {
      success: (data) => {
        dispatch(getCurrentUser())
      },
      error: () => {

      }
    })
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
        
          {setted && <div>redirecting .... </div>}

          <Button onClick={() => setLang('es')}>
            Español
          </Button>

          <Button onClick={() => setLang('en')}>
            Ingles
          </Button>
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
    current_user,
  } = state
  const { loading, isAuthenticated } = auth
  return {
    auth,
    current_user,
    app,
  }
}

export default connect(mapStateToProps)(LangChooser)

