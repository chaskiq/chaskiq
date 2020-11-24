import React, { useState, useEffect } from 'react'
import I18n from '../../shared/FakeI18n'
import Tooltip from 'rc-tooltip'

import Button from '../../components/Button'
import Hints from '../../shared/Hints'
import { PlusIcon, DeleteIcon } from '../../components/icons'
import Input from '../../components/forms/Input'
// const options = I18n.t("settings.availability.reply_time.options")
/* [
  {value: "auto", label: "Automatic reply time. Currently El equipo responderá lo antes posible"},
  {value: "minutes", label: "El equipo suele responder en cuestión de minutos."},
  {value: "hours", label: "El equipo suele responder en cuestión de horas."},
  {value: "1 day", label: "El equipo suele responder en un día."},
] */

export default function LanguageForm ({ settings, update, namespace, fields }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedOption, setSelectedOption] = React.useState(
    settings.replyTime
  )
  const [records, setRecords] = useState(settings.teamSchedule)

  let formRef = React.createRef()

  function handleChange (e) {
    setSelectedOption(e.target.value)
  }

  function toggleDialog () {
    setIsOpen(!isOpen)
  }

  function handleSubmit (e) {
    e.preventDefault()
    const data = {
      app: {
        team_schedule: records,
        reply_time: selectedOption
      }
    }
    update(data)
  }

  return (
    <form ref={(ref) => (formRef = ref)}>
      <div className="py-4">
        <Hints type="availability"/>

        <p className="text-lg leading-6 font-medium text-gray-900 pb-2">
          {I18n.t('settings.availability.title')}
        </p>

        <p variant="subtitle1" gutterBottom>
          {I18n.t('settings.availability.hint')}
        </p>
      </div>

      <hr />

      <div className="py-4">
        <p className="text-lg leading-6 font-medium text-gray-900">
          {I18n.t('settings.availability.title2')}
        </p>

        <p className="mt-2 max-w-xl text-sm leading-5 text-gray-500">
          {I18n.t('settings.availability.hint2')}
        </p>
      </div>

      <div className="py-4">
        <p className="text-xs text-gray-900 font-bold">
          {I18n.t('settings.availability.timezone', { tz: settings.timezone })}
        </p>

        <AvailabilitySchedule records={records} setRecords={setRecords} />
      </div>

      <div className="py-4">
        <p className="text-lg leading-6 font-medium text-gray-900">
          {I18n.t('settings.availability.reply_time.title')}
        </p>

        <p className="mt-2 max-w-xl text-sm leading-5 text-gray-500">
          {I18n.t('settings.availability.reply_time.hint')}
        </p>

        <div className="py-4">
          {/* <RadioGroup
              aria-label="reply time"
              name="reply_time"
              //className={classes.group}
              value={selectedOption}
              onChange={handleChange}
            >
              {
                I18n.t("settings.availability.reply_time.options")
                .map((o)=>(
                  <FormControlLabel
                    key={o.value}
                    value={o.value}
                    control={<Radio />}
                    label={o.label}
                  />
                ))
              }

            </RadioGroup> */}

          {I18n.t('settings.availability.reply_time.options').map((o) => (
            <Input
              type={'radio'}
              key={o.value}
              name="reply_time"
              value={o.value}
              defaultChecked={o.value === settings.replyTime}
              label={o.label}
              // value={selectedOption}
              onChange={handleChange}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mt-2 max-w-xl text-sm leading-5 text-gray-500">
          {I18n.t('settings.availability.reply_time.hint2')}
        </p>
      </div>

      <div className="py-4">
        <Button onClick={handleSubmit} 
          variant={'success'} 
          color={'primary'}
          size="md">
          {I18n.t('common.save')}
        </Button>
      </div>
    </form>
  )
}

function AvailabilitySchedule ({ records, setRecords }) {
  function addRecord (e) {
    e.preventDefault()

    const newRecords = records.concat({
      day: null,
      from: null,
      to: null
    })

    setRecords(newRecords)
  }

  function update (item, index) {
    const newRecords = records.map((o, i) => {
      return i === index ? item : o
    })
    setRecords(newRecords)
  }

  function removeItem (index) {
    const newRecords = records.filter((o, i) => i != index)
    setRecords(newRecords)
  }

  return (
    <div mt={2}>
      {records.map((o, index) => (
        <AvailabilityRecord
          key={index}
          record={o}
          update={update}
          index={index}
          removeItem={removeItem}
        />
      ))}

      <div className="flex justify-start">
        <div className="py-4">
          <Tooltip
            placement="right"
            overlay={'add new availability time frame'}
          >
            <Button
              onClick={addRecord}
              color={'primary'}
              className="border h-50 w-50"
              aria-label={'add new availability time frame'}
              variant={'icon'}
            >
              <PlusIcon />
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

function AvailabilityRecord ({ record, update, index, removeItem }) {
  const [item, setRecord] = useState(record)

  function handleChange (data) {
    setRecord(Object.assign({}, item, data))
  }

  function genHours (t1, t2) {
    return Array(24 * 4)
      .fill(0)
      .map((_, i) => {
        return ('0' + ~~(i / 4) + ':0' + 60 * ((i / 4) % 1)).replace(
          /\d(\d\d)/g,
          '$1'
        )
      })
  }

  useEffect(() => {
    update(item, index)
  }, [item])

  function deleteItem () {
    removeItem(index)
  }

  return (
    <div className="flex flex-row justify-between items-center">
      <div className="w-1/4 p-1">
        <Input
          type={'select'}
          label="day"
          name="day"
          value={{ label: item.day, value: item.day }}
          defaultValue={{ label: item.day, value: item.day }}
          data={{}}
          onChange={(e) => handleChange({ day: e.value })}
          options={I18n.translations.en.date.abbr_day_names.map((o, i) => ({
            value: o.toLocaleLowerCase(),
            label: I18n.translations.en.date.day_names[i]
          }))}
        ></Input>
      </div>

      <div className="w-1/4 p-1">
        <Input
          type={'select'}
          label="from"
          name={'from'}
          value={{ label: item.from, value: item.from }}
          defaultValue={{ label: item.from, value: item.from }}
          data={{}}
          onChange={(e) => {
            handleChange({ from: e.value })
          }}
          options={genHours('00:00', '23:30').map((o) => ({
            label: o,
            value: o
          }))}
        ></Input>
      </div>

      <div className="w-1/4 p-1">
        <Input
          label="to"
          type={'select'}
          value={{ label: item.to, value: item.to }}
          defaultValue={{ label: item.to, value: item.to }}
          name={'to'}
          data={{}}
          onChange={(e) => handleChange({ to: e.value })}
          options={genHours('00:00', '23:30').map((o) => ({
            label: o,
            value: o
          }))}
        ></Input>
      </div>

      <div className="w-1/4 pt-3">
        <Button type={'button'} variant="icon" onClick={deleteItem}>
          <DeleteIcon></DeleteIcon>
        </Button>
      </div>
    </div>
  )
}
