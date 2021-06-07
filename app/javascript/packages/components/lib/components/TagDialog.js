import React, { useState, useEffect } from 'react'
import FormDialog from './FormDialog'
import Button from './Button'
// import { Creatable } from 'react-select'
import Select from 'react-select'
import { Link } from 'react-router-dom'

import { connect } from 'react-redux'

function TagDialog ({
  children,
  title,
  saveHandler,
  closeHandler,
  tags,
  app
}) {
  const tagList = tags.map((o) => ({
    label: o, value: o
  }))

  const [isOpen, setIsOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState(tagList)

  useEffect(() => {
    setIsOpen(true)
  }, [])

  function close () {
    setIsOpen(false)
    closeHandler && closeHandler()
  }

  const colourOptions = app.tagList.map((o) => ({
    label: o.name, value: o.name, color: o.color
  }))

  function handleChange (changes) {
    setSelectedTags(changes)
  }

  return (
    <div>
      {isOpen && (
        <FormDialog
          open={isOpen}
          handleClose={closeHandler}
          titleContent={title}
          formComponent={
            <form>
              {children}

              <Select
                isClearable
                isMulti
                defaultValue={tagList}
                onChange={handleChange}
                // onInputChange={handleInputChange}
                options={colourOptions}
              />

              <p className="text-sm leading-5 text-gray-500">
                { I18n.t('settings.tags.modal.hint') } {' '}
                <Link to={`/apps/${app.key}/settings`}
                  className="no-underline hover:underline text-green-500">
                  { I18n.t('settings.tags.modal.link') }
                </Link>
              </p>

            </form>
          }
          dialogButtons={
            <React.Fragment>
              <Button
                className="ml-2"
                onClick={ () => saveHandler(selectedTags.map((o) => o.value)) }
                variant="success">
                {I18n.t('common.save')}
              </Button>
              <Button onClick={close}
                variant="outlined">
                {I18n.t('common.cancel')}
              </Button>
            </React.Fragment>
          }
        ></FormDialog>
      )}
    </div>
  )
}

function mapStateToProps (state) {
  const { app } = state
  return {
    app
  }
}

export default connect(mapStateToProps)(TagDialog)
