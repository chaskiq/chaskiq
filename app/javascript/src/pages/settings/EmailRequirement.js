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
          {I18n.t("settings.email_requirement.title")}
        </Typography>

        <Typography variant={"body1"}>
          {I18n.t("settings.email_requirement.hint")}
        </Typography>
        
        <Box mt={2}>
        <FormLabel component="legend">
          {I18n.t("settings.email_requirement.ask")}
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
        
        {
          I18n.t("settings.email_requirement.options").map((o, i)=>{
            return <React.Fragment key={`email_requirement_options-${i}`}>
                    <FormControlLabel 
                      value={o.value} 
                      control={<Radio />} 
                      label={o.label}
                    />
                    <Typography variant={"overline"}>
                      {o.hint}
                    </Typography>
                  </React.Fragment>
          })
        }
        

        </RadioGroup>

      </Box>
   
      <Button onClick={handleSubmit}
        variant={"contained"} color={"primary"}>
        Save
      </Button>


    </Box>


  )
}