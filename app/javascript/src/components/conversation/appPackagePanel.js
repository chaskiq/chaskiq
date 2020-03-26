import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Tab from '@material-ui/core/Tab'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import graphql from '../../graphql/client'
import {
  EDITOR_APP_PACKAGES
} from '../../graphql/queries'

function AppPackagePanel(props) {
  const [open, setOpen] = React.useState(props.open);
  const [provider, setProvider] = React.useState(null)
  const [providers, setProviders] = React.useState([])
  const [values, setValues] = React.useState({});

  function getAppPackages(){
    graphql(EDITOR_APP_PACKAGES, {
      appKey: props.app.key
    }, {
      success: (data)=>{
        setProviders(data.app.editorAppPackages)
      },
      error: ()=>{
        debugger
      }
    })
  }

  React.useEffect(()=>{
    getAppPackages()
  }, [])

  /*
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
  ]*/
  
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
    const {requires} = o.editorDefinitions
    return <Box mt={2}>
            
            <Typography variant="h3">
              {o.name}
            </Typography>

            {
              requires.map((r)=> renderRequirement(r))
            }

          </Box>
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
    const newData = Object.assign({}, provider, provider.editorDefinitions)
    props.insertComment({
      provider: newData, 
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
          Send App Package
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText id="alert-dialog-description">

            {
              providers.map((o)=>{
                return <Box ml={1}>
                          <Button 
                              variant={"outlined"} 
                              key={ `${o.name}-tab` } 
                              onClick={()=>handleClick(o)}>
                              <img src={o.icon} 
                                width={20} 
                                height={20}
                              />
                              {" "}
                              {o.name}
                          </Button>
                       </Box>
              })
            }

          {
            provider && renderItem(provider) 
          }
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleSend} color="primary">
            Save
          </Button>
          <Button onClick={handleClose} color="secondary">
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

export default withRouter(connect(mapStateToProps)(AppPackagePanel))