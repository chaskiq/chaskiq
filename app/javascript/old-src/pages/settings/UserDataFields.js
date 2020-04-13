import React, {useState} from 'react'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import InputLabel from '@material-ui/core/InputLabel'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import FormDialog from '../../components/FormDialog'
import serialize from 'form-serialize'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';

import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';

import defaultFields from '../../shared/defaultFields'

function CustomizationColors({app, settings, update, dispatch}){

  const [fields, setFields] = useState(app.customFields || [])
  const [isOpen, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  
  const form = React.useRef(null);

  function addField(){
    setOpen(true)
  }

  function close(){
    setSelected(null)
    setOpen(false)
  }

  function submit(){
    setFields(handleFields())
    setOpen(false)
  }

  function handleFields(){
    const s = serialize(form.current, { hash: true, empty: true })

    if(selected === null)
      return fields.concat(s)

    return fields.map((o, i)=> {
      if(i === selected)
        return s
      return o
    })
  }

  function renderModal(){

    const selectedItem = fields[selected]

    return isOpen && (
      <FormDialog 
        open={isOpen}
        //contentText={"lipsum"}
        titleContent={"Create user data field"}
        formComponent={
          <form ref={form}>
            <FieldsForm selected={selectedItem}/>
          </form>
        }
        dialogButtons={
          <React.Fragment>
            <Button onClick={close} color="secondary">
              Cancel
            </Button>

            <Button onClick={ submit } 
              color="primary">
              {'Create'}
            </Button>

          </React.Fragment>
        }
        >
      </FormDialog>
    )

  }

  function handleEdit(o){
    setSelected(o)
    setOpen(true)
  }

  function removeField(index){
    const newFields = fields.filter((o,i)=> i != index)
    setFields(newFields)
  }

  function renderSubmitButton(){
    return <Button 
        variant={'contained'} 
        color={'primary'} 
        onClick={()=>update({
          app: {
            custom_fields: fields
          }
        })
      }>Save changes</Button>
  }
  
  return (
    <div>


      <Grid container justify={'space-between'}>

          <Typography variant={'h4'}>Fields</Typography>
     
          <Grid item sm={3} justify={'space-between'}>
          <IconButton onClick={addField} edge="end" aria-label="add">
            <AddIcon />
          </IconButton>

          {renderSubmitButton()}
          </Grid>
      </Grid>

  

      

      { renderModal() }

      <List dense={true}>
        {
          fields.map((o, i)=> (
              <React.Fragment key={o.name}>
                <Field 
                  index={i}
                  handleEdit={handleEdit}
                  removeField={removeField}
                  field={o} 
                />
                <Divider variant="inset" component="li" />
              </React.Fragment>
            )
          )
        }

        <Typography variant={'h5'}>
          Default types
        </Typography>

        {
          defaultFields.map((o, i)=> (
            <React.Fragment key={o.name}>
              <Field 
                field={o} 
              />
              <Divider variant="inset" component="li" />
            </React.Fragment>
            )
          )
        }
      </List>

      {renderSubmitButton()}

    </div>
  )

}

function FieldsForm({selected}){

  const [field, setField] = useState(selected || {})

  function setName(e){
    setField( Object.assign({}, field, {name: e.target.value}) )
  }

  function setType(e){
    setField( Object.assign({}, field, {type: e.target.value}) )
  }

  return (
    <React.Fragment>
      <TextField
        variant="outlined"
        margin="normal"
        required
        fullWidth
        name="name"
        label="Field name"
        //type="password"
        //id="password"
        autoFocus
        //error={errorsFor('password')}
        value={field.name}
        onChange={setName}
      />

      <InputLabel>
        Field setType
      </InputLabel>

      <Select
        name={'type'}
        value={field.type}
        onChange={setType}
        label={'field type'}
      >
        <MenuItem value={'string'}>Text</MenuItem>
        <MenuItem value={'integer'}>Number</MenuItem>
        {/*<MenuItem value={'bool'}>Bool</MenuItem>*/}
        <MenuItem value={'date'}>Date</MenuItem>
      </Select>
    </React.Fragment> 
  )
}

function Field({field, handleEdit, removeField, index}){

  return (
      <ListItem>
        
        <ListItemText
          primary={field.name}
          secondary={field.type}
        />

        { 
          handleEdit && <ListItemSecondaryAction>
            <IconButton onClick={()=>handleEdit(index)} 
              edge="end" aria-label="delete">
              <EditIcon />
            </IconButton>

            <IconButton onClick={()=>removeField(index)} edge="end" aria-label="add">
              <DeleteIcon />
            </IconButton>

          </ListItemSecondaryAction> 
        }
      </ListItem>
  )
}


function mapStateToProps(state) {
  const { app } = state
  return {
    app
  }
}

export default withRouter(connect(mapStateToProps)(CustomizationColors))
