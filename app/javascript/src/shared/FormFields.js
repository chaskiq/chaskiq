import React from 'react'
//import Select from '@atlaskit/select';
import FieldTextArea from '@atlaskit/field-text-area';
//import FieldText from '@atlaskit/field-text';
//import { DateTimePicker } from '@atlaskit/datetime-picker';
//import { Checkbox } from '@atlaskit/checkbox';
//import { Field } from '@atlaskit/form';
import { snakeCase, camelCase } from 'lodash'


import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Checkbox from '@material-ui/core/Checkbox';
//import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';
import MultipleSelect from './multipleSelect'
import Select from './select'
import { withStyles } from '@material-ui/core/styles';
import DateTime from './dateTime'



export const errorsFor = (name, errors ) => {
  if (!errors[name])
    return null
  return errors[name].map((o) => o).join(", ")
}

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%'
  },
  formControl: {
    margin: theme.spacing(1),
    width: '97%'
    //minWidth: 120,
  },
  selectEmpty: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
});

class FieldRenderer extends React.Component {

  fieldRenderer = () => {
    
    const {namespace, data, props, errors, classes} = this.props

    const errorMessage = errorsFor(data.name, errors)
    
    switch (data.type) {
      case "string":
        // className={classes.formControl}
        return <FormControl 
                  error={errorMessage}
                  className={classes.formControl}>
                  <InputLabel htmlFor="component-simple">
                    {data.name}
                  </InputLabel>
                  <Input id="component-simple"
                    name={`${namespace}[${data.name}]`}
                    defaultValue={props.data[camelCase(data.name)]} 
                    //onChange={this.handleChange} 
                  />
                  {
                    errorMessage ? 
                    <FormHelperText id="component-error-text">
                      {errorMessage}
                    </FormHelperText>
                    : null
                  }
                </FormControl>
      case "text":

        return <FormControl 
                  error={errorMessage}
                  className={classes.formControl}>
                  <InputLabel htmlFor="component-simple">
                    {data.name}
                  </InputLabel>
                  <Input id="component-simple"
                    multiline={true}
                    name={`${namespace}[${data.name}]`}
                    defaultValue={props.data[camelCase(data.name)]} 
                    //onChange={this.handleChange} 
                  />
                  {
                    errorMessage ? 
                    <FormHelperText id="component-error-text">
                      {errorMessage}
                    </FormHelperText>
                    : null
                  }
                </FormControl>
      case "datetime":
        return <FormControl 
                  error={errorMessage}
                  className={classes.formControl}>
                  <DateTime
                    name={`${namespace}[${data.name}]`}
                    defaultValue={props.data[data.name] || new Date}
                    label={data.name}
                  />
              </FormControl>
      case "select":
        let defaultData = null

        if (data.multiple) {
          if (!props.data[data.name]){
            defaultData = {
              label: data.default,
              value: data.default
            }
          } else {
            defaultData = props.data[data.name].map((o) => {
              return {
                label: o,
                value: o
              }
            })
          }

          return <MultipleSelect 
                  data={data} 
                  defaultData={defaultData}
                  name={`${namespace}[${data.name}]`}
               />

        } else {
          defaultData = {
            label: props.data[data.name] || data.default,
            value: props.data[data.name] || data.default
          }

          return <Select 
              data={data} 
              defaultData={defaultData}
              classes={classes}
              name={`${namespace}[${data.name}]`}
           />
        }
      case "bool":
        return <FormControlLabel 
                  error={errorMessage}
                  className={classes.formControl}
                  control={
                    <Checkbox 
                      defaultChecked={props.data[data.name]}
                      name={`${namespace}[${data.name}]`} 
                     />
                  }
                  //labelPlacement="top"
                  label={data.name}
                />
      default:
        break;
    }

  } 

  render(){
    return this.fieldRenderer()
  }

}

export default withStyles(styles)(FieldRenderer);


export const fieldRenderer = (namespace, data, props, errors) => {
  switch (data.type) {
    case "string":
      // className={classes.formControl}
      return <FormControl>
                <InputLabel htmlFor="component-simple">
                  {data.name}
                </InputLabel>
                <Input id="component-simple"
                  name={`${namespace}[${data.name}]`}
                  defaultValue={props.data[camelCase(data.name)]} 
                  //onChange={this.handleChange} 
                />
              </FormControl>
    case "text":

      return <FormControl>
                <InputLabel htmlFor="component-simple">
                  {data.name}
                </InputLabel>
                <Input id="component-simple"
                  multiline={true}
                  name={`${namespace}[${data.name}]`}
                  defaultValue={props.data[camelCase(data.name)]} 
                  //onChange={this.handleChange} 
                />
              </FormControl>
    case "datetime":
      return <Field label={data.name} isRequired
        isInvalid={errorsFor(data.name, errors)}
        invalidMessage={errorsFor(data.name, errors)}>

        <DateTimePicker
          name={`${namespace}[${data.name}]`}
          defaultValue={props.data[data.name] || new Date}
        //onChange={onChange}
        />
      </Field>
    case "select":
      let defaultData = null


      if (data.multiple) {
        if (!props.data[data.name]){
          defaultData = {
            label: data.default,
            value: data.default
          }
        } else {
          defaultData = props.data[data.name].map((o) => {
            return {
              label: o,
              value: o
            }
          })
        }

        return <MultipleSelect 
                data={data} 
                defaultData={defaultData}
                name={`${namespace}[${data.name}]`}
             />

      } else {
        defaultData = {
          label: props.data[data.name] || data.default,
          value: props.data[data.name] || data.default
        }

        return <Select 
            data={data} 
            defaultData={defaultData}
            name={`${namespace}[${data.name}]`}
         />
      }
    case "bool":
      return <div>
        <label>{data.name}</label>
        
        <Checkbox
          defaultChecked={props.data[data.name]}
          name={`${namespace}[${data.name}]`}
        />

      </div>
    default:
      break;
  }
} 






