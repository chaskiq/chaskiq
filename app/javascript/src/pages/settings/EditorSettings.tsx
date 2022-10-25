import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import I18n from '../../shared/FakeI18n';

import Button from '@chaskiq/components/src/components/Button';
import Input from '@chaskiq/components/src/components/forms/Input';
import Hints from '@chaskiq/components/src/components/Hints';
import ButtonTabSwitch from '@chaskiq/components/src/components/ButtonTabSwitch';

import ErrorBoundary from '@chaskiq/components/src/components/ErrorBoundary';

function EditorSettings({ settings, update, dispatch }) {
  const options = [
    {
      name: I18n.t('common.agents'),
      namespace: 'agents',
      i18n: 'agents',
      classes: 'rounded-l-lg',
    },
    {
      name: I18n.t('common.users'),
      namespace: 'users',
      i18n: 'users',
      classes: '',
    },
    {
      name: I18n.t('common.visitors'),
      namespace: 'visitors',
      i18n: 'leads',
      classes: 'rounded-r-lg',
    },
  ];

  const [option, setOption] = React.useState(options[0]);

  const activeClass =
    'bg-indigo-600 text-gray-100 border-indigo-600 pointer-events-none';

  function handleClick(o) {
    setOption(o);
  }

  return (
    <div className="flex flex-col">
      <div className="inline-flex mt-4">
        <ButtonTabSwitch
          options={options}
          option={option}
          handleClick={handleClick}
        />
      </div>

      <ErrorBoundary variant="very-wrong">
        <EditorSettingsForm
          option={option}
          settings={settings}
          update={update}
          dispatch={dispatch}
        />
      </ErrorBoundary>
    </div>
  );
}

function EditorSettingsForm({ settings, update, dispatch, option }) {
  const [state, setState] = React.useState({
    enable_inbound: settings.inboundSettings.enabled,

    users_enable_inbound: settings.inboundSettings.enabled,
    users_radio: settings.inboundSettings.users.segment,
    users_enabled: settings.inboundSettings.users.enabled,
    users_predicates: settings.inboundSettings.users.predicates,
    users_close_conversations_enabled:
      settings.inboundSettings.users.close_conversations_enabled,
    users_close_conversations_after:
      settings.inboundSettings.users.close_conversations_after || 0,

    users_idle_sessions_enabled:
      settings.inboundSettings.users.users_idle_sessions_enabled,
    users_idle_sessions_after:
      settings.inboundSettings.users.users_idle_sessions_after || 0,

    visitors_enable_inbound: settings.inboundSettings.enabled,
    visitors_radio: settings.inboundSettings.visitors.segment,
    visitors_enabled: settings.inboundSettings.visitors.enabled,
    visitors_predicates: settings.inboundSettings.visitors.predicates,
    visitors_close_conversations_enabled:
      settings.inboundSettings.visitors.close_conversations_enabled,
    visitors_close_conversations_after:
      settings.inboundSettings.visitors.close_conversations_after || 0,

    visitors_idle_sessions_enabled:
      settings.inboundSettings.visitors.idle_sessions_enabled,
    visitors_idle_sessions_after:
      settings.inboundSettings.visitors.idle_sessions_after || 0,
  });

  const handleChange = (name, event) => {
    setState({ ...state, [name]: event.target.checked });
  };

  function handleSubmit() {
    const {
      enable_inbound,
      visitors_enable_inbound,
      users_enable_inbound,
      users_enabled,
      users_radio,
      users_predicates,
      visitors_radio,
      visitors_enabled,
      visitors_predicates,
      visitors_close_conversations_after,
      visitors_close_conversations_enabled,
      users_close_conversations_after,
      users_close_conversations_enabled,
      visitors_idle_sessions_after,
      visitors_idle_sessions_enabled,
      users_idle_sessions_after,
      users_idle_sessions_enabled,
    } = state;

    const data = {
      app: {
        inbound_settings: {
          enabled: enable_inbound,
          users: {
            users_enable_inbound: users_enable_inbound,
            enabled: users_enabled,
            segment: users_radio,
            predicates: users_predicates,
            close_conversations_enabled: users_close_conversations_enabled,
            close_conversations_after: users_close_conversations_after,
            idle_sessions_enabled: users_idle_sessions_enabled,
            idle_sessions_after: users_idle_sessions_after,
          },
          visitors: {
            visitors_enable_inbound: visitors_enable_inbound,
            enabled: visitors_enabled,
            segment: visitors_radio,
            predicates: visitors_predicates,
            close_conversations_enabled: visitors_close_conversations_enabled,
            close_conversations_after: visitors_close_conversations_after,
            idle_sessions_enabled: visitors_idle_sessions_enabled,
            idle_sessions_after: visitors_idle_sessions_after,
          },
        },
      },
    };
    update(data);
  }

  return (
    <div>
      <div className="py-4">
        <Hints type="inbound_settings" />
      </div>

      <p className="text-lg font-bold text-gray-900 pb-2">
        Text editor configuration
      </p>

      <p className="my-2 max-w-xl text-sm leading-5 text-gray-500">
        configure specific features to allow users to use in the chat editor.
      </p>

      <hr className="py-3"/>

      {option.namespace == 'agents' &&  (
        <div>
          <Input
            type="checkbox"
            checked={state.enable_inbound}
            onChange={(e) => handleChange('enable_inbound', e)}
            value={state.enable_inbound}
            label={"images"}
          />

          <Input
            type="checkbox"
            checked={state.enable_inbound}
            onChange={(e) => handleChange('enable_inbound', e)}
            value={state.enable_inbound}
            label={"attachments"}
          />

          <Input
            type="checkbox"
            checked={state.enable_inbound}
            onChange={(e) => handleChange('enable_inbound', e)}
            value={state.enable_inbound}
            label={"giphy"}
          />

          <Input
            type="checkbox"
            checked={state.enable_inbound}
            onChange={(e) => handleChange('enable_inbound', e)}
            value={state.enable_inbound}
            label={"link_embeds"}
          />

          <Input
            type="checkbox"
            checked={state.enable_inbound}
            onChange={(e) => handleChange('enable_inbound', e)}
            value={state.enable_inbound}
            label={"embeds"}
          />

          <Input
            type="checkbox"
            checked={state.enable_inbound}
            onChange={(e) => handleChange('enable_inbound', e)}
            value={state.enable_inbound}
            label={"video_recorder"}
          />

          <Input
            type="checkbox"
            checked={state.enable_inbound}
            onChange={(e) => handleChange('enable_inbound', e)}
            value={state.enable_inbound}
            label={"app_packages"}
          />

          <Input
            type="checkbox"
            checked={state.enable_inbound}
            onChange={(e) => handleChange('enable_inbound', e)}
            value={state.enable_inbound}
            label={"routing_bots"}
          />

          <Input
            type="checkbox"
            checked={state.enable_inbound}
            onChange={(e) => handleChange('enable_inbound', e)}
            value={state.enable_inbound}
            label={"quick_replies"}
          />
        </div>
      )}

      {option.namespace == 'users' &&  (
        <div>
          <Input
            type="checkbox"
            checked={state.enable_inbound}
            onChange={(e) => handleChange('enable_inbound', e)}
            value={state.enable_inbound}
            label={"emoticons"}
          />

          <Input
            type="checkbox"
            checked={state.enable_inbound}
            onChange={(e) => handleChange('enable_inbound', e)}
            value={state.enable_inbound}
            label={"gif"}
          />

          <Input
            type="checkbox"
            checked={state.enable_inbound}
            onChange={(e) => handleChange('enable_inbound', e)}
            value={state.enable_inbound}
            label={"attachments"}
          />
        </div>
      )}

      {option.namespace == 'visitors' &&  (
        <div>
          <Input
            type="checkbox"
            checked={state.enable_inbound}
            onChange={(e) => handleChange('enable_inbound', e)}
            value={state.enable_inbound}
            label={"emoticons"}
          />

          <Input
            type="checkbox"
            checked={state.enable_inbound}
            onChange={(e) => handleChange('enable_inbound', e)}
            value={state.enable_inbound}
            label={"gif"}
          />

          <Input
            type="checkbox"
            checked={state.enable_inbound}
            onChange={(e) => handleChange('enable_inbound', e)}
            value={state.enable_inbound}
            label={"attachments"}
          />
        </div>
      )}

      <div className="pb-4">
        <Button
          onClick={handleSubmit}
          variant={'success'}
          size="md"
          color={'primary'}
        >
          {I18n.t('common.save')}
        </Button>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  const { drawer } = state;
  return {
    drawer,
  };
}

export default withRouter(connect(mapStateToProps)(EditorSettings));


