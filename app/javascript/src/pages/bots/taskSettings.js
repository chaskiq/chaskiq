import React, {useState, useEffect} from 'react'
import {
  Grid,
  Button,
  Typography,
  FormControlLabel,
  FormControl,
  Radio,
  RadioGroup,
  FormLabel,
  Checkbox
} from '@material-ui/core'

const TaskSettingsForm = ({app, data, updateData, saveData, errors}) => {

  const [state, setState] = useState(data || {})

  function update(data){
    const newState = Object.assign({}, state, data)
    //setState(newState)
    updateData(newState)
  }


  return (

    <div>

      <Schedule 
        app={app} 
        updateData={update} 
        data={data}
        namespace={"scheduling"}
        submit={()=> saveData(state)}
      />
     
    </div>
  )
}

function Schedule({app, data, updateData, namespace, submit}){
  const [state, setState] = React.useState(data);

  useEffect(()=>{
    updateData(state)
  }, [state])

  function handleRadioChange(event) {
    setValue(event.target.name, event.target.value);
  }

  const setValue = (name, value)=>{
    setState({ ...state, [name]: value });
  }

  function submitData(){
    submit(state)
  }

  const handleChange = name => event => {
    setValue(name, event.target.checked ? "enabled" : "disabled")
  };

  return (
    <div>


      <Grid container>

        <Grid item>

          <Typography variant={"h5"}>
            Enable Bot
          </Typography>

          <FormControlLabel
            control={
              <Checkbox 
                checked={state.state === "enabled"} 
                onChange={handleChange('state')} 
                value="enabled" 
              />
            }
            label="enabled"
          />

          <Typography variant={"h5"}>
            Set specific times to show this bot to your audience.
          </Typography>

          <Typography variant={"overline"}>
            Your app's timezone is {app.timezone} See your office hours.
          </Typography>

          <FormControl component="fieldset">
            <FormLabel component="legend">
              Set specific times to show this bot to your audience.
            </FormLabel>

            <RadioGroup aria-label="position" 
              name="scheduling" 
              value={state.scheduling} 
              onChange={handleRadioChange} 
              >
              <FormControlLabel
                value="inside_office"
                control={<Radio color="primary" />}
                label="During office hours"
                labelPlacement="end"
              />

              <FormControlLabel
                value="outside_office"
                control={<Radio color="primary" />}
                label="Outside office hours"
                labelPlacement="end"
              />

              <FormControlLabel
                value="custom_time"
                control={<Radio color="primary" />}
                label="Custom time"
                disabled={true}
                labelPlacement="end"
              />
            </RadioGroup>
          </FormControl>

        </Grid>

        <Grid item>

          <Button variant={'contained'} 
            color={"primary"}
            onClick={submitData}>
            save
          </Button>

        </Grid>

      </Grid>

    </div>
  )
}

export default TaskSettingsForm