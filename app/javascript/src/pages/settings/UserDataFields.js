import React, { useState } from 'react'

import Button from '../../components/Button'

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import FormDialog from '../../components/FormDialog'

import List, {
  ListItem,
  ListItemText,
  ItemListPrimaryContent,
  ItemListSecondaryContent
} from '../../components/List'
import serialize from 'form-serialize'

import { DeleteIcon, PlusIcon, EditIcon } from '../../components/icons'

import defaultFields from '../../shared/defaultFields'
import Input from '../../components/forms/Input'

function CustomizationColors ({ app, settings, update, dispatch }) {
  const [fields, setFields] = useState(app.customFields || [])
  const [isOpen, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  const form = React.useRef(null)

  function addField () {
    setOpen(true)
  }

  function close () {
    setSelected(null)
    setOpen(false)
  }

  function submit () {
    setFields(handleFields())
    setOpen(false)
  }

  function handleFields () {
    const s = serialize(form.current, { hash: true, empty: true })

    if (selected === null) {
      return fields.concat(s)
    }

    return fields.map((o, i) => {
      if (i === selected) {
        return s
      }
      return o
    })
  }

  function renderModal () {
    const selectedItem = fields[selected]

    return (
      isOpen && (
        <FormDialog
          open={isOpen}
          handleClose={close}
          // contentText={"lipsum"}
          titleContent={'Create user data field'}
          formComponent={
            <form ref={form}>
              <FieldsForm selected={selectedItem} />
            </form>
          }
          dialogButtons={
            <React.Fragment>
              <Button onClick={close} variant={'outlined'}>
                Cancel
              </Button>

              <Button onClick={submit} className="mr-1">
                {'Create'}
              </Button>
            </React.Fragment>
          }
        ></FormDialog>
      )
    )
  }

  function handleEdit (o) {
    setSelected(o)
    setOpen(true)
  }

  function removeField (index) {
    const newFields = fields.filter((o, i) => i !== index)
    setFields(newFields)
  }

  function renderSubmitButton () {
    return (
      <Button
        variant={'contained'}
        color={'primary'}
        onClick={() =>
          update({
            app: {
              custom_fields: fields
            }
          })
        }
      >
        Save changes
      </Button>
    )
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between">
        <p className="text-lg leading-6 font-medium  text-gray-900 py-4">
          Custom Fields
        </p>

        <div className="flex w-1/4 justify-end">
          <Button onClick={addField}
            edge="end" variant="icon"
            aria-label="add">
            <PlusIcon />
          </Button>

          {renderSubmitButton()}
        </div>
      </div>

      {renderModal()}

      <div className="py-4">
        <List dense={true} divider={true}>
          {fields.map((o, i) => (
            <FieldsItems
              primary={o.name}
              secondary={o.type}
              terciary={
                <React.Fragment>
                  <Button
                    variant="icon"
                    onClick={() => handleEdit(i)}
                    edge="end"
                    aria-label="delete"
                  >
                    <EditIcon />
                  </Button>

                  <Button
                    variant="icon"
                    onClick={() => removeField(i)}
                    edge="end"
                    aria-label="add"
                  >
                    <DeleteIcon />
                  </Button>
                </React.Fragment>
              }
            />
          ))}
        </List>
      </div>

      <p className="text-lg leading-6 font-medium text-gray-900">
        Default fields
      </p>

      <p className="mt-2 max-w-xl text-sm leading-5 text-gray-500">
        this fields are not editable
      </p>

      <div className="py-4">
        <List>
          {defaultFields.map((o, i) => (
            <FieldsItems
              primary={o.name}
              secondary={o.type}
              // terciary={}
            />
          ))}
        </List>
      </div>

      {renderSubmitButton()}
    </div>
  )
}

function FieldsItems ({ primary, secondary, terciary }) {
  return (
    <ListItem divider={true}>
      <ListItemText
        primary={
          <ItemListPrimaryContent variant="h5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {primary}
            </h3>
          </ItemListPrimaryContent>
        }
        secondary={
          <ItemListSecondaryContent>
            <p className="mt-2 max-w-xl text-sm leading-5 text-gray-500">
              {secondary}
            </p>
          </ItemListSecondaryContent>
        }
        terciary={terciary}
      />
    </ListItem>
  )
}

function FieldsForm ({ selected }) {
  const [field, setField] = useState(selected || {})

  function setName (e) {
    setField(Object.assign({}, field, { name: e.target.value }))
  }

  function setType (e) {
    setField(Object.assign({}, field, { type: e.value }))
  }

  const options = [
    { value: 'string', label: 'Text' },
    { value: 'integer', label: 'Number' },
    { value: 'date', label: 'Date' }
  ]

  function selectedOption () {
    const selected = options.find((o) => o.value === field.type)
    if (selected) return selected
  }

  return (
    <React.Fragment>
      <Input
        variant="outlined"
        margin="normal"
        required
        fullWidth
        name="name"
        label="Field name"
        type={'text'}
        // type="password"
        // id="password"
        autoFocus
        // error={errorsFor('password')}
        value={field.name}
        onChange={setName}
      />

      <Input
        name={'type'}
        value={field.label}
        defaultValue={selectedOption()}
        onChange={(e) => setType(e)}
        label={'field type'}
        type={'select'}
        data={{}}
        options={options}
      ></Input>
    </React.Fragment>
  )
}

function Field ({ field, handleEdit, removeField, index }) {
  return (
    <ListItem>
      <ListItemText primary={field.name} secondary={field.type} />

      {handleEdit && (
        <ItemListSecondaryContent>
          <Button
            variant="icon"
            onClick={() => handleEdit(index)}
            edge="end"
            aria-label="delete"
          >
            <EditIcon />
          </Button>

          <Button
            onClick={() => removeField(index)}
            edge="end"
            variant="icon"
            aria-label="add"
          >
            <DeleteIcon />
          </Button>
        </ItemListSecondaryContent>
      )}
    </ListItem>
  )
}

function mapStateToProps (state) {
  const { app } = state
  return {
    app
  }
}

export default withRouter(connect(mapStateToProps)(CustomizationColors))
