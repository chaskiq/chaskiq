import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import serialize from 'form-serialize';
import I18n from '../../shared/FakeI18n';

import Hints from '@chaskiq/components/src/components/Hints';
import List, {
  ListItem,
  ListItemText,
  ItemListPrimaryContent,
  ItemListSecondaryContent,
} from '@chaskiq/components/src/components/List';
import Button from '@chaskiq/components/src/components/Button';
import FormDialog from '@chaskiq/components/src/components/FormDialog';
import UpgradeButton from '@chaskiq/components/src/components/upgradeButton';
import Input from '@chaskiq/components/src/components/forms/Input';
import defaultFields from '@chaskiq/components/src/utils/defaultFields';
import {
  DeleteIcon,
  PlusIcon,
  EditIcon,
} from '@chaskiq/components/src/components/icons';

function UserDataFields({ app, _settings, update, _dispatch }) {
  const [fields, setFields] = useState(app.customFields || []);
  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const form = React.useRef(null);

  function addField() {
    setOpen(true);
  }

  function close() {
    setSelected(null);
    setOpen(false);
  }

  function submit() {
    setFields(handleFields());
    setOpen(false);
  }

  function handleFields() {
    const s = serialize(form.current, { hash: true, empty: true });

    if (selected === null) {
      return fields.concat(s);
    }

    return fields.map((o, i) => {
      if (i === selected) {
        return s;
      }
      return o;
    });
  }

  function renderModal() {
    const selectedItem = fields[selected];

    return (
      isOpen && (
        <FormDialog
          open={isOpen}
          handleClose={close}
          // contentText={"lipsum"}
          titleContent={I18n.t('settings.user_data.modal.title')}
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
    );
  }

  function handleEdit(o) {
    setSelected(o);
    setOpen(true);
  }

  function removeField(index) {
    const newFields = fields.filter((o, i) => i !== index);
    setFields(newFields);
  }

  function renderSubmitButton() {
    return (
      <Button
        variant={'success'}
        color={'primary'}
        onClick={() =>
          update({
            app: {
              custom_fields: fields,
            },
          })
        }
      >
        {I18n.t('common.save')}
      </Button>
    );
  }

  return (
    <div className="py-4">
      <Hints type="user_data" />

      <div className="flex items-center justify-between">
        <p className="text-lg leading-6 font-medium  text-gray-900 dark:text-gray-100 py-4">
          {I18n.t('settings.user_data.title')}
        </p>

        <div className="flex w-1/4 justify-end items-center">
          <UpgradeButton
            classes={`absolute z-10 ml-1 mt-3 transform w-screen 
              max-w-md px-2 origin-top-right right-0
              md:-ml-4 sm:px-0 lg:ml-0
              lg:right-2/6 lg:translate-x-1/6`}
            label="Add custom attribute"
            feature="CustomAttributes"
          >
            <Button
              onClick={addField}
              variant="outlined"
              className="mr-2"
              aria-label="add"
            >
              <PlusIcon /> {I18n.t('common.add_new')}
            </Button>
          </UpgradeButton>

          {renderSubmitButton()}
        </div>
      </div>

      {renderModal()}

      <div className="py-4">
        <List>
          {fields.map((o, i) => (
            <FieldsItems
              key={`fields-items-${o.name}-${i}`}
              primary={o.name}
              // secondary={o.type}
              secondary={I18n.t(`settings.user_data.attr_types.${o.type}`)}
              terciary={
                <React.Fragment>
                  <Button
                    variant="icon"
                    onClick={() => handleEdit(i)}
                    aria-label="delete"
                  >
                    <EditIcon />
                  </Button>

                  <Button
                    variant="icon"
                    onClick={() => removeField(i)}
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

      <p className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
        {I18n.t('settings.user_data.default_fields')}
      </p>

      <p className="mt-2 max-w-xl text-sm leading-5 text-gray-500 dark:text-gray-300">
        {I18n.t('settings.user_data.non_editable')}
      </p>

      <div className="py-4">
        <List>
          {defaultFields.map((o, i) => (
            <FieldsItems
              key={`default-fields-${o.type}-${i}`}
              primary={o.name}
              // secondary={o.type}
              secondary={I18n.t(`settings.user_data.attr_types.${o.type}`)}
            />
          ))}
        </List>
      </div>

      {renderSubmitButton()}
    </div>
  );
}

type FieldsItemsType = {
  primary: React.ReactChild;
  secondary: React.ReactChild;
  terciary?: React.ReactChild;
};

function FieldsItems({ primary, secondary, terciary }: FieldsItemsType) {
  return (
    <ListItem divider={true}>
      <ListItemText
        primary={
          <ItemListPrimaryContent>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              {primary}
            </h3>
          </ItemListPrimaryContent>
        }
        secondary={
          <ItemListSecondaryContent>
            <p className="mt-2 max-w-xl text-sm leading-5 text-gray-500 dark:text-gray-300">
              {secondary}
            </p>
          </ItemListSecondaryContent>
        }
        terciary={terciary}
      />
    </ListItem>
  );
}

function FieldsForm({ selected }) {
  const [field, setField] = useState(selected || {});

  function setName(e) {
    setField(Object.assign({}, field, { name: e.target.value }));
  }

  function setType(e) {
    setField(Object.assign({}, field, { type: e.value }));
  }

  const options = [
    {
      value: 'string',
      label: I18n.t('settings.user_data.attr_types.string'),
    },
    {
      value: 'integer',
      label: I18n.t('settings.user_data.attr_types.integer'),
    },
    {
      value: 'date',
      label: I18n.t('settings.user_data.attr_types.date'),
    },
  ];

  function selectedOption() {
    const selected = options.find((o) => o.value === field.type);
    if (selected) return selected;
  }

  return (
    <React.Fragment>
      <Input
        name="name"
        label={I18n.t('settings.user_data.inputs.name')}
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
        label={I18n.t('settings.user_data.inputs.type')}
        type={'select'}
        data={{}}
        options={options}
      ></Input>

      {/*<Input
        name={'validation'}
        value={field.validation}
        onChange={setValidation}
        label={I18n.t('settings.user_data.inputs.validation')}
        helperText={I18n.t('settings.user_data.inputs.validation_hint')}
        type={'textarea'}
      ></Input>*/}
    </React.Fragment>
  );
}

function mapStateToProps(state) {
  const { app } = state;
  return {
    app,
  };
}

export default withRouter(connect(mapStateToProps)(UserDataFields));
