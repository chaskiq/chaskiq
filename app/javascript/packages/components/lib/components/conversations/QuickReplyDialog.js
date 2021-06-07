import React from 'react'
import { connect } from 'react-redux'
import { successMessage, errorMessage } from '../../actions/status_messages'
import FormDialog from '../FormDialog'
import Button from '../Button'
import graphql from '../../graphql/client'

import {
  QUICK_REPLY_CREATE
} from '../../graphql/mutations'

function QuickReplyDialog ({
  open,
  app,
  lang,
  dispatch,
  closeHandler
}) {
  const [isOpen, setIsOpen] = React.useState(open)
  const [title, setTitle] = React.useState('')

  React.useEffect(() => {
    setIsOpen(open)
  }, [open])

  function close () {
    setIsOpen(false)
    closeHandler && closeHandler()
  }

  function createQuickReply () {
    graphql(QUICK_REPLY_CREATE, {
      appKey: app.key,
      title: title,
      content: open,
      lang: lang
    }, {
      success: (_data) => {
        close()
        dispatch(successMessage(
          I18n.t('quick_replies.create.success')
        ))
      },
      error: (_err) => {
        dispatch(errorMessage(
          I18n.t('quick_replies.create.error')
        ))
      }
    })
  }

  return <div>
    {isOpen && (
      <FormDialog
        open={isOpen}
        handleClose={closeHandler}
        titleContent={ I18n.t('quick_replies.add_as_dialog.title') }
        formComponent={
          <form>
            <input
              className="shadow appearance-none border border-gray-500
              rounded w-full py-2 px-3 text-gray-700
              leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              onChange={(e) => setTitle(e.target.value) }
              placeholder={'add title'}
            />
          </form>
        }
        dialogButtons={
          <React.Fragment>
            {
              title &&
              <Button onClick={createQuickReply}
                className="ml-2" variant="danger">
                {I18n.t('common.create')}
              </Button>
            }

            <Button onClick={close} variant="outlined">
              {I18n.t('common.cancel')}
            </Button>
          </React.Fragment>
        }
      ></FormDialog>
    )}
  </div>
}

function mapStateToProps (state) {
  const { app } = state
  return {
    app
  }
}

export default connect(mapStateToProps)(QuickReplyDialog)
