import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function FormDialog(props) {
  const [open, setOpen] = React.useState(false);

  function handleClickOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    props.handleClose && props.handleClose()
  }



  return (
    <div>
      {/*<Button
        variant="outlined" 
        color="primary" 
        onClick={handleClickOpen}>
        {props.actionButton}
      </Button>*/}

      <Dialog open={props.open} 
        onClose={handleClose} 
         aria-labelledby="form-dialog-title">

        {
          props.titleContent ? 
          <DialogTitle id="form-dialog-title">
            {props.titleContent}
          </DialogTitle> : null
        }
        

        <DialogContent>
          <DialogContentText>
            {props.contentText}
          </DialogContentText>
          
          {props.formComponent}
        </DialogContent>

        <DialogActions>
          {props.dialogButtons}
        </DialogActions>

      </Dialog>
    </div>
  );
}

export default FormDialog;