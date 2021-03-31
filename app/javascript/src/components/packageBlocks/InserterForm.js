import React from 'react'
import FormDialog from '../../components/FormDialog'
import Button from '../../components/Button'
import ErrorBoundary from '../../components/ErrorBoundary'
import {
  AppList,
} from './AppList'

export default function InserterForm({
	isOpen, 
	closeHandler,
	loading,
	handleAdd,
	packages,
	app,
}){
	return (
		<div>
        {isOpen && (
          <FormDialog
            open={isOpen}
            handleClose={closeHandler}
            titleContent={'Add apps to chat home'}
            formComponent={
              <div className="h-64 overflow-auto">

                <ErrorBoundary>
                  <AppList
                    location={'home'}
                    loading={loading}
                    handleAdd={handleAdd}
                    packages={packages}
                    app={app}
                  />
                </ErrorBoundary>

              </div>
            }
            dialogButtons={
              <React.Fragment>

                {/* <Button onClick={deleteHandler} className="ml-2" variant="danger">
                {I18n.t('common.delete')}
              </Button> */}
                <Button onClick={closeHandler} variant="outlined">
                  {I18n.t('common.cancel')}
                </Button>
              </React.Fragment>
            }
          ></FormDialog>
        )}
      </div>
	)
}