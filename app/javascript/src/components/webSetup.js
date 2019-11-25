import React from 'react'
import { withRouter } from 'react-router-dom'

import { connect } from 'react-redux'
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import Prism from 'prismjs'

import styled from '@emotion/styled'

const Pre = styled.pre`
  background: black;
  color: white;
  font-size: 1.5em;
`

function WebSetup({app, classes}){

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return  (
    <div>
      <Typography className={classes.link} 
        component="a" href="#" onClick={handleClickOpen}>
        Web Setup
      </Typography>

      <SimpleDialog
        app={app}
        open={open} 
        onClose={handleClose} 
      />
    </div>
  )
}

function SimpleDialog(props) {
  //const classes = useStyles();
  const { onClose, open, app } = props;

  const handleClose = () => {
    onClose();
  };

  function setupScript(){
    
    const hostname = window.location.hostname
    const port = window.location.port ? ":"+window.location.port : ""
    const secure = window.location.protocol === "https"
    const httpProtocol = window.location.protocol
    const wsProtocol = secure ? "wss" : "ws"
    const hostnamePort = `${hostname}${port}`

    const code = `
      <script>
        (function(d,t) {
          var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
          g.src="${httpProtocol}//${hostnamePort}/embed.js"
          s.parentNode.insertBefore(g,s);
          g.onload=function(){
            new window.ChaskiqMessengerEncrypted({
              domain: '${httpProtocol}//${hostnamePort}',
              ws:  '${wsProtocol}://${hostnamePort}/cable',
              app_id: "${app ? app.key : ''}",
              data: "YOUR_ENCRYPTED_JWE_DATA",
              lang: "USER_LANG_OR_DEFAULTS_TO_BROWSER_LANG" 
            })
          }
        })(document,"script");
      </script>
    `
    return Prism.highlight(code, Prism.languages.javascript, 'javascript');
  }

  return (

    <Dialog 
      fullWidth={true}
      maxWidth={'md'}
      onClose={handleClose} 
      aria-labelledby="simple-dialog-title" 
      open={open}>
      <DialogTitle id="simple-dialog-title">
        Web Messenger Setup
      </DialogTitle>
      <DialogContent>
          <DialogContentText>
            put the following script on the end of your html body tag
          </DialogContentText>
          <Pre>
            <div dangerouslySetInnerHTML={{__html: setupScript() }}/>
          </Pre>
      </DialogContent>
      
    </Dialog>
  );
}

function mapStateToProps(state) {
  const { app } = state
  return {
    app
  }
}

export default withRouter(connect(mapStateToProps)(WebSetup))

