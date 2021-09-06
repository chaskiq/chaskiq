import React, { useState } from 'react';

import Button from '@chaskiq/components/src/components/Button';
import Input from '@chaskiq/components/src/components/forms/Input';
import Hints from '@chaskiq/components/src/components/Hints';
import I18n from '../../shared/FakeI18n';

export default function EmailRequirement({ settings, update }) {
  const [value, setValue] = useState(settings.emailRequirement);

  const emailRequirements: any = I18n.t('settings.email_requirement.options');

  function handleChange(e) {
    setValue(e.target.value);
  }

  function handleSubmit() {
    const data = {
      app: {
        email_requirement: value,
      },
    };
    update(data);
  }

  return (
    <div className="py-4">
      <Hints type="email_requirement" />

      {/* <p className="text-lg leading-6 font-medium text-gray-900 pb-2">
        {I18n.t('settings.email_requirement.title')}
      </p>

      <p className="text-md leading-6 font-medium text-gray-600 pb-2">
        {I18n.t('settings.email_requirement.hint')}
      </p> */}

      <div>
        <h2 className="mt-2 max-w-xl text-sm leading-5 text-gray-500 dark:text-gray-300">
          {I18n.t('settings.email_requirement.ask')}
        </h2>
      </div>

      <div className="py-4">
        {emailRequirements.map((o, i) => {
          return (
            <React.Fragment key={`email_requirement_options-${i}`}>
              <Input
                name="email_requirement"
                defaultChecked={settings.emailRequirement === o.value}
                onChange={handleChange}
                type={'radio'}
                value={o.value}
                label={o.label}
                helperText={o.hint}
              />
            </React.Fragment>
          );
        })}
      </div>

      <Button
        size="md"
        onClick={handleSubmit}
        variant={'success'}
        color={'primary'}
      >
        {I18n.t('common.save')}
      </Button>
    </div>
  );
}
