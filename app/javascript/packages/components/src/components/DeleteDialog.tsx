import React, { useState, useEffect } from 'react';
import FormDialog from './FormDialog';
import Button from './Button';
import I18n from '../../../../src/shared/FakeI18n';
interface DeleteDialogProps {
  children?: React.ReactNode;
  title: string;
  deleteHandler: Function;
  closeHandler?: Function;
  open: boolean;
}

export default function DeleteDialog({
  children,
  title,
  deleteHandler,
  closeHandler,
}: DeleteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  function close() {
    setIsOpen(false);
    closeHandler && closeHandler();
  }

  return (
    <div>
      {isOpen && (
        <FormDialog
          open={isOpen}
          handleClose={closeHandler}
          titleContent={title}
          formComponent={<form>{children}</form>}
          dialogButtons={
            <React.Fragment>
              <Button onClick={deleteHandler} className="ml-2" variant="danger">
                {I18n.t('common.delete')}
              </Button>
              <Button onClick={close} variant="outlined">
                {I18n.t('common.cancel')}
              </Button>
            </React.Fragment>
          }
        ></FormDialog>
      )}
    </div>
  );
}
