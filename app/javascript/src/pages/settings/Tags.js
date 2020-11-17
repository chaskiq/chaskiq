import React, { useState } from 'react'

import Button from '../../components/Button'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import FormDialog from '../../components/FormDialog'
import Hints from '../../shared/Hints'
import List, {
  ListItem,
  ListItemText,
  ItemListPrimaryContent,
  ItemListSecondaryContent
} from '../../components/List'
import serialize from 'form-serialize'

import { DeleteIcon, PlusIcon, EditIcon } from '../../components/icons'

import Input from '../../components/forms/Input'

function CustomizationColors ({ app, update, dispatch }) {
  const [fields, setFields] = useState(app.tagList || [])
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
          titleContent={I18n.t('settings.tags.modal.title')}
          formComponent={
            <form ref={form}>
              <FieldsForm selected={selectedItem} />
            </form>
          }
          dialogButtons={
            <React.Fragment>
              <Button onClick={close} variant={'outlined'}>
                {I18n.t('common.cancel')}
              </Button>

              <Button onClick={submit} className="mr-1">
                {I18n.t('common.create')}
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
        variant={'success'}
        color={'primary'}
        onClick={() =>
          update({
            app: {
              tag_list: fields
            }
          })
        }
      >
        {I18n.t('common.save')}
      </Button>
    )
  }

  return (
    <div className="py-4">

      <Hints type="tags" />

      <div className="flex items-center justify-between">
        <p className="text-lg leading-6 font-medium  text-gray-900 py-4">
          {I18n.t('settings.tags.title')}
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
              key={`fields-items-${o.name}-${i}`}
              primary={o.name}
              // secondary={o.type}
              secondary={ o.color }
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

  function setColor (e) {
    setField(Object.assign({}, field, { color: e.value }))
  }

  return (
    <React.Fragment>
      <Input
        variant="outlined"
        margin="normal"
        required
        fullWidth
        name="name"
        label={ I18n.t('settings.tags.inputs.name')}
        type={'text'}
        // type="password"
        // id="password"
        autoFocus
        // error={errorsFor('password')}
        value={field.name}
        onChange={setName}
      />

      <Input
        variant="outlined"
        margin="normal"
        required
        fullWidth
        name="color"
        label={ I18n.t('settings.tags.inputs.color')}
        type={'color'}
        // type="password"
        // id="password"
        autoFocus
        // error={errorsFor('password')}
        value={field.color}
        onChange={setColor}
      />

    </React.Fragment>
  )
}

function mapStateToProps (state) {
  const { app } = state
  return {
    app
  }
}

export default withRouter(connect(mapStateToProps)(CustomizationColors))
