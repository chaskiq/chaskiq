import React, { Fragment, useState, useEffect } from 'react'
import FormDialog from './FormDialog'
import Button from './Button'

export default function DeleteDialog ({
  children,
  title,
  deleteHandler,
  closeHandler
}) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(true)
  }, [])

  function close () {
    setIsOpen(false)
    closeHandler && closeHandler()
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
            </form>
          }
          dialogButtons={
            <React.Fragment>
              <Button onClick={close}
                color="secondary">
                Cancel
              </Button>

              <Button onClick={deleteHandler }
                color="primary">
                Delete
              </Button>

            </React.Fragment>
          }
        >
        </FormDialog>
      )}

    </div>

  )
}
