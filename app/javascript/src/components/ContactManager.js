import React from 'react'
import FilterMenu from './FilterMenu'
import Button from './Button'
import FormDialog from './FormDialog'
import Progress from './Progress'

import FieldRenderer from './forms/FieldRenderer'
import { connect } from 'react-redux'
import { getFileMetadata, directUpload } from '../shared/fileUploader'
import graphql from '../graphql/client'
import { CREATE_DIRECT_UPLOAD, IMPORT_CONTACTS } from '../graphql/mutations'
import { successMessage } from '../actions/status_messages'

import serialize from 'form-serialize'

function optionsForFilter () {
  const options = [
    /*{
      title: 'Create User',
      description: 'Created user',
      // icon: <ArchiveIcon/>,
      id: 'create-user',
      state: 'create-user'
    },
    {
      title: 'Create Lead',
      description: 'Adds a lead',
      // icon: <BlockIcon/>,
      id: 'create-lead',
      state: 'create-lead'
    },*/

    {
      title: 'Import CSV',
      description: 'Imports CSV',
      // icon: <UnsubscribeIcon/>,
      id: 'import-csv',
      state: 'import-csv'
    }
  ]

  return options
}

function toggleButton (clickHandler) {
  return (
    <div>
      <Button
        onClick={clickHandler}>
        Create Users & Leads
      </Button>
    </div>
  )
}

function ContactManager ({ app, current_user, dispatch }) {
  const [open, setOpen] = React.useState(null)
  const [selectedItem, setSelectedItem] = React.useState(null)
  const [csv, setCSV] = React.useState(null)

  const [enableForm, setEnableForm] = React.useState(null)

  const formRef = React.useRef()

  function formDefinitions () {
    return [

      {
        id: 'import-user',
        name: 'import_type',
        type: 'radio',
        label: 'import user',
        value: 'user'
      },

      {
        id: 'import-lead',
        name: 'import_type',
        type: 'radio',
        label: 'import lead',
        value: 'lead'
      },

      {
        name: 'csv',
        type: 'upload',
        accept: '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
        handler: (file) => uploadHandler(file, 'csv'),
        grid: { xs: 'w-full', sm: 'w-1/3' }
      }
    ]
  };

  function formDefinitionsForUser () {
    return [
      {
        name: 'activeMessenger',
        label: I18n.t('definitions.settings.active_messenger.label'),
        hint: I18n.t('definitions.settings.active_messenger.hint'),
        type: 'bool',
        grid: { xs: 'w-full', sm: 'w-full' }
      },

      {
        name: 'enableArticlesOnWidget',
        label: I18n.t('definitions.settings.enable_articles.label'),
        hint: I18n.t('definitions.settings.enable_articles.hint'),
        type: 'bool',
        grid: { xs: 'w-full', sm: 'w-full' }
      }
    ]
  }

  function submitHandler (e) {
    console.log('sends:;', enableForm)

    graphql(IMPORT_CONTACTS, {
      appKey: app.key,
      appParams: { ...enableForm, email: current_user.email }
    }, {
      success: (data) => {
        setSelectedItem(null)
        dispatch(
          successMessage(
            'Processing file import, you will be notified the status soon'
          )
        )
      },
      error: () => {}
    })
  }

  function handleCreateForm (e) {
    switch (e.state) {
      case 'import-csv':
        setSelectedItem(e.state)
        break
      default:
        break
    }
  }

  function closeHandler () {
    setSelectedItem(null)
  }

  function enableSubmit (data) {
    setEnableForm(data)
  }

  function renderForm () {
    switch (selectedItem) {
      case 'import-csv':
        return <CsvUploader enableSubmit={enableSubmit}/>
      default:
        break
    }
  }

  function renderFormFor (definitions) {
    return definitions.map((field, i) => {
      return (
        <div
          key={`field-${field.name}-${i}`}
          // className={`${gridClasses(field)} py-2 pr-2`}
          {...field.gridProps}
        >
          <FieldRenderer
            {...field}
            // namespace={'doorkeeper_application'}
            data={field}
            props={{
              data: {} // data
            }}
            errors={{}}
            // errors={errors}
          />
        </div>
      )
    })
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
          titleContent={'Import contacts'}
          formComponent={
            renderForm()
          }
          dialogButtons={
            <React.Fragment>
              {enableForm &&
								<Button
								  onClick={submitHandler}
								  className="ml-2"
								  variant="success">
								  {I18n.t('common.save')}
								</Button>
              }
              <Button
                onClick={() => setSelectedItem(null)}
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

function CsvUploader ({ handleSubmit, enableSubmit }) {
  const formRef = React.useRef()
  const [loading, setLoading] = React.useState(false);

  function uploadHandler (file, kind) {
    setLoading(true)
    getFileMetadata(file).then((input) => {
      graphql(CREATE_DIRECT_UPLOAD, input, {
        success: (data) => {
          const {
            signedBlobId,
            headers,
            url,
            serviceUrl
          } = data.createDirectUpload.directUpload

          directUpload(url, JSON.parse(headers), file).then(() => {
            // setFile({ signedBlobId })
            const data = serialize(formRef.current, { hash: true, empty: true })
            data.file = signedBlobId
            submitHandler(data)
            setLoading(false)
          })
        },
        error: (error) => {
          setLoading(false)
          console.log('error on signing blob', error)
        }
      })
    })
  };

  function submitHandler (data) {
    enableSubmit(data)
  }

  return <div className="border-t border-gray-200 pt-2">

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
        You can upload a csv or excel file in order to import contacts
        </p>
      </div>
      <div className="mt-6">
        <fieldset className="mt-6">
          <legend className="text-base font-medium text-gray-900">
          Import Type
          </legend>
          <p className="text-sm leading-5 text-gray-500">
					Choose what kind of contacts you will import
          </p>
          <div className="mt-4">
            <div className="flex items-center">
              <input id="leads"
                name="contact_type"
                type="radio"
                value="leads"
                defaultChecked={true}
                className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
              />
              <label htmlFor="leads" className="ml-3">
                <span className="block text-sm leading-5 font-medium text-gray-700">Leads</span>
              </label>
            </div>

            <div className="mt-4 flex items-center">
              <input id="users"
                name="contact_type"
                type="radio"
                value={'users'}
                className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
              />
              <label htmlFor="users" className="ml-3">
                <span className="block text-sm leading-5 font-medium text-gray-700">Users</span>
              </label>
            </div>

            <FileUpload 
              onChange={(file) => uploadHandler(file, 'csv')}
              loading={loading}
            />

          </div>
        </fieldset>
      </div>
    </form>
  </div>
}

function FileUpload ({ onChange, loading }) {
  return <div className="flex items-center justify-center bg-grey-lighter">
    <label className="w-48 flex flex-col items-center px-2 py-3 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-black hover:text-white">
      <svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
        <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
      </svg>
      {
        loading && <Progress size={8} />
      }

      <span className="mt-2 text-base leading-normal">Select a file</span>
      <input
        type='file'
        className="hidden"
        onChange={(e) => onChange(e.currentTarget.files[0])}
        accept={'.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel'}
      />
    </label>
  </div>
}

function mapStateToProps (state) {
  const { app, current_user } = state
  return {
    app,
    current_user
  }
}

export default connect(mapStateToProps)(ContactManager)
