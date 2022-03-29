import React from 'react';
import langsOptions from '../../shared/langsOptions';
import serialize from 'form-serialize';
import I18n from '../../shared/FakeI18n';

import Button from '@chaskiq/components/src/components/Button';
import Input from '@chaskiq/components/src/components/forms/Input';
import FormDialog from '@chaskiq/components/src/components/FormDialog';
import DataTable from '@chaskiq/components/src/components/Table';
import { toSnakeCase } from '@chaskiq/components/src/utils/caseConverter';

export default function LanguageForm({ settings, update, namespace, fields }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedLang, _setSelectedLang] = React.useState(null);
  const formRef = React.createRef<HTMLFormElement>();

  function handleChange(value) {
    /*const serializedData = serialize(formRef.current, {
      hash: true,
      empty: true
    })*/
    //const data = toSnakeCase(serializedData)

    const next = {};

    fields.map((field) => {
      if (field !== 'locale') {
        next[`${field}_${value}`] = '';
      }
    });

    const newData = Object.assign({}, { key: settings.key }, next);
    update({ app: newData });
    return toggleDialog();

    /*const n = {
      translations: {
        [value]: {
          greetings: '-',
          intro: '-',
          tagline: '-',
        },
      },
    };

    const newData = Object.assign({}, { key: settings.key }, n);
    update({ app: newData });
    toggleDialog();*/
  }

  function close() {
    setIsOpen(false);
  }

  function renderLangDialog() {
    return (
      isOpen && (
        <FormDialog
          open={isOpen}
          handleClose={close}
          // contentText={"lipsum"}
          titleContent={I18n.t('settings.languages.add')}
          formComponent={
            //! loading ?
            <form onSubmit={() => false}>
              <Input
                label={I18n.t('definitions.settings.languages.select_lang')}
                type={'select'}
                value={selectedLang}
                // defaultValue={{label: item.to, value: item.to}}
                name={'age'}
                data={{}}
                onChange={(e) => handleChange(e.value)}
                options={langsOptions}
              ></Input>
            </form>
            // : <CircularProgress/>
          }
          dialogButtons={
            <React.Fragment>
              <Button onClick={toggleDialog} variant="outlined">
                {I18n.t('common.cancel')}
              </Button>

              <Button // onClick={this.submitAssignment }
                className="mr-1"
              >
                {I18n.t('common.update')}
              </Button>
            </React.Fragment>
          }
          // actions={actions}
          // onClose={this.close}
          // heading={this.props.title}
        ></FormDialog>
      )
    );
  }

  function toggleDialog() {
    setIsOpen(!isOpen);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const serializedData = serialize(formRef.current, {
      hash: true,
      empty: true,
    });
    const data = toSnakeCase(serializedData);
    update(data);
  }

  function columns() {
    const cols = fields.map((field) => ({
      field: field,
      title: I18n.t(`data_tables.settings.${field}`),
      render: (row) => {
        return (
          row && (
            <div
              // onClick={(e)=>(showUserDrawer && showUserDrawer(row))}
              className="flex items-center"
            >
              {field === 'locale' ? (
                <p className="block text-gray-700 text-sm font-bold mb-2">
                  {row[field]}
                </p>
              ) : (
                <Input
                  type={'text'}
                  // id="standard-name"
                  label={false}
                  defaultValue={row[field]}
                  //name={`${namespace}["translations"][${row.locale}][${field}]`}
                  name={`${namespace}[${field}_${row.locale}]`}
                />
              )}
            </div>
          )
        );
      },
    }));

    return cols;
    // return [{field: 'lang', title: 'lang', value: field}].concat(cols)
  }

  return (
    <div className="py-4">
      <p
        className="text-lg leading-6 font-medium
        text-gray-900 pb-4"
      >
        {I18n.t('settings.languages.title')}
      </p>

      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <Button onClick={toggleDialog} variant={'outlined'}>
          {I18n.t('settings.languages.add')}
        </Button>

        <div className="py-4">
          {<DataTable data={settings.translations} columns={columns()} />}
        </div>

        <div className="flex justify-start">
          <Button
            onClick={handleSubmit}
            variant={'success'}
            color={'primary'}
            size="md"
          >
            {I18n.t('common.save')}
          </Button>
        </div>
      </form>

      {renderLangDialog()}
    </div>
  );
}
