import React, {useState, useEffect} from 'react'
import langsOptions from '../../shared/langsOptions'
import serialize from 'form-serialize'

import { withRouter, Route } from 'react-router-dom'
import { connect } from 'react-redux'

import {
        Tab ,
        Tabs ,
        Avatar ,
        Typography,
        Button,
        TextField,
        Paper,
        Grid,
        Divider,
        Chip,
        Select,
        MenuItem,
        InputLabel,
        Box,
        Table,
        TableHead,
        TableRow,
        TableCell,
        TableBody,
        FormControl,
        FormLabel,
        RadioGroup,
        FormControlLabel,
        Radio,
        Link as MuiLink

} from '@material-ui/core';
import graphql from '../../graphql/client'
import {toSnakeCase} from '../../shared/caseConverter'
import FormDialog from '../../components/FormDialog'


const options = [
  {value: "auto", label: "Automatic reply time. Currently El equipo responderá lo antes posible"}, 
  {value: "minutes", label: "El equipo suele responder en cuestión de minutos."},
  {value: "hours", label: "El equipo suele responder en cuestión de horas."},
  {value: "1 day", label: "El equipo suele responder en un día."},
]

export default function LanguageForm({settings, update, namespace, fields}){

  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedOption, setSelectedOption] = React.useState("auto")
  const [records, setRecords] = useState([])

  let formRef = React.createRef();

  function handleChange(e){
    setSelectedOption(e.target.value)
  }

  function renderLangDialog(){
    return isOpen && (
      <FormDialog 
        open={isOpen}
        //contentText={"lipsum"}
        titleContent={"Save Assigment rule"}
        formComponent={
          //!loading ?
            <form>

              <Select
                value={selectedLang}
                onChange={handleChange}
                inputProps={{
                  name: 'age',
                  id: 'age-simple',
                }}>

                {
                  langsOptions.map((o)=>(
                    <MenuItem key={`age-${o.value}`} value={o.value}>
                      {o.label}
                    </MenuItem> 
                  ))
                }
                
                
              </Select>

            </form> 
            //: <CircularProgress/>
        }
        dialogButtons={
          <React.Fragment>
            <Button onClick={toggleDialog} color="primary">
              Cancel
            </Button>

            <Button //onClick={this.submitAssignment } 
              zcolor="primary"> 
              update
            </Button>

          </React.Fragment>
        }
        //actions={actions} 
        //onClose={this.close} 
        //heading={this.props.title}
        >
      </FormDialog>
    )
  }

  function toggleDialog(){
    setIsOpen(!isOpen)
  }

  function handleSubmit(){
    /*const serializedData = serialize(formRef, { hash: true, empty: true })
    const data = toSnakeCase(serializedData)
    console.log(data)*/
    console.log(records)
    console.log(selectedOption)
    const data = {
      team_schedule: records,
      reply_time: selectedOption
    }
    update(data)
  }

  return (

    <form ref={(ref)=> formRef = ref }>

      <Box m={2}>

        <Typography variant="h5">Set your availability</Typography>
        
        <Typography variant="subtitle1">Set team office hours and reply times</Typography>

        <Typography variant="h5">Set office hours</Typography>
        
        <Typography variant="subtitle1">
          Outside these hours, customers see when you'll be back, 
          relative to their timezone.
        </Typography>

      </Box>

      <Box m={2}>

        <Typography>Your workspace’s timezone is Buenos Aires</Typography>

        <AvailabilitySchedule 
          records={records} 
          setRecords={setRecords} 
        />

        <Typography variant="subtitle1">
          During office hours, let your customers know when 
          they can expect a reply.
        </Typography>

      </Box>

      <Divider/>

      <Box m={2}>

        <FormControl component="fieldset">
          <FormLabel component="legend">Set reply time</FormLabel>
          <RadioGroup
            aria-label="reply time"
            name="reply_time"
            //className={classes.group}
            value={selectedOption}
            onChange={handleChange}
          >
            {
              options.map((o)=>(
                <FormControlLabel 
                  key={o.value}
                  value={o.value} 
                  control={<Radio />} 
                  label={o.label} 
                />
              ))
            }

          </RadioGroup>
        </FormControl>

      </Box>
      
      <Typography variant="subtitle1">
        Note: Operator will auto reply with your team’s availability 
        during out-of-office hours or long reply times.
      </Typography>

      <Button onClick={handleSubmit}
        variant={"contained"} color={"primary"}>
        Save
      </Button>

    </form>
  )
}


function AvailabilitySchedule({records, setRecords}){

  function addRecord(){
    const newRecords = records.concat({
      day: null,
      from: null,
      to: null
    })

    setRecords(newRecords)
  }

  function update(item, index){
    const newRecords = records.map((o, i)=>{
      return i === index ? item : o 
    })
    setRecords(newRecords)
  }

  return (

    <div>
    
      {
        records.map((o, index)=>(
          <AvailabilityRecord 
            key={index} 
            record={o} 
            update={update}
            index={index}
          />
        ))
      }
      


      <Grid item xs={12}>
        <Button onClick={addRecord}>Add</Button>
      </Grid>


      <Typography variant="h5">Set reply time</Typography>
        

      
    </div>

  )
}

function AvailabilityRecord({record, update, index}){

  const [item, setRecord] = useState(record)

  function handleChange(data){
    setRecord(
      Object.assign({}, item, data)
    )
  }

  function genHours(){
    var x = 30; //minutes interval
    var times = []; // time array
    var tt = 0; // start time
    var ap = ['AM', 'PM']; // AM-PM

    //loop to increment the time and push results in array
    for (var i=0;tt<24*60; i++) {
      var hh = Math.floor(tt/60); // getting hours of day in 0-24 format
      var mm = (tt%60); // getting minutes of the hour in 0-55 format
      times[i] = ("0" + (hh % 12)).slice(-2) + ':' + ("0" + mm).slice(-2) + ap[Math.floor(hh/12)]; // pushing data in array in [00:00 - 12:00 AM/PM format]
      tt = tt + x;
    }

    return times
  }

  useEffect(()=>{
    update(item, index)
  }, [item])



  return (
    <Grid container direction="row" justify="center" alignItems="center">
 
      <Grid item xs={3}>
        <FormControl component="fieldset">

          <InputLabel htmlFor="day">day</InputLabel>

          <Select
            value={item.day}
            onChange={(e)=>handleChange({day: e.target.value})}
            inputProps={{
              name: 'day',
            }}
          >
            <MenuItem value={"mon"}>Lunes</MenuItem>
            <MenuItem value={"tue"}>Martes</MenuItem>
            <MenuItem value={"wed"}>Miercoles</MenuItem>
            <MenuItem value={"thu"}>Jueves</MenuItem>
            <MenuItem value={"fri"}>Viernes</MenuItem>
            <MenuItem value={"sat"}>Sabado</MenuItem>
            <MenuItem value={"sun"}>Domingo</MenuItem>
          </Select>
        
        </FormControl>
      </Grid>

      <Grid item xs={3}>
        <FormControl component="fieldset">

          <InputLabel htmlFor="from">from</InputLabel>

          <Select
            value={item.from}
            onChange={(e)=>handleChange({from: e.target.value})}
            inputProps={{
              name: 'from',
            }}
          >
            {
              genHours().map((o)=>(
                <MenuItem 
                  key={`from-${o}`} 
                  value={o}>
                  {o}
                </MenuItem>
              ))
            }
          </Select>
      
        </FormControl>
      </Grid>

      <Grid item xs={3}>
        <FormControl component="fieldset">

          <InputLabel htmlFor="to">to</InputLabel>
          <Select
            value={item.to}
            onChange={(e)=>handleChange({to: e.target.value})}
            inputProps={{
              name: 'to',
            }}
          >
            {
              genHours().map((o)=>(
                <MenuItem key={`to-${o}`} value={o}>
                  {o}
                </MenuItem>
              ))
            }
          </Select>
      
        </FormControl>
      </Grid>

    </Grid>
  )
}