import React, { useState, useEffect } from 'react';
import { withRouter, Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import arrayMove from 'array-move';
import { isEmpty } from 'lodash';

import graphql from '@chaskiq/store/src/graphql/client';

import BotEditor from './bots/editor';

import SettingsForm from './bots/settings';

import I18n from '../shared/FakeI18n';

import { AnchorLink } from '@chaskiq/components/src/components/RouterLink';
import FormDialog from '@chaskiq/components/src/components/FormDialog';
import Badge from '@chaskiq/components/src/components/Badge';
import EmptyView from '@chaskiq/components/src/components/EmptyView';
import DeleteDialog from '@chaskiq/components/src/components/DeleteDialog';
import FilterMenu from '@chaskiq/components/src/components/FilterMenu';
import Button from '@chaskiq/components/src/components/Button';
import Input from '@chaskiq/components/src/components/forms/Input';
import ContentHeader from '@chaskiq/components/src/components/PageHeader';
import Content from '@chaskiq/components/src/components/Content';
import Table from '@chaskiq/components/src/components/Table';

import {
  errorMessage,
  successMessage,
} from '@chaskiq/store/src/actions/status_messages';

import {
  setCurrentSection,
  setCurrentPage,
} from '@chaskiq/store/src/actions/navigation';

import { BOT_TASKS } from '@chaskiq/store/src/graphql/queries';
import {
  CREATE_BOT_TASK,
  DELETE_BOT_TASK,
  REORDER_BOT_TASK,
} from '@chaskiq/store/src/graphql/mutations';

const BotDataTable = ({ app, match, history, mode, dispatch }) => {
  const [loading, _setLoading] = useState(false);
  const [botTasks, setBotTasks] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(null);
  const [openTaskForm, setOpenTaskForm] = useState(false);
  const [meta, _setMeta] = useState({});
  const [options, setOptions] = useState(optionsForFilter());
  const [stateOptions, setStateOptions] = useState(optionsForState());

  function init() {
    dispatch(setCurrentPage(`bot_${mode}`));

    graphql(
      BOT_TASKS,
      {
        appKey: app.key,
        mode: mode,
        filters: getFilters(),
      },
      {
        success: (data) => {
          setBotTasks(data.app.botTasks);
        },
        error: () => {},
      }
    );
  }

  useEffect(init, [
    match.url,
    JSON.stringify(options),
    JSON.stringify(stateOptions),
  ]);

  // useEffect(init [match])
  function onSortEnd(oldIndex, newIndex) {
    const op1 = botTasks[oldIndex];
    const op2 = botTasks[newIndex];

    graphql(
      REORDER_BOT_TASK,
      {
        appKey: app.key,
        id: op1.id,
        idAfter: op2.id,
        mode: mode,
      },
      {
        success: (_res) => {
          dispatch(successMessage(I18n.t('status_messages.reordered_success')));
        },
        error: (_res) => {
          dispatch(errorMessage(I18n.t('status_messages.reordered_error')));
        },
      }
    );

    setBotTasks(arrayMove(botTasks, oldIndex, newIndex));

    setTimeout(() => {}, 2000);
  }

  function removeBotTask(o) {
    graphql(
      DELETE_BOT_TASK,
      { appKey: app.key, id: o.id },
      {
        success: (_data) => {
          const newData = botTasks.filter((item) => item.id != o.id);
          setBotTasks(newData);
          setOpenDeleteDialog(null);
          dispatch(successMessage(I18n.t('task_bots.remove_success')));
        },
        error: () => {},
      }
    );
  }

  function getFilters() {
    return {
      state: stateOptions.filter((o) => o.state === 'checked').map((o) => o.id),
      users: options.filter((o) => o.state === 'checked').map((o) => o.id),
    };
  }

  function toggleTaskForm() {
    setOpenTaskForm(!openTaskForm);
  }

  function optionsForFilter() {
    return [
      {
        title: I18n.t('task_bots.type_filters.title_visitors'),
        description: I18n.t('task_bots.type_filters.description_visitors'),
        id: 'Visitor',
        state: 'checked',
      },
      {
        title: I18n.t('task_bots.type_filters.title_leads'),
        description: I18n.t('task_bots.type_filters.description_leads'),
        id: 'Lead',
        state: 'checked',
      },
      {
        title: I18n.t('task_bots.type_filters.title_users'),
        description: I18n.t('task_bots.type_filters.description_users'),
        id: 'AppUser',
        state: 'checked',
      },
    ];
  }

  function optionsForState() {
    return [
      {
        title: I18n.t('task_bots.state_filters.enabled_title'),
        description: I18n.t('task_bots.state_filters.enabled_description'),
        id: 'enabled',
        state: 'checked',
      },
      {
        title: I18n.t('task_bots.state_filters.disabled_title'),
        description: I18n.t('task_bots.state_filters.disabled_description'),
        id: 'disabled',
        state: 'checked',
      },
    ];
  }

  function namesForToggleButton(opts) {
    const names = opts
      .filter((o) => o.state === 'checked')
      .map((o) => o.title)
      .join(', ');
    return names === '' ? opts.map((o) => o.title).join(', ') : names;
  }

  function toggleButton(clickHandler, opts) {
    return (
      <div>
        <Button variant={'outlined'} onClick={clickHandler}>
          {namesForToggleButton(opts)}
        </Button>
      </div>
    );
  }

  function handleClickforOptions(opts, option) {
    return opts.map((o) => {
      if (o.id === option.id) {
        const checked = option.state === 'checked' ? '' : 'checked';
        return { ...option, state: checked };
      } else {
        return o;
      }
    });
  }

  function handleClickforState(opts, option) {
    const checkeds = opts.filter((o) => o.state === 'checked');

    return opts.map((o) => {
      if (o.id === option.id) {
        const isChecked = option.state === 'checked';
        const checked = isChecked ? '' : 'checked';
        if (checkeds.length === 1 && isChecked) {
          return o;
        }
        return { ...option, state: checked };
      } else {
        return o;
      }
    });
  }

  return (
    <div>
      <Content>
        <ContentHeader
          title={I18n.t(`task_bots.${mode}`)}
          actions={
            <div>
              <Button
                color="inherit"
                onClick={toggleTaskForm}
                variant={'flat-dark'}
              >
                {I18n.t('task_bots.new')}
              </Button>
            </div>
          }
        />

        <div className="flex">
          <div className="mr-3">
            <FilterMenu
              options={options}
              value={null}
              filterHandler={(option) => {
                const newOptions = handleClickforOptions(options, option);
                setOptions(newOptions);
              }}
              triggerButton={(handler) => toggleButton(handler, options)}
              position={'left'}
            />
          </div>

          <div>
            <FilterMenu
              options={stateOptions}
              value={null}
              filterHandler={(option) => {
                const newOptions = handleClickforState(stateOptions, option);
                setStateOptions(newOptions);
              }}
              triggerButton={(handler) => toggleButton(handler, stateOptions)}
              position={'left'}
            />
          </div>
        </div>

        {!loading && botTasks.length > 0 && (
          <Table
            meta={meta}
            data={botTasks}
            search={init}
            sortable={true}
            onSort={onSortEnd}
            columns={[
              {
                field: 'name',
                title: I18n.t('definitions.bot_tasks.name.label'),
                render: (row) =>
                  row && (
                    <div className="flex items-center">
                      {row.id && (
                        <span className="text-lg leading-5 font-bold text-gray-900 dark:text-gray-100">
                          <AnchorLink to={`${match.url}/${row.id}`}>
                            {row.title}
                          </AnchorLink>
                        </span>
                      )}
                    </div>
                  ),
              },

              {
                field: 'state',
                title: I18n.t('definitions.bot_tasks.state.label'),
                render: (row) =>
                  row && (
                    <Badge
                      className={`bg-${
                        row.state === 'enabled' ? 'green-500' : 'gray-200'
                      }`}
                    >
                      {I18n.t(`campaigns.state.${row.state}`)}
                    </Badge>
                  ),
              },
              {
                field: 'actions',
                title: I18n.t('definitions.bot_tasks.actions.label'),
                render: (row) => (
                  <div className="flex items-center">
                    {row.id && (
                      <Button
                        color={'secondary'}
                        variant={'danger'}
                        onClick={() => setOpenDeleteDialog(row)}
                      >
                        {I18n.t('common.delete')}
                      </Button>
                    )}
                  </div>
                ),
              },
            ]}
          ></Table>
        )}

        {!loading && botTasks.length === 0 && (
          <EmptyView
            title={I18n.t('task_bots.empty.title')}
            subtitle={
              <div>
                <Button
                  variant="text"
                  color="inherit"
                  size="large"
                  onClick={toggleTaskForm}
                >
                  {I18n.t('task_bots.empty.create_new')}
                </Button>
              </div>
            }
          />
        )}

        {openDeleteDialog && (
          <DeleteDialog
            open={openDeleteDialog}
            title={I18n.t('task_bots.delete.title', {
              name: openDeleteDialog.title,
            })}
            closeHandler={() => {
              setOpenDeleteDialog(null);
            }}
            deleteHandler={() => {
              removeBotTask(openDeleteDialog);
            }}
          >
            <p>{I18n.t('task_bots.delete.hint')}</p>
          </DeleteDialog>
        )}
      </Content>

      {openTaskForm && (
        <BotTaskCreate
          dispatch={dispatch}
          mode={mode}
          match={match}
          history={history}
          app={app}
          submit={() => console.log('os')}
        />
      )}
    </div>
  );
};

const BotTaskCreate = ({ app, submit, history, match, mode, dispatch }) => {
  // const PathDialog = ({open, close, isOpen, submit})=>{

  const [isOpen, setIsOpen] = useState(true);
  const [errors, setErrors] = useState(null);

  const close = () => {
    setIsOpen(false);
  };

  let titleRef: any = React.createRef();
  // const titleRef = null

  const handleSubmit = (_e) => {
    setErrors(null);
    const dataParams = {
      // id: create_UUID(),
      title: titleRef.value,
      paths: [],
      bot_type: mode,
    };

    graphql(
      CREATE_BOT_TASK,
      {
        appKey: app.key,
        params: dataParams,
      },
      {
        success: (data) => {
          if (!isEmpty(data.createBotTask.errors)) {
            dispatch(errorMessage(I18n.t('status_messages.created_error')));
            setErrors(data.createBotTask.errors.name.join(', '));
            return;
          }

          history.push(match.url + '/' + data.createBotTask.botTask.id);

          submit && submit();
        },
        error: (_error) => {},
      }
    );
  };

  return (
    isOpen && (
      <FormDialog
        open={isOpen}
        handleClose={() => setIsOpen(false)}
        titleContent={I18n.t('task_bots.create.title')}
        formComponent={
          <form>
            <Input
              label={I18n.t('definitions.bot_tasks.title.label')}
              id="title"
              type={'string'}
              ref={(ref) => (titleRef = ref)}
              placeholder={I18n.t('definitions.bot_tasks.title.placeholder')}
              error={errors}
              // defaultValue="Default Value"
              // className={classes.textField}
              helperText={I18n.t('definitions.bot_tasks.title.hint')}
            />
          </form>
        }
        dialogButtons={
          <React.Fragment>
            <Button onClick={close} variant="outlined">
              {I18n.t('common.cancel')}
            </Button>

            <Button
              data-cy="bot-task-create"
              onClick={handleSubmit}
              className="mr-1"
            >
              {I18n.t('common.create')}
            </Button>
          </React.Fragment>
        }
      ></FormDialog>
    )
  );
};

const BotContainer = ({ app, match, history, dispatch, actions }) => {
  useEffect(() => {
    dispatch(setCurrentSection('Bot'));
  }, []);

  return (
    <Switch>
      <Route
        exact
        path={[`${match.path}/settings`]}
        render={(props) => (
          <SettingsForm
            app={app}
            history={history}
            match={match}
            dispatch={dispatch}
            {...props}
          />
        )}
      />

      <Route
        exact
        path={[`${match.path}/outbound`]}
        render={(props) => (
          <BotDataTable
            app={app}
            history={history}
            match={match}
            mode={'outbound'}
            dispatch={dispatch}
            {...props}
          />
        )}
      />

      <Route
        exact
        path={[`${match.path}/new_conversations`]}
        render={(props) => (
          <BotDataTable
            app={app}
            history={history}
            match={match}
            mode={'new_conversations'}
            dispatch={dispatch}
            {...props}
          />
        )}
      />

      <Route
        exact
        path={[`${match.path}/outbound/:id`]}
        render={(props) => {
          return (
            <BotEditor
              app={app}
              mode={'leads'}
              match={match}
              actions={actions}
              {...props}
            />
          );
        }}
      />

      <Route
        exact
        path={`${match.path}/new_conversations/:id`}
        render={(props) => {
          return (
            <BotEditor app={app} mode={'users'} match={match} {...props} />
          );
        }}
      />
    </Switch>
  );
};

function mapStateToProps(state) {
  const { auth, app, segment, app_user, current_user, drawer } = state;
  const { loading, isAuthenticated } = auth;
  return {
    current_user,
    app_user,
    segment,
    app,
    loading,
    isAuthenticated,
    drawer,
  };
}

export default withRouter(connect(mapStateToProps)(BotContainer));
