import React from 'react'
//import Select from '@atlaskit/select';
import FieldTextArea from '@atlaskit/field-text-area';
import FieldText from '@atlaskit/field-text';
import { DateTimePicker } from '@atlaskit/datetime-picker';
//import { Checkbox } from '@atlaskit/checkbox';
import { Field } from '@atlaskit/form';
import { snakeCase, camelCase } from 'lodash'


import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';


export const errorsFor = (name, errors ) => {
  if (!errors[name])
    return null
  return errors[name].map((o) => o).join(", ")
}

export const fieldRenderer = (namespace, data, props, errors) => {
  switch (data.type) {
    case "string":
      // className={classes.formControl}
      return <FormControl>
                <InputLabel htmlFor="component-simple">
                  {data.name}
                </InputLabel>
                <Input id="component-simple" 
                  value={props.data[camelCase(data.name)]} 
                  //onChange={this.handleChange} 
                />
              </FormControl>


      {/*<Field label={data.name} isRequired
        isInvalid={errorsFor(data.name, errors)}
        invalidMessage={errorsFor(data.name, errors)}>
        <FieldText name={`${namespace}[${data.name}]`}
          isRequired shouldFitContainer
          value={props.data[camelCase(data.name)]}
          maxLength={data.maxLength}
          minLength={data.maxLength}
          placeholder={data.placeholder}
        />
      </Field>*/}

    case "text":

      return <FormControl>
                <InputLabel htmlFor="component-simple">
                  {data.name}
                </InputLabel>
                <Input id="component-simple"
                  multiline={true}
                  value={props.data[camelCase(data.name)]} 
                  //onChange={this.handleChange} 
                />
              </FormControl>

      {
        /*<Field label={data.name}
          isInvalid={errorsFor(data.name, errors)}
          invalidMessage={errorsFor(data.name, errors)}>
          <FieldTextArea
            name={`${namespace}[${data.name}]`}
            shouldFitContainer
            label={`${namespace}[${data.name}]`}
            value={props.data[data.name]}
          />
        </Field>
        */
      }

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
      
      /*const name = data.multiple ? `${namespace}[${data.name}][]` : `${namespace}[${data.name}]`
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
      } else {
        defaultData = {
          label: props.data[data.name] || data.default,
          value: props.data[data.name] || data.default
        }
      }

      return <Field label={data.name}
        isInvalid={errorsFor(data.name, errors)}
        invalidMessage={errorsFor(data.name, errors)}>

        <Select
          name={name}
          isSearchable={false}
          isMulti={data.multiple}
          defaultValue={defaultData}
          options={data.options.map((o) => {
            return { label: o, value: o }
          })
          }
        />
      </Field>*/

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
      } else {
        defaultData = {
          label: props.data[data.name] || data.default,
          value: props.data[data.name] || data.default
        }
      }

      return <FormControl>
        <InputLabel htmlFor="select-multiple-chip">
          {data.name}
        </InputLabel>
        <Select
          multiple={data.multiple}
          name={name}
          //value={defaultData}
          //onChange={this.handleChange}
          defaultValue={defaultData}
          input={<Input id="select-multiple-chip" />}
          renderValue={selected => {
            debugger
            return <div 
              //className={classes.chips}
            >
              {selected.map(value => (
                <Chip 
                  key={value} 
                  label={value} 
                  //className={classes.chip} 
                 />
              ))}
            </div>
          }
          }
          //MenuProps={MenuProps}
        >

          {
            data.options.map((o) => {
              //return { label: o, value: o }
              return <MenuItem 
                        key={o} 
                        value={o} 
                         //style={getStyles(name, this)}
                         >
                        {o}
                      </MenuItem>

            })
          }
        </Select>
      </FormControl>

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