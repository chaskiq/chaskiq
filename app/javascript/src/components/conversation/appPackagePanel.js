import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

function DialogEditor(props) {
  const [open, setOpen] = React.useState(props.open);
  const [provider, setProvider] = React.useState(null)

  const [values, setValues] = React.useState({});

  const providers =  [
    {
      name: "calendly",
      requires: [
        { type: "input", name: "src", 
          placeholder: "put clendly url", 
          hint: "is the calendy url"
        }
      ],
      schema: [
          {
            name: "calendly", 
            type: "button", 
            label: "book a metting", 
            element: "button", 
            placeholder: "click button to open calendar"
        }
      ]
      
    },
    {
      name: "typeform",
      requires: [
        {
          type: "input", 
          name: "src", 
          placeholder: "typeform url", 
          hint: "typeform url"
        }
      ],
      schema: [
          {
            name: "typeform", 
            type: "button", 
            label: "open form", 
            element: "button", 
            placeholder: "click to open form"
        }
      ]
    }
  ]
  
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

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };

  function renderItem(o){
    return <div>
            <h3>{o.name}</h3>
            {
              o.requires.map((r)=> renderRequirement(r))
            }

            {JSON.stringify(values)}
            
          </div>
  }

  function renderRequirement(item){
    switch (item.type) {
      case "input":
        return <TextField
                  label={item.name}
                  value={values[item.name]}
                  onChange={handleChange(item.name)}
                  placeholder={item.placeholder}
                  helperText={item.hint}
                  margin="normal"
                />    
      default:
        return <p>no input</p>
    }
  }

  function handleClick(o){
    setProvider(o)
  }

  function handleSend(){
    props.insertComment({
      provider: provider, 
      values: values
    })
  }

  return (
    
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
          {
            providers.map((o)=>{
              return <button onClick={()=>handleClick(o)}>
                      {o.name}
                     </button>
            })
          }

          {
            provider && renderItem(provider) 
          }
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleSend} color="primary">
            save
          </Button>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>

      </Dialog>
   
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