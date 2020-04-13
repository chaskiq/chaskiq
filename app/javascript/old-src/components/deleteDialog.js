import React, {Fragment, useState, useEffect} from 'react'
import FormDialog from './FormDialog'
import Button from "@material-ui/core/Button"

export default function DeleteDialog({
  children, 
  title, 
  deleteHandler,
  closeHandler
}){

  const [isOpen, setIsOpen] = useState(false)

  useEffect( ()=>{ 
    setIsOpen(true)
  }, [])

  function close(){
    setIsOpen(false)
    closeHandler && closeHandler()
  }

  return (

    <div>
    
      {isOpen && (
        <FormDialog 
          open={isOpen}
          handleClose={closeHandler}
          //contentText={"lipsum"}
          titleContent={title}
          formComponent={
            //!loading ?
              <form>
                {children}
              </form> 
              //: <CircularProgress/>
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
          //actions={actions} 
          //onClose={this.close} 
          //heading={this.props.title}
          >
        </FormDialog>
      )}
    
    </div>


  )
}