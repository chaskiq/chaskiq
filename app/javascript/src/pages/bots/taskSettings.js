import React, { useState, useEffect, useRef } from 'react'

import Button from '../../components/Button'
import Input from '../../components/forms/Input'
// import FormControlLabel from '@material-ui/core/FormControlLabel'
// import FormControl from '@material-ui/core/FormControl'
// import Radio from '@material-ui/core/Radio'
// import RadioGroup from '@material-ui/core/RadioGroup'
// import FormLabel from '@material-ui/core/FormLabel'
// import Checkbox from '@material-ui/core/Checkbox'
// import TextField from '@material-ui/core/TextField'

import FormDialog from '../../components/FormDialog'

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
          save
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
        Bot Task settings
      </p>

      <Input
        type="checkbox"
        checked={state.state === 'enabled'}
        onChange={handleChange('state')}
        value={state.state === 'enabled'}
        label={'enable bot task'}
        helperText={'when enabled the bot task will start operating'}
      ></Input>

      <p className="text-lg leading-6 font-medium text-gray-900 pb-4">
        Set specific times to show this bot to your audience.
      </p>

      <p className="max-w-xl text-sm leading-5 text-gray-500 mb-4">
        Your app's timezone is {app.timezone} See your office hours.
      </p>

      <Input
        onChange={handleRadioChange}
        name="scheduling"
        type="radio"
        value={'inside_office'}
        checked={state.scheduling === 'inside_office'}
        label="During office hours"
        labelPlacement="end"
      />

      <Input
        type={'radio'}
        onChange={handleRadioChange}
        name="scheduling"
        value={'outside_office'}
        checked={state.scheduling === 'outside_office'}
        label="Outside office hours"
        labelPlacement="end"
      />

      <Input
        onChange={handleRadioChange}
        name="scheduling"
        type="radio"
        disabled
        value={'custom_time'}
        checked={state.scheduling === 'custom_time'}
        label="Custom time"
        labelPlacement="end"
      />

      {/* <FormControl component="fieldset">
        <FormLabel component="legend">
          Set specific times to show this bot to your audience.
        </FormLabel>

        <RadioGroup aria-label="position"
          name="scheduling"
          value={state.scheduling}
          onChange={handleRadioChange}
          >
          <FormControlLabel
            value="inside_office"
            control={<Radio color="primary" />}
            label="During office hours"
            labelPlacement="end"
          />

          <FormControlLabel
            value="outside_office"
            control={<Radio color="primary" />}
            label="Outside office hours"
            labelPlacement="end"
          />

          <FormControlLabel
            value="custom_time"
            control={<Radio color="primary" />}
            label="Custom time"
            disabled={true}
            labelPlacement="end"
          />
        </RadioGroup>

    </FormControl> */}
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
                <Button onClick={close} color="secondary">
                  Cancel
                </Button>

                <Button onClick={submit} color="primary">
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
