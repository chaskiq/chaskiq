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
        IconButton,
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

import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
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
  const [selectedOption, setSelectedOption] = React.useState(settings.replyTime)
  const [records, setRecords] = useState(settings.teamSchedule)

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
      app:{
        team_schedule: records,
        reply_time: selectedOption
      }
    }
    update(data)
  }

  return (

    <form ref={(ref)=> formRef = ref }>

      <Box m={2}>

        <Typography variant="h4">Set your availability</Typography>
        
        <Typography variant="subtitle1" gutterBottom>Set team office hours and reply times</Typography>

        <Typography variant="h5">Set office hours</Typography>
        
        <Typography variant="overline" gutterBottom>
          Outside these hours, customers see when you'll be back, 
          relative to their timezone.
        </Typography>

      </Box>

      <Divider/>

      <Box m={2}>

        <Typography gutterBottom variant={"overline"}>
          Your workspace’s timezone is {settings.timezone}
        </Typography>

        <AvailabilitySchedule 
          records={records} 
          setRecords={setRecords} 
        />

      </Box>

      <Divider/>

      <Box m={2}>

        <Typography variant="h5">Set reply time</Typography>

        <Typography variant="overline" gutterBottom>
          During office hours, let your customers know when 
          they can expect a reply.
        </Typography>


        <Box mt={2} mb={2}>
          <FormControl component="fieldset">
            
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

      </Box>
      
      <Typography variant="subtitle1" gutterBottom>
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

  function removeItem(index){
    const newRecords = records.filter((o, i)=> i != index)
    setRecords(newRecords)
  }

  return (

    <Box m={2}>
    
      {
        records.map((o, index)=>(
          <AvailabilityRecord 
            key={index} 
            record={o} 
            update={update}
            index={index}
            removeItem={removeItem}
          />
        ))
      }
      


      <Grid item xs={12}>
        <IconButton onClick={addRecord}>
          <AddIcon/>
        </IconButton>
      </Grid>
        
    </Box>

  )
}

function AvailabilityRecord({record, update, index, removeItem}){

  const [item, setRecord] = useState(record)

  function handleChange(data){
    setRecord(
      Object.assign({}, item, data)
    )
  }

  function genHours(t1, t2){
    return Array(24 * 4).fill(0).map((_, i) => { return ('0' + ~~(i / 4) + ':0' + 60  * (i / 4 % 1)).replace(/\d(\d\d)/g, '$1') });

  }

  useEffect(()=>{
    update(item, index)
  }, [item])


  function deleteItem(){
    removeItem(index)
  }

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

      <Grid item xs={3}>
         <IconButton onClick={deleteItem}>
          <DeleteIcon></DeleteIcon>
         </IconButton>
      </Grid>

    </Grid>
  )
}