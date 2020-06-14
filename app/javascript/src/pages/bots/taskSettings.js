import React, { useState, useEffect, useRef } from 'react'
import Button from '../../components/Button'
import Input from '../../components/forms/Input'
import FormDialog from '../../components/FormDialog'
import I18n from '../../shared/FakeI18n'

const TaskSettingsForm = ({ app, data, updateData, saveData, errors }) => {
  const [state, setState] = useState(data || {})

  function update (data) {
    const newState = Object.assign({}, state, data)
    // setState(newState)
    updateData(newState)
  }

  return (
    <div>
      <Schedule
        app={app}
        updateData={update}
        data={data}
        namespace={'scheduling'}
        submit={() => saveData(state)}
      />

      {/* <UrlPaths
        app={app}
        updateData={update}
        data={data}
      /> */}

      <div className="flex justify-end">
        <Button
          variant={'contained'}
          color={'primary'}
          onClick={() => saveData(state)}
        >
          {I18n.t('common.save')}
        </Button>
      </div>
    </div>
  )
}

function Schedule ({ app, data, updateData, namespace, submit }) {
  const [state, setState] = React.useState(data)

  useEffect(() => {
    updateData(state)
  }, [state])

  function handleRadioChange (event) {
    setValue(event.target.name, event.target.value)
  }

  const setValue = (name, value) => {
    setState({ ...state, [name]: value })
  }

  function submitData () {
    submit(state)
  }

  const handleChange = (name) => (event) => {
    setValue(name, event.target.checked ? 'enabled' : 'disabled')
  }

  return (
    <div className="py-4">
      <p className="text-lg leading-6 font-medium text-gray-900 pb-4">
        {I18n.t('task_bots.settings.settings_title')}
      </p>

      <Input
        type="checkbox"
        checked={state.state === 'enabled'}
        onChange={handleChange('state')}
        value={state.state === 'enabled'}
        label={I18n.t('task_bots.settings.enable_title')}
        hint={I18n.t('task_bots.settings.enable_hint')}
      ></Input>

      <p className="text-lg leading-6 font-medium text-gray-900 pb-4">
        {I18n.t('task_bots.settings.specific_times_title')}
      </p>

      <p className="max-w-xl text-sm leading-5 text-gray-500 mb-4">
        {I18n.t('task_bots.settings.tz_hint', {timezone: app.timezone })}
      </p>

      <Input
        onChange={handleRadioChange}
        name="scheduling"
        type="radio"
        value={'inside_office'}
        checked={state.scheduling === 'inside_office'}
        label={I18n.t('task_bots.settings.office_hours')}
        labelPlacement="end"
      />

      <Input
        type={'radio'}
        onChange={handleRadioChange}
        name="scheduling"
        value={'outside_office'}
        checked={state.scheduling === 'outside_office'}
        label={I18n.t('task_bots.settings.outside_office')}
        labelPlacement="end"
      />

      <Input
        onChange={handleRadioChange}
        name="scheduling"
        type="radio"
        disabled
        value={'custom_time'}
        checked={state.scheduling === 'custom_time'}
        label={I18n.t('task_bots.settings.custom_time')}
        labelPlacement="end"
      />
    </div>
  )
}

function UrlPaths ({ data, updateData }) {
  const [urls, setUrls] = useState(data.urls || [])
  const inputEl = useRef(null)

  useEffect(() => {
    updateData({ urls: urls })
  }, [urls])

  const [open, setOpen] = useState(false)

  function remove (item) {
    const newUrls = urls.filter((o) => o != item)
    setUrls(newUrls)
  }

  function add () {
    setOpen(true)
  }

  function close () {
    setOpen(false)
  }

  function submit (e) {
    const newUrls = urls.concat(inputEl.current.value)
    setUrls(newUrls)
    setOpen(false)
  }

  return (
    <div className="flex">
      <div item>
        <p variant={'h5'}>Enable Bot</p>

        {open && (
          <FormDialog
            open={open}
            // contentText={"lipsum"}
            titleContent={'Save Url'}
            formComponent={
              //! loading ?
              <form>
                <input ref={inputEl} name={'oe'} />
              </form>
              // : <CircularProgress/>
            }
            dialogButtons={
              <div className="flex justify-end">
                <Button onClick={close} variant="outlined">
                  Cancel
                </Button>

                <Button onClick={submit} className="mr-1">
                  Create
                </Button>
              </div>
            }
          ></FormDialog>
        )}
      </div>

      <div item>
        <Button onClick={add}>add</Button>
      </div>

      <div className="flex">
        {urls.map((o) => (
          <div item>
            <p>{o}</p>
            <Button onClick={() => remove(o)}>remove</Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskSettingsForm
