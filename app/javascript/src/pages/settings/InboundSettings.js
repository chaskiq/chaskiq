import React, {useState} from 'react'
import {
  FormControlLabel,
  Checkbox,
  FormGroup,
  Box,
  Typography,
  Divider,
  Grid
} from '@material-ui/core'

export default function InboundSettings(){
  const [state, setState] = React.useState({
    checkedA: true,
    checkedB: true,
    checkedF: true,
    checkedG: true,
  });

  const handleChange = name => event => {
    setState({ ...state, [name]: event.target.checked });
  };

  return (

    <div>
    
     <Typography variant={"h4"}>
     Control inbound conversations and the launcher
     </Typography> 

     <Typography variant={"subtitle2"}>
     Control who can send you messages and where they see the launcher
     </Typography>


      <Typography variant={"h5"}>
       New conversations button
      </Typography>
    
      <Grid container>
        <FormControlLabel
          control={
            <Checkbox
              checked={state.checkedB}
              onChange={handleChange('checkedB')}
              value="checkedB"
              color="primary"
            />
          }
          label="Let people start new inbound conversations with you"
        />

      </Grid>

      <Typography variant={"caption"}>
        When this is turned off, people can only reply to the outbound messages  you send.
      </Typography>

      <Divider/>

      <Typography variant={"h5"}>
        visibility
      </Typography>

      <Typography variant={"body"}>
        Control who sees the standard Messenger launcher on your website.
      </Typography>

      <Typography variant={"body"}>
        Any messages you send will still be delivered.
      </Typography>

      <Typography variant={"body"}>
        On the web, show the standard Messenger launcher to:
        Users
      </Typography>

      
        All users
        Users who match certain data 
        Visitors

        All visitors
        Visitors who match certain data 
        This doesn’t affect the outbound messages you send.
        
    
    </div>


  )
}