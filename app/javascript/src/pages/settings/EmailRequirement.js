import React, { useState } from 'react'

import I18n from '../../shared/FakeI18n'
import Button from '../../components/Button'
import Input from '../../components/forms/Input'

export default function EmailRequirement ({ settings, update }) {
  const [value, setValue] = useState(settings.emailRequirement)

  function handleChange (e) {
    setValue(e.target.value)
  }

  function handleSubmit () {
    const data = {
      app: {
        email_requirement: value
      }
    }
    update(data)
  }

  return (
    <div className="py-4">
      <p className="text-lg leading-6 font-medium text-gray-900 pb-2">
        {I18n.t('settings.email_requirement.title')}
      </p>

      <p className="text-md leading-6 font-medium text-gray-600 pb-2">
        {I18n.t('settings.email_requirement.hint')}
      </p>

      <div mt={2}>
        <h2 className="mt-2 max-w-xl text-sm leading-5 text-gray-500">
          {I18n.t('settings.email_requirement.ask')}
        </h2>
      </div>

      <div className="py-4">
        {/* <RadioGroup
          aria-label="email_requirement"
          name="email_requirement"
          //className={classes.group}
          value={value}
          onChange={handleChange}
        >

        {
          I18n.t("settings.email_requirement.options").map((o, i)=>{
            return <React.Fragment key={`email_requirement_options-${i}`}>
                    <FormControlLabel
                      value={o.value}
                      control={<Radio />}
                      label={o.label}
                    />
                    <p variant={"overline"}>
                      {o.hint}
                    </p>
                  </React.Fragment>
          })
        }

      </RadioGroup> */}

        {I18n.t('settings.email_requirement.options').map((o, i) => {
          return (
            <React.Fragment key={`email_requirement_options-${i}`}>
              <Input
                name="email_requirement"
                // value={value}
                onChange={handleChange}
                type={'radio'}
                value={o.value}
                label={o.label}
                helperText={o.hint}
              />
            </React.Fragment>
          )
        })}
      </div>

      <Button onClick={handleSubmit} variant={'contained'} color={'primary'}>
        Save
      </Button>
    </div>
  )
}
