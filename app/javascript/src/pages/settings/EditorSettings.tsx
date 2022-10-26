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

function EditorSettingsForm({ settings, update, option }) {
  const [state, setState] = React.useState({
    agent_editor_settings:
      settings.agentEditorSettings || defaultAgentDefinitions(),
    user_editor_settings:
      settings.userEditorSettings || defaultUserDefinitions(),
    lead_editor_settings:
      settings.leadEditorSettings || defaultUserDefinitions(),
  });

  const handleChange = (name, item, event) => {
    setState({
      ...state,
      [name]: Object.assign(state[name], { [item]: event.target.checked }),
    });
  };

  function handleSubmit() {
    const {
      agent_editor_settings,
      user_editor_settings,
      lead_editor_settings,
    } = state;

    const data = {
      app: {
        agent_editor_settings,
        user_editor_settings,
        lead_editor_settings,
      },
    };
    update(data);
  }

  function userDefinitions() {
    return [
      'images',
      'attachments',
      'giphy',
      'link_embeds',
      'embeds',
      'video_recorder',
      'app_packages',
      'routing_bots',
      'quick_replies',
      'bot_triggers',
      'divider',
    ];
  }

  function leadDefinitions() {
    return ['emojis', 'gif', 'attachments'];
  }

  function defaultAgentDefinitions() {
    return userDefinitions().reduce(
      (obj, item) => Object.assign(obj, { [item]: true }),
      {}
    );
  }

  function defaultUserDefinitions() {
    return leadDefinitions().reduce(
      (obj, item) => Object.assign(obj, { [item]: true }),
      {}
    );
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

      <hr className="py-3" />

      {option.namespace == 'agents' && (
        <div>
          {userDefinitions().map((item) => (
            <Input
              key={`agents-${item}`}
              type="checkbox"
              checked={state.agent_editor_settings[item]}
              onChange={(e) => handleChange('agent_editor_settings', item, e)}
              value={state.agent_editor_settings[item]}
              label={item}
            />
          ))}
        </div>
      )}

      {option.namespace == 'users' && (
        <div>
          {leadDefinitions().map((item) => (
            <Input
              key={`users-${item}`}
              type="checkbox"
              checked={state.user_editor_settings[item]}
              onChange={(e) => handleChange('user_editor_settings', item, e)}
              value={state.user_editor_settings[item]}
              label={item}
            />
          ))}
        </div>
      )}

      {option.namespace == 'visitors' && (
        <div>
          {leadDefinitions().map((item) => (
            <Input
              key={`visitors-${item}`}
              type="checkbox"
              checked={state.lead_editor_settings[item]}
              onChange={(e) => handleChange('lead_editor_settings', item, e)}
              value={state.lead_editor_settings[item]}
              label={item}
            />
          ))}
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
