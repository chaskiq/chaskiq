import React from 'react'
//import Select from '@atlaskit/select';
//import FieldTextArea from '@atlaskit/field-text-area';
//import FieldText from '@atlaskit/field-text';
//import { DateTimePicker } from '@atlaskit/datetime-picker';
//import { Checkbox } from '@atlaskit/checkbox';
//import { Field } from '@atlaskit/form';
import { snakeCase, camelCase } from 'lodash'

import TextField from '@material-ui/core/TextField';
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
import SuggestSelect from './suggestSelect'
import { withStyles } from '@material-ui/core/styles';
import DateTime from './dateTime'
import moment from 'moment-timezone';



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
    //margin: theme.spacing(1),
    width: '100%'
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

                  <TextField
                    label={data.name}
                    error={errorMessage}
                    variant="outlined"
                    fullWidth
                    //margin="normal"
                    name={`${namespace}[${data.name}]`}
                    defaultValue={props.data[camelCase(data.name)]} 
                    helperText={
                      <React.Fragment>
                      { 
                        errorMessage ? 
                        <FormHelperText id="component-error-text">
                          {errorMessage}
                        </FormHelperText> : null 
                      }

                      { data.hint ? data.hint : null }

                      </React.Fragment>
                      
                    }
                  />
                </FormControl>
      case "text":
        return <FormControl 
                  error={errorMessage}
                  className={classes.formControl}>
                  
                  <TextField
                    label={data.name}
                    variant="outlined"
                    error={errorMessage}
                    fullWidth
                    //margin="normal"
                    multiline={true}
                    name={`${namespace}[${data.name}]`}
                    defaultValue={props.data[camelCase(data.name)]} 
                    helperText={
                      errorMessage ? 
                      <FormHelperText id="component-error-text">
                        {errorMessage}
                      </FormHelperText>
                      : null
                    }
                  />

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
                  variant="outlined"
                  //margin="normal"
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
      case "timezone":

        const names = data.options.map(o=>({label: o, value: o }))
        let defaultTZ = moment.tz.guess()
        return <SuggestSelect 
            data={names}
            label={data.name} 
            defaultData={props.data[data.name] || defaultTZ}
            placeholder={'select timezone'}
            classes={classes}
            name={`${namespace}[${data.name}]`}
         />        

      case "bool":
        return <FormControlLabel 
                  error={errorMessage}
                  className={classes.formControl}
                  control={
                    <Checkbox 
                      defaultChecked={props.data[data.name]}
                      name={`${namespace}[${data.name}]`} 
                      value={true}
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






