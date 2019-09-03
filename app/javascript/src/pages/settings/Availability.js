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

        <Typography>Your workspace’s timezone is {settings.timezone}</Typography>

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

  function genHours(t1, t2){
    var toInt  = time => ((h,m) => h*2 + m/30)(...time.split(':').map(parseFloat)),
    toTime = int => [Math.floor(int/2), int%2 ? '30' : '00'].join(':'),
    range  = (from, to) => Array(to-from+1).fill().map((_,i) => from + i)
    return range(...[t1, t2].map(toInt)).map(toTime);
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
              genHours("00:00", "23:30").map((o)=>(
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
              genHours("00:00", "23:30").map((o)=>(
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