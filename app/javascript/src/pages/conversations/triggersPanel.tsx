import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import graphql from '@chaskiq/store/src/graphql/client';

import FormDialog from '@chaskiq/components/src/components/FormDialog';
import Button from '@chaskiq/components/src/components/Button';

import { BOT_TASKS } from '@chaskiq/store/src/graphql/queries';

import { SEND_TRIGGER } from '@chaskiq/store/src/graphql/mutations';
import I18n from '../../shared/FakeI18n';

// TODO:

// check mode, conversations for users get user bot
// tasks while visitors got lead bot tasks

function TriggersPanel(props) {
  const [open, setOpen] = React.useState(props.open);
  const [botTask, setBotTask] = React.useState(null);
  const [botTasks, setBotTasks] = React.useState([]);

  function getBotTasks() {
    graphql(
      BOT_TASKS,
      {
        appKey: props.app.key,
        lang: 'es',
        //mode: props.conversation.mainParticipant.kind === 'app_user' ? 'users' : 'leads'
      },
      {
        success: (data) => {
          setBotTasks(data.app.botTasks);
        },
        error: () => {},
      }
    );
  }

  function sendTrigger() {
    graphql(
      SEND_TRIGGER,
      {
        appKey: props.app.key,
        triggerId: parseInt(botTask.id),
        conversationId: props.conversation.id,
      },
      {
        success: () => {
          handleClose();
        },
        errors: (_err) => {},
      }
    );
  }

  React.useEffect(() => {
    getBotTasks();
  }, []);

  React.useEffect(() => {
    setOpen(props.open);
  }, [props.open]);

  function handleClose() {
    setOpen(false);
    props.close();
  }

  function renderItem(o) {
    return (
      <div>
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3
              className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100"
              id="modal-headline"
            >
              {I18n.t('conversation.editor.panels.bot.confirm', {
                title: o.title,
              })}
            </h3>
            <div className="mt-2">
              <p className="text-sm leading-5 text-gray-500 dark:text-gray-300">
                {I18n.t('conversation.editor.panels.bot.confirm_msg')}
                <Button
                  size="xs"
                  variant="success"
                  onClick={() => setBotTask(null)}
                >
                  {I18n.t('conversation.editor.panels.bot.choose_another')}
                </Button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function handleClick(o) {
    setBotTask(o);
  }

  function handleSend(_o) {
    sendTrigger();
  }

  return (
    <FormDialog
      open={open}
      handleClose={handleClose}
      titleContent={I18n.t('conversation.editor.panels.bot.title')}
      formComponent={
        <div>
          {!botTask && (
            <div
              style={{ maxHeight: '16rem' }}
              className="mt-2 bg-white shadow overflow-hidden sm:rounded-md overflow-y-auto"
            >
              <ul>
                {botTasks.map((o) => {
                  return (
                    <li
                      key={`triggerable-${o.id}`}
                      className="border-t border-gray-200"
                    >
                      <a
                        href="#"
                        onClick={() => handleClick(o)}
                        className="block hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition duration-150 ease-in-out"
                      >
                        <div className="flex items-center px-4 py-4 sm:px-6">
                          <div className="min-w-0 flex-1 flex items-center">
                            <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                              <div>
                                <div className="text-sm leading-5 font-medium text-indigo-600 truncate">
                                  {o.title}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {botTasks.length === 0 && (
            <p>{I18n.t('conversation.editor.panels.bot.empty')}</p>
          )}

          {botTask && renderItem(botTask)}
        </div>
      }
      dialogButtons={
        <React.Fragment>
          <Button onClick={handleClose} variant="outlined" className="ml-2">
            {I18n.t('common.cancel')}
          </Button>

          {botTask && (
            <Button onClick={handleSend}>{I18n.t('common.send')}</Button>
          )}
        </React.Fragment>
      }
    />
  );
}

function mapStateToProps(state) {
  const { app_user, app, conversation } = state;
  return {
    app_user,
    app,
    conversation,
  };
}

export default withRouter(connect(mapStateToProps)(TriggersPanel));
