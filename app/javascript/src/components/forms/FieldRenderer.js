import React from 'react'
import { snakeCase, camelCase } from 'lodash'
import Input from './Input'

export const errorsFor = (name, errors) => {
  if (!errors[name]) return null
  console.log('error for', name)
  return errors[name].map((o) => o).join(', ')
}

export function gridClasses (field) {
  return Object.keys(field.grid)
    .map((o) => {
      if (o === 'xs') return field.grid[o]
      return `${o}:${field.grid[o]}`
    })
    .join(' ')
}

class FieldRenderer extends React.Component {
  fieldRenderer = () => {
    const {
      namespace,
      type,
      data,
      props,
      errors,
      errorNamespace,
      handler,
      accept,
      defaultChecked,
      value,
      id
    } = this.props

    const errorName = snakeCase(
      `${errorNamespace || ''}${data.name}`
    )
    const errorMessage = errorsFor(errorName, errors)
    const camelCasedName = camelCase(data.name)

    function formatFieldName () {
      return namespace ? `${namespace}[${data.name}]` : data.name
    }

    return (
      <div
        error={errorMessage}
        // className={classes.formControl}
      >
        <Input
          data={data}
          label={data.label || data.name}
          error={errorMessage}
          variant="standard"
          type={type}
          placeholder={data.placeholder}
          options={data.options}
          accept={accept}
          id={id}
          name={formatFieldName()}
          defaultValue={props.data[camelCasedName]}
          value={value}
          defaultChecked={defaultChecked}
          handler={handler}
          helperText={
            <React.Fragment>
              {errorMessage && (
                <div className={'text-red-500 text-xs italic'}>{errorMessage}</div>
              )}

              {data.hint && (
                <div className={'text-gray-500 text-xs'}>{data.hint}</div>
              )}
            </React.Fragment>
          }
        />
      </div>
    )
  };

  render () {
    return this.fieldRenderer()
  }
}

export default FieldRenderer
