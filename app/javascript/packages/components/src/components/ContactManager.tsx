import React from 'react';
import FilterMenu from './FilterMenu';
import Button from './Button';
import FormDialog from './FormDialog';
import Progress from './Progress';

import { Link } from 'react-router-dom';
import { isEmpty } from 'lodash';
import { connect } from 'react-redux';
import { getFileMetadata, directUpload } from './fileUploader';
import serialize from 'form-serialize';

import graphql from '@chaskiq/store/src/graphql/client';

import I18n from '../../../../src/shared/FakeI18n';
import SettingsForm from '../../../../src/pages/settings/form';

import { successMessage } from '@chaskiq/store/src/actions/status_messages';

import {
  APP_USER_CREATE,
  CREATE_DIRECT_UPLOAD,
  IMPORT_CONTACTS,
} from '@chaskiq/store/src/graphql/mutations';

function optionsForFilter() {
  const options = [
    {
      title: 'Create Contact',
      description: 'Adds a lead or verified user',
      // icon: <BlockIcon/>,
      id: 'create-contact',
      state: 'create-contact',
    },
    {
      title: 'Import CSV',
      description: 'Imports CSV',
      // icon: <UnsubscribeIcon/>,
      id: 'import-csv',
      state: 'import-csv',
    },
  ];

  return options;
}

function toggleButton(clickHandler) {
  return (
    <div>
      <Button variant="flat-dark" onClick={clickHandler}>
        {I18n.t('contact_manager.create')}
      </Button>
    </div>
  );
}

type ContactManagerType = {
  app: any;
  current_user: any;
  dispatch: (value: any) => void;
};

function ContactManager({ app, current_user, dispatch }: ContactManagerType) {
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [enableForm, setEnableForm] = React.useState(null);

  function submitHandler(_e) {
    console.log('sends:;', enableForm);

    graphql(
      IMPORT_CONTACTS,
      {
        appKey: app.key,
        appParams: { ...enableForm, email: current_user.email },
      },
      {
        success: () => {
          setSelectedItem(null);
          dispatch(successMessage(I18n.t('contact_manager.success_message')));
        },
        error: () => {},
      }
    );
  }

  function handleCreateForm(e) {
    setSelectedItem(e.state);
    /*switch (e.state) {
      case 'import-csv':
        setSelectedItem(e.state);
        break;
      default:
        break;
    }*/
  }

  function closeHandler() {
    setSelectedItem(null);
  }

  function enableSubmit(data) {
    setEnableForm(data);
  }

  function renderForm() {
    switch (selectedItem) {
      case 'import-csv':
        return <CsvUploader enableSubmit={enableSubmit} />;
      case 'create-contact':
        return <ContactForm app={app} dispatch={dispatch} />;

      default:
        break;
    }
  }

  return (
    <div>
      <FilterMenu
        options={optionsForFilter()}
        value={null}
        filterHandler={(e) => handleCreateForm(e)}
        triggerButton={toggleButton}
        position={'right'}
      />

      {selectedItem && (
        <FormDialog
          open={selectedItem}
          handleClose={closeHandler}
          titleContent={''}
          formComponent={renderForm()}
          dialogButtons={
            <React.Fragment>
              {enableForm && (
                <Button
                  onClick={submitHandler}
                  className="ml-2"
                  variant="success"
                >
                  {I18n.t('common.save')}
                </Button>
              )}
              <Button onClick={() => setSelectedItem(null)} variant="outlined">
                {I18n.t('common.cancel')}
              </Button>
            </React.Fragment>
          }
        ></FormDialog>
      )}
    </div>
  );
}

function CsvUploader({ enableSubmit }) {
  const formRef = React.useRef();
  const [loading, setLoading] = React.useState(false);

  function uploadHandler(file, _kind) {
    setLoading(true);
    getFileMetadata(file).then((input) => {
      graphql(CREATE_DIRECT_UPLOAD, input, {
        success: (data) => {
          const {
            signedBlobId,
            headers,
            url,
            //serviceUrl
          } = data.createDirectUpload.directUpload;

          directUpload(url, JSON.parse(headers), file).then(() => {
            // setFile({ signedBlobId })
            const data = serialize(formRef.current, {
              hash: true,
              empty: true,
            });
            data.file = signedBlobId;
            submitHandler(data);
            setLoading(false);
          });
        },
        error: (error) => {
          setLoading(false);
          console.log('error on signing blob', error);
        },
      });
    });
  }

  function submitHandler(data) {
    enableSubmit(data);
  }

  return (
    <div className="border-t border-gray-200 pt-2">
      <h2 className="text-xl mb-2">
        {I18n.t('contact_manager.import_contacts')}
      </h2>
      <form
        name="create-repo"
        onSubmit={
          (d) => console.log(d)
          // updateApp
        }
        ref={formRef}
      >
        <div>
          <p className="mt-1 text-sm leading-5 text-gray-500">
            {I18n.t('contact_manager.import_exp')}
          </p>
        </div>
        <div className="mt-6">
          <fieldset className="mt-6">
            <legend className="text-base font-medium text-gray-900 dark:text-gray-50">
              {I18n.t('contact_manager.import_type')}
            </legend>
            <p className="text-sm leading-5 text-gray-500 dark:text-gray-100">
              {I18n.t('contact_manager.import_choose')}
            </p>
            <div className="mt-4">
              <ContactTypeInput kind={'leads'} />
              <ContactTypeInput kind={'users'} />
              <FileUpload
                onChange={(file) => uploadHandler(file, 'csv')}
                loading={loading}
              />
            </div>
          </fieldset>
        </div>
      </form>
    </div>
  );
}

function ContactTypeInput({ kind }) {
  return (
    <div className="mt-4 flex items-center">
      <input
        id={kind}
        name="contact_type"
        type="radio"
        value={kind}
        className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
      />
      <label htmlFor={kind} className="ml-3">
        <span className="block text-sm leading-5 font-medium text-gray-700 dark:text-gray-300">
          {I18n.t(`common.${kind}`)}
        </span>
      </label>
    </div>
  );
}

type AppUserType = {
  id?: number;
  email?: string;
  name?: string;
  avatarUrl?: string;
  kind?: string;
};

function ContactForm({ app, dispatch }) {
  const [appUser, setAppUser] = React.useState<AppUserType>({
    kind: 'AppUser',
  });

  const [errors, setErrors] = React.useState(null);

  function createNewContact(data) {
    graphql(
      APP_USER_CREATE,
      {
        appKey: app.key,
        options: data,
      },
      {
        success: (data) => {
          if (!isEmpty(data.createAppUser.errors)) {
            setErrors(data.createAppUser.errors);
          } else {
            dispatch(successMessage(I18n.t('status_messages.created_success')));
            setAppUser(data.createAppUser.appUser);
          }
        },
        error: (err) => {},
      }
    );
  }

  function definitionsForSettings() {
    return [
      {
        name: 'contact_kind',
        label: I18n.t('contact_manager.definitions.app_user'),
        value: 'AppUser',
        type: 'radio',
        defaultChecked: appUser.kind === 'AppUser',
        grid: { xs: 'w-full', sm: 'w-1/2' },
      },

      {
        name: 'contact_kind',
        label: I18n.t('contact_manager.definitions.lead'),
        type: 'radio',
        value: 'Lead',
        defaultChecked: appUser.kind === 'Lead',
        grid: { xs: 'w-full', sm: 'w-1/2' },
      },

      {
        name: 'name',
        label: I18n.t('definitions.settings.name.label'),
        type: 'string',
        grid: { xs: 'w-full', sm: 'w-full' },
        gridProps: { style: { alignSelf: 'flex-end' } },
      },

      {
        name: 'email',
        type: 'string',
        label: 'email',
        grid: { xs: 'w-full', sm: 'w-1/2' },
      },
      {
        name: 'phone',
        label: I18n.t('contact_manager.definitions.phone'),
        type: 'text',
        grid: { xs: 'w-full', sm: 'w-1/2' },
      },
      {
        name: 'company_name',
        label: I18n.t('contact_manager.definitions.company_name'),
        type: 'text',
        grid: { xs: 'w-full', sm: 'w-full' },
      },
    ];
  }

  return (
    <div>
      {!appUser.id && (
        <div>
          <h2 className="text-xl mb-2">{I18n.t('contact_manager.create')}</h2>

          <SettingsForm
            title={''}
            data={{
              errors: errors,
            }}
            update={createNewContact}
            classes={''}
            definitions={definitionsForSettings}
          />
        </div>
      )}
      {appUser && appUser.id && (
        <Link
          to={`/apps/${app.key}/users/${appUser.id}`}
          className="group p-2 w-full flex items-center justify-between rounded-full border border-gray-300 shadow-sm space-x-3 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="min-w-0 flex-1 flex items-center space-x-3">
            <span className="block flex-shrink-0">
              <img
                className="h-10 w-10 rounded-full"
                src={appUser.avatarUrl}
                alt=""
              />
            </span>
            <span className="block min-w-0 flex-1">
              <span className="block text-sm font-medium text-gray-900 truncate">
                {appUser.name}
              </span>
              <span className="block text-sm font-medium text-gray-500 truncate">
                {appUser.email}
              </span>
            </span>
          </span>
          <span className="flex-shrink-0 h-10 w-10 inline-flex items-center justify-center">
            <svg
              className="h-5 w-5 text-gray-400 group-hover:text-gray-500"
              x-description="Heroicon name: solid/plus"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </span>
        </Link>
      )}
    </div>
  );
}

function FileUpload({ onChange, loading }) {
  return (
    <div className="flex items-center justify-center bg-grey-lighter">
      <label className="w-48 flex flex-col items-center px-2 py-3 bg-white dark:bg-gray-800 text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-black hover:text-white">
        <svg
          className="w-8 h-8"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
        </svg>
        {loading && <Progress size={8} />}

        <span className="mt-2 text-xs leading-normal">
          {I18n.t('contact_manager.select_file')}
        </span>
        <input
          type="file"
          className="hidden"
          onChange={(e) => onChange(e.currentTarget.files[0])}
          accept={
            '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'
          }
        />
      </label>
    </div>
  );
}

function mapStateToProps(state) {
  const { app, current_user } = state;
  return {
    app,
    current_user,
  };
}

export default connect(mapStateToProps)(ContactManager);
