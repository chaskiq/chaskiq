import React from 'react'
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
  const [selectedLang, setSelectedLang] = React.useState(null)
  const formRef = React.createRef();

  function handleChange(value){
    /*const val = value.currentTarget.dataset.value
    const serializedData = serialize(formRef.current, { hash: true, empty: true })
    const data = toSnakeCase(serializedData)

    let next = {}

    fields.map((field)=>{
      next[`${field}_${val}`] = ""
    })

    // const newData = Object.assign({}, data.settings, next)
    const newData = Object.assign({}, {key: settings.key}, next)

    console.log(settings)
    console.log("UPDATEATE", newData)

    update({app: newData})
    toggleDialog()*/

    
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
                    <MenuItem value={o.value}>
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
    const serializedData = serialize(formRef.current, { hash: true, empty: true })
    const data = toSnakeCase(serializedData)
    update(data)
  }

  const value = "auto"

  return (

    <div>

      <Typography variant="h5">Set your availability</Typography>
      <Typography variant="subtitle1">Set team office hours and reply times</Typography>

      <Typography variant="h5">Set office hours</Typography>
      <Typography variant="subtitle1">
        Outside these hours, customers see when you'll be back, 
        relative to their timezone.
      </Typography>

      <Typography>Your workspace’s timezone is Buenos Aires</Typography>

      <Typography variant="h5">Set reply time</Typography>
      <Typography variant="subtitle1">
        During office hours, let your customers know when 
        they can expect a reply.
      </Typography>

      <FormControl component="fieldset">
        <FormLabel component="legend">Set reply time</FormLabel>
        <RadioGroup
          aria-label="reply time"
          name="reply_time"
          //className={classes.group}
          value={value}
          onChange={handleChange}
        >
          {
            options.map((o)=>(
              <FormControlLabel 
                value={o.value} 
                control={<Radio />} 
                label={o.label} 
              />
            ))
          }

        </RadioGroup>
      </FormControl>
      
      <Typography variant="subtitle">
        Note: Operator will auto reply with your team’s availability 
        during out-of-office hours or long reply times.
      </Typography>

    </div>
  )
}