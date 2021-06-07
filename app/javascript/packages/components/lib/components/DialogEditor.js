import React from 'react'
import Button from './Button'
import FormDialog from './FormDialog'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import NewEditor from './conversations/newEditor'

function DialogEditor (props) {
  const [open, setOpen] = React.useState(props.open)

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

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Open alert dialog
      </Button>

      <FormDialog
        open={open}
        handleClose={handleClose}
        maxWidth={'sm'}
        fullWidth={true}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        titleContent={'Compose a new message'}
        formComponent={
          <div>
            To:
            {props.app_user.displayName}

            <div className="relative rounded-lg border
             border-gray-300 bg-white
             my-5 shadow-sm
             flex items-center space-x-3
              hover:border-gray-400 focus-within:ring-2
              focus-within:ring-offset-2 focus-within:ring-pink-500">
              <NewEditor
                {...props}
                data={{}}
                submitData={props.handleSubmit}
              />
            </div>
          </div>
        }
        dialogButtons={
          <Button onClick={handleClose}
            color="secondary">
            Cancel
          </Button>
        }
      >

      </FormDialog>
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

export default withRouter(connect(mapStateToProps)(DialogEditor))
