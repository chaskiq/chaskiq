import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import NewEditor from './newEditor'

function DialogEditor(props) {
  const [open, setOpen] = React.useState(props.open);
  
  React.useEffect( () => { 
    setOpen(props.open) 
  }, [ props.open ] );

  function handleClickOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    props.close()
  }

  return (
    <div>
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Open alert dialog
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={'sm'}
        fullWidth={true}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Compose a new message
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            To: 
            {props.app_user.displayName}

            <NewEditor 
              {...props} 
              data={{}}
              submitData={props.handleSubmit}
            />
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
        </DialogActions>

      </Dialog>
    </div>
  );
}


function mapStateToProps(state) {
  const { app_user, app } = state
  return {
    app_user,
    app
  }
}

//export default ShowAppContainer

export default withRouter(connect(mapStateToProps)(DialogEditor))