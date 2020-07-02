import React, { useState, useEffect } from 'react'
import FormDialog from './FormDialog'
import Button from './Button'
import { Creatable } from 'react-select'

export default function TagDialog ({
  children,
  title,
  saveHandler,
  closeHandler,
  tags
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

  const colourOptions = [
    { label: 'aa', value: 'aa' },
    { label: 'bb', value: 'bb' },
    { label: 'vv', value: 'vv' }
  ]

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

              <Creatable
                isClearable
                isMulti
                defaultValue={tagList}
                onChange={handleChange}
                // onInputChange={handleInputChange}
                options={colourOptions}
              />

            </form>
          }
          dialogButtons={
            <React.Fragment>
              <Button
                className="ml-2"
                onClick={ () => saveHandler(selectedTags.map((o) => o.value)) }
                variant="success">
                Save
              </Button>
              <Button onClick={close}
                variant="outlined">
                Cancel
              </Button>
            </React.Fragment>
          }
        ></FormDialog>
      )}
    </div>
  )
}
