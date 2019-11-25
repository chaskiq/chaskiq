import React , {useState} from 'react'

import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import FormGroup from '@material-ui/core/FormGroup'
import FormControl from '@material-ui/core/FormControl'
import FormLabel from '@material-ui/core/FormLabel'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import RadioGroup from '@material-ui/core/RadioGroup'
import Radio from '@material-ui/core/Radio'
import Button from '@material-ui/core/Button'


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

      <Box mb={2}>
        <Typography variant={"h4"}>
          Require an email for new conversations
        </Typography>

        <Typography variant={"body1"}>
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