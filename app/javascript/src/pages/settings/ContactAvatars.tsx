import { connect } from 'react-redux';
import React from 'react';
import Button from '@chaskiq/components/src/components/Button';
import I18n from '../../shared/FakeI18n';

import Input from '@chaskiq/components/src/components/forms/Input';
import Hints from '@chaskiq/components/src/components/Hints';
import Avatar from '@chaskiq/components/src/components/Avatar';
import ErrorBoundary from '@chaskiq/components/src/components/ErrorBoundary';

function ContactAvatar({ app, settings, update, namespace }) {
  const avatarOptions = [
    'marble',
    'beam',
    'pixel',
    'sunset',
    'ring',
    'bauhaus',
  ];

  const defaultPalette = 'fc284f,ff824a,fea887,f6e7f7,d1d0d7';

  function handleChange() {}

  function handleSubmit() {
    const data = {
      app: {
        avatar_settings: {
          palette: palette.join(','),
          style: avatarType,
        },
      },
    };
    update(data);
  }

  const avatar_settings = settings.preferences?.avatar_settings;
  const [avatarType, setAvatarType] = React.useState(
    avatar_settings?.style || 'marble'
  );
  const [palette, setPalette] = React.useState(
    avatar_settings?.palette?.split(',') || defaultPalette.split(',')
  );

  return (
    <ErrorBoundary>
      <div className="py-4">
        <Hints type="contact_avatars" />

        <p className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 pb-2">
          {I18n.t('settings.contact_avatars.title')}
        </p>

        <p>{I18n.t('settings.contact_avatars.hint')}</p>
      </div>

      <hr />

      <div className="flex flex-row-reverse py-4">
        <div className="w-3/4">
          <Input
            type="select"
            onChange={(o) => {
              setAvatarType(o.label);
            }}
            defaultValue={{
              value: avatarType,
              label: avatarType,
            }}
            label={I18n.t('settings.contact_avatars.choose_color')}
            data={{}}
            options={avatarOptions.map((o) => ({
              value: o,
              label: o,
            }))}
          ></Input>

          <div className="flex">
            {palette.map((o, index) => (
              <div className="mr-2" key={`contact-avatar-${o}`}>
                <Input
                  type="color"
                  variant="circle"
                  value={`#${o}`}
                  defaultValue={'#ff00ff'}
                  label={null}
                  onChange={(color) => {
                    //hidden.current.value = color;
                    //handleChange();
                    let o = new Array(...palette);
                    o[index] = color.replace('#', '');
                    setPalette(o);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="w-1/4 flex items-center justify-center">
          <Avatar
            size={24}
            src="https://www.gravatar.com/avatar/null?d=blank"
            alt="string"
            avatar_kind={avatarType}
            palette={palette.map((o) => o).join(',')}
          />
        </div>
      </div>

      <div className="py-4">
        <Button
          onClick={handleSubmit}
          variant={'success'}
          color={'primary'}
          size="md"
        >
          {I18n.t('common.save')}
        </Button>
      </div>
    </ErrorBoundary>
  );
}

function mapStateToProps(state) {
  const { app } = state;
  return {
    app,
  };
}

export default connect(mapStateToProps)(ContactAvatar);
