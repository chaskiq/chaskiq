import React from 'react'
import Select from '@atlaskit/select';
import FieldTextArea from '@atlaskit/field-text-area';
import FieldText from '@atlaskit/field-text';
import { DateTimePicker } from '@atlaskit/datetime-picker';
import { Checkbox } from '@atlaskit/checkbox';
import { Field } from '@atlaskit/form';

export const errorsFor = (name, errors ) => {
  if (!errors[name])
    return null
  return errors[name].map((o) => o).join(", ")
}

export const fieldRenderer = (namespace, data, props, errors) => {
  switch (data.type) {
    case "string":
      return <Field label={data.name} isRequired
        isInvalid={errorsFor(data.name, errors)}
        invalidMessage={errorsFor(data.name, errors)}>
        <FieldText name={`${namespace}[${data.name}]`}
          isRequired shouldFitContainer
          value={props.data[data.name]}
          maxLength={data.maxLength}
          minLength={data.maxLength}
          placeholder={data.placeholder}
        />
      </Field>

    case "text":

      return <Field label={data.name}
        isInvalid={errorsFor(data.name, errors)}
        invalidMessage={errorsFor(data.name, errors)}>
        <FieldTextArea
          name={`${namespace}[${data.name}]`}
          shouldFitContainer
          label={`${namespace}[${data.name}]`}
          value={props.data[data.name]}
        />
      </Field>

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
      const name = data.multiple ? `${namespace}[${data.name}][]` : `${namespace}[${data.name}]`
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
      </Field>
    case "bool":
      return <div>
        <label>{data.name}</label>
        <input
          type="checkbox"
          defaultChecked={props.data[data.name]}
          name={`${namespace}[${data.name}]`}
        />

      </div>
    default:
      break;
  }
}