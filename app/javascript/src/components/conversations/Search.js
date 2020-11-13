import React from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import FormDialog from '../FormDialog'
import {
  SeachIcon
} from '../icons'
import Button from '../Button'
import SearchInput from '../SearchInput'

import {
  getConversations,
  updateConversationsData,
  clearConversations
} from '../../actions/conversations'

function ConversationSearch ({ app, dispatch, conversations }) {
  const [open, setOpen] = React.useState(false)

  function fetchConversations (options, cb) {
    dispatch(
      getConversations(options, () => {
        cb && cb()
      })
    )
  }

  function handleSubmit (term) {
    dispatch(clearConversations([]))
    dispatch(
      updateConversationsData({
        term: term
      }, () => {
        setOpen(false)
        fetchConversations({})
      })
    )
  }

  return (
    <React.Fragment>

      <Button variant="icon" onClick={() => setOpen(true)}>
        <SeachIcon/>
      </Button>

      <FormDialog
        open={open}
        handleClose={() => setOpen(false)}
        title={'eeie'}
        formComponent={
          <div>
            <h3>search some shit</h3>
            <SearchInput
              defaultValue={conversations.term}
              onSubmit={(term) => {
                handleSubmit(term)
              }
              }
              placeholder={'search conversations'}
            />

          </div>
        }>

      </FormDialog>

    </React.Fragment>
  )
}

function mapStateToProps (state) {
  const { app, conversations } = state
  return {
    conversations,
    app
  }
}

export default withRouter(connect(mapStateToProps)(ConversationSearch))
