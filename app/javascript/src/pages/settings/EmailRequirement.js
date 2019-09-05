import React , {useState} from 'react'

import {
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormControl,
  FormLabel,
  Box,
  Typography,
  Divider,
  Grid,
  RadioGroup,
  Radio,
  Button
} from '@material-ui/core'


export default function EmailRequirement({settings, update}){
  const [value, setValue] = useState(settings.emailRequirement)

  function handleChange(e){
    setValue(e.target.value)
  }

  function handleSubmit(){
    const data = {
      app: {
        email_requirement: value
      }
    } 
    update(data)
  }

  return (

    <Box>

      <Typography variant={"h4"}>
        Require an email for new conversations
      </Typography>

      <Typography variant={"overline"}>
        So you can always get back to your website visitors
      </Typography>
      
      <Box mt={2}>
      <FormLabel component="legend">
      Ask your website visitors to leave their email before starting a live chat:
      </FormLabel>
      </Box>

      <Box mt={2} mb={2}>
      
        <RadioGroup
          aria-label="email_requirement"
          name="email_requirement"
          //className={classes.group}
          value={value}
          onChange={handleChange}
        >
        
          <FormControlLabel value="office" control={<Radio />} label="Only outside of office hours " />
          <Typography variant={"overline"}>
            Reduces conversation volume by around 5% on average
          </Typography>

          <FormControlLabel value="Always" control={<Radio />} label="Always" />
          <Typography variant={"overline"}>
            Reduces conversation volume by around 30% on average
          </Typography>
    
          <FormControlLabel value="never" control={<Radio />} label="Never" />
          <Typography variant={"overline"}>
            Will allow website visitors to start a conversation at any time
          </Typography>

        </RadioGroup>

      </Box>
   
      <Button onClick={handleSubmit}
        variant={"contained"} color={"primary"}>
        Save
      </Button>


    </Box>


  )
}