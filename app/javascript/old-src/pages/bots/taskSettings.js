import React, {
  useState, 
  useEffect, 
  useRef
} from 'react'

import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormLabel from '@material-ui/core/FormLabel'
import Checkbox from '@material-ui/core/Checkbox'
import TextField from '@material-ui/core/TextField'

import FormDialog from '../../components/FormDialog'


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

      <UrlPaths
        app={app} 
        updateData={update} 
        data={data}
      />

      <Grid item>

        <Button variant={'contained'} 
          color={"primary"}
          onClick={()=> saveData(state)}>
          save
        </Button>

      </Grid>
     
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
        <Grid container direction={"column"}>

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
      </Grid>
    </div>
  )
}

function UrlPaths({data, updateData}){
  const [urls, setUrls] = useState(data.urls || [] )
  const inputEl = useRef(null);

  useEffect(()=>{
    updateData({urls: urls})
  }, [urls])

  const [open, setOpen] = useState(false)

  function remove(item){
    const newUrls = urls.filter((o)=> o != item)
    setUrls(newUrls)
  }

  function add(){
    setOpen(true)
  }

  function close(){
    setOpen(false)
  }

  function submit(e){
    const newUrls = urls.concat(inputEl.current.value)
    setUrls(newUrls)
    setOpen(false)
  }

  return (

    <Grid container direction={"column"}>

      <Grid item>

        <Typography variant={"h5"}>
          Enable Bot
        </Typography>

        {open && (
          <FormDialog 
            open={open}
            //contentText={"lipsum"}
            titleContent={"Save Url"}
            formComponent={
              //!loading ?
                <form>
                  <input ref={inputEl} name={"oe"} />
                </form> 
                //: <CircularProgress/>
            }
            dialogButtons={
              <React.Fragment>
                <Button onClick={close} color="secondary">
                  Cancel
                </Button>

                <Button onClick={submit } 
                  color="primary">
                  Create
                </Button>

              </React.Fragment>
            }>
          </FormDialog>
        )}

      </Grid>
    
      <Grid item>
        <Button onClick={add}>add</Button>
      </Grid>

      <Grid container direction={"column"}>
        {
          urls.map((o)=>(
            <Grid item>
              <p>{o}</p>
              <Button onClick={()=> remove(o)}>remove</Button>
            </Grid>
          ))
        }
      </Grid>
    
    </Grid>

  )
}

export default TaskSettingsForm