import React from 'react'
//import Select from '@atlaskit/select';
//import FieldTextArea from '@atlaskit/field-text-area';
//import FieldText from '@atlaskit/field-text';
//import { DateTimePicker } from '@atlaskit/datetime-picker';
//import { Checkbox } from '@atlaskit/checkbox';
//import { Field } from '@atlaskit/form';
import { snakeCase, camelCase } from 'lodash'

import Input from './Input'
//import TextField from '@material-ui/core/TextField'
//import FormControl from '@material-ui/core/FormControl'
//import FormControlLabel from '@material-ui/core/FormControlLabel'
//import FormHelperText from '@material-ui/core/FormHelperText'
//import Input from '@material-ui/core/Input'
//import MenuItem from '@material-ui/core/MenuItem'
//import InputLabel from '@material-ui/core/InputLabel'
//import Checkbox from '@material-ui/core/Checkbox'
//import InputAdornment from '@material-ui/core/InputAdornment'
//import Button from '@material-ui/core/Button'
//import IconButton from '@material-ui/core/IconButton'
//import Typography from '@material-ui/core/Typography'
//import ColorFillIcon from '@material-ui/icons/FormatColorFill'
//import ChromeReaderIcon from '@material-ui/icons/ChromeReaderMode'

//import Select from '@material-ui/core/Select';
//import Chip from '@material-ui/core/Chip';
//import MultipleSelect from './multipleSelect'
//import Select from './select'
//import SuggestSelect from './suggestSelect'
//import { withStyles } from '@material-ui/core/styles';
//import DateTime from './dateTime'

export const errorsFor = (name, errors ) => {
  if (!errors[name])
    return null
  console.log("error for", name)
  return errors[name].map((o) => o).join(", ")
}


export function gridClasses(field){
  return Object.keys(field.grid).map((o)=>{
    return `${o}:${field.grid[o]}`
  }).join(" ")
}

class FieldRenderer extends React.Component {

  fieldRenderer = () => {
    
    const {namespace, type, data, props, errors, errorNamespace, handler} = this.props
    const errorName = snakeCase(`${errorNamespace ? errorNamespace : ''}${data.name}`)
    const errorMessage = errorsFor(errorName, errors)
    
    console.log( props.data[camelCase(data.name)] )
    return <div 
      error={errorMessage}
      //className={classes.formControl}
      >

      <Input
        data={data}
        label={data.label || data.name}
        error={errorMessage}
        variant="standard"
        type={type}
        placeholder={data.placeholder}
        options={data.options}
        fullWidth
        name={`${namespace}[${data.name}]`}
        defaultValue={props.data[camelCase(data.name)]} 
        handler={handler}
        helperText={
          <React.Fragment>
            { 
              errorMessage && 
              <p className={`text-red-500 text-xs italic`}>
              {errorMessage}
              </p>
            }

            { data.hint && 
              <p className={`text-gray-500 text-xs`}>
              {data.hint}
              </p>
            }
          </React.Fragment>
        }
      />
    </div>
  }

  render(){
    return this.fieldRenderer()
  }
}

export default FieldRenderer;