import React, { Component, useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import styled from '@emotion/styled';
//import JsonDebug from '../../shared/jsonDebug'
import Segment from './segment';
import BotTaskSetting from './taskSettings';
import I18n from '../../shared/FakeI18n';

import TextEditor from '@chaskiq/components/src/components/textEditor';
import UpgradeButton from '@chaskiq/components/src/components/upgradeButton';
import InplaceInputEditor from '@chaskiq/components/src/components/InplaceInputEditor';
import SwitchControl from '@chaskiq/components/src/components/Switch';
import ContentHeader from '@chaskiq/components/src/components/PageHeader';
import Content from '@chaskiq/components/src/components/Content';
import FormDialog from '@chaskiq/components/src/components/FormDialog';
import Input from '@chaskiq/components/src/components/forms/Input';
import Dropdown from '@chaskiq/components/src/components/Dropdown';
import Button from '@chaskiq/components/src/components/Button';
import Tabs from '@chaskiq/components/src/components/Tabs';
import ErrorBoundary from '@chaskiq/components/src/components/ErrorBoundary';
import { DefinitionRenderer } from '@chaskiq/components/src/components/packageBlocks/components';
import Stats from '@chaskiq/components/src/components/stats';
import FilterMenu from '@chaskiq/components/src/components/FilterMenu';
import {
  PlusIcon,
  DragHandle,
  DeleteForever,
  CopyContentIcon,
  DeleteForeverRounded,
} from '@chaskiq/components/src/components/icons';

import List, { ListItem } from '@chaskiq/components/src/components/List';

import AppPackagePanel from '../conversations/appPackagePanel';

import { isEmpty } from 'lodash';

import graphql from '@chaskiq/store/src/graphql/client';

import {
  setCurrentPage,
  setCurrentSection,
} from '@chaskiq/store/src/actions/navigation';

import {
  errorMessage,
  successMessage,
} from '@chaskiq/store/src/actions/status_messages';

import {
  BOT_TASK,
  AGENTS,
  BOT_TASK_METRICS,
} from '@chaskiq/store/src/graphql/queries';
import {
  UPDATE_BOT_TASK,
  CLONE_MESSAGE,
} from '@chaskiq/store/src/graphql/mutations';

const ItemManagerContainer = styled.div`
  flex-grow: 4;
  margin-right: 19px;
`;

const ItemsContainer = styled.div`
  box-shadow: 0 24px 0 0 #fff, 0 -24px 0 0 #fff,
    16px 0 32px -12px rgba(0, 0, 0, 0.1), -16px 0 32px -12px rgba(0, 0, 0, 0.1);
`;

const PathActionsContainer = styled.div`
  align-items: flex-end;
  border-radius: 0 0 8px 8px;
  box-sizing: border-box;
  box-shadow: 0 16px 32px -12px rgba(0, 0, 0, 0.1), 0 -24px 0 0 #fff,
    16px 0 32px -12px rgba(0, 0, 0, 0.1), -16px 0 32px -12px rgba(0, 0, 0, 0.1);
  padding: 20px 20px 24px;
`;

type ItemButtonsType = {
  first?: boolean;
};
const ItemButtons = styled.div<ItemButtonsType>`
  align-self: center;
  /* width: 203px; */
  align-items: center;
  display: flex;
  flex-grow: 1;

  justify-content: ${(props) => (props.first ? 'flex-start' : 'flex-end')};
`;

const ControlWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-flow: column;
`;

function create_UUID() {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
}

const PathDialog = ({ close, isOpen, submit }) => {
  let titleRef: any = React.createRef();
  // const titleRef = null

  const handleSubmit = () => {
    submit({
      id: create_UUID(),
      title: titleRef.value,
      steps: [],
    });
  };

  return (
    isOpen && (
      <FormDialog
        open={isOpen}
        handleClose={close}
        // contentText={"lipsum"}
        titleContent={'Create Path'}
        formComponent={
          <form>
            <Input
              label="None"
              id="title"
              type={'text'}
              ref={(ref) => (titleRef = ref)}
              placeholder={'write path title'}
              // defaultValue="Default Value"
              // className={classes.textField}
              helperText="Some important text"
            />
          </form>
        }
        dialogButtons={
          <React.Fragment>
            <Button onClick={close} variant="outlined">
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              data-cy="bot-task-create-path"
              className="mr-1"
            >
              Create
            </Button>
          </React.Fragment>
        }
        // actions={actions}
        // onClose={this.close}
        // heading={this.props.title}
      ></FormDialog>
    )
  );
};

type BotTaskType = {
  segments?: any;
  title?: any;
  scheduling?: any;
  state?: any;
  urls?: any;
};

const BotEditor = ({ match, app, dispatch, mode }) => {
  const [botTask, setBotTask] = useState<BotTaskType>({});
  const [errors, setErrors] = useState({});
  const [paths, setPaths] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchFields, setSearchFields] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);

  useEffect(() => {
    graphql(
      BOT_TASK,
      {
        appKey: app.key,
        id: match.params.id,
      },
      {
        success: (data) => {
          setBotTask(data.app.botTask);
          setPaths(data.app.botTask.paths);
          setSelectedPath(data.app.botTask.paths[0]);
        },
        error: (_err) => {},
      }
    );

    dispatch(setCurrentSection('Bot'));
    dispatch(setCurrentPage(`bot${mode}`));
  }, []);

  const saveData = (cb = null) => {
    const snake_case_paths = paths.map((o) => {
      const b = Object.assign({}, o, { follow_actions: o.followActions });
      delete b.followActions;
      return b;
    });

    graphql(
      UPDATE_BOT_TASK,
      {
        appKey: app.key,
        id: match.params.id,
        params: {
          paths: snake_case_paths,
          segments: botTask.segments,
          title: botTask.title,
          scheduling: botTask.scheduling,
          state: botTask.state,
          urls: botTask.urls,
        },
      },
      {
        success: (data) => {
          setPaths(data.updateBotTask.botTask.paths);
          setErrors(data.updateBotTask.botTask.errors);
          // setSelectedPath(data.updateBotTask.botTask.paths[0]);
          dispatch(successMessage(I18n.t('status_messages.updated_success')));
          cb && cb();
        },
        error: (_err) => {
          dispatch(errorMessage(I18n.t('status_messages.error_success')));
        },
      }
    );
  };

  const toggleBotState = () => {
    graphql(
      UPDATE_BOT_TASK,
      {
        appKey: app.key,
        id: match.params.id,
        params: {
          state: botTask.state === 'enabled' ? 'disabled' : 'enabled',
        },
      },
      {
        success: (data) => {
          setBotTask(data.updateBotTask.botTask);
          dispatch(successMessage(I18n.t('status_messages.updated_success')));
        },
        error: (_err) => {
          dispatch(errorMessage(I18n.t('status_messages.updated_error')));
        },
      }
    );
  };

  const handleTabChange = (e, i) => {
    setTabValue(i);
  };

  const tabsContent = () => {
    return (
      <Tabs
        currentTab={tabValue}
        onChange={handleTabChange}
        textColor="inherit"
        tabs={[
          {
            label: I18n.t('campaigns.tabs.stats'),
            content: (
              <React.Fragment>
                {!isEmpty(botTask) && (
                  <Stats
                    data={botTask}
                    getStats={getStats}
                    mode={'counter_blocks'}
                  />
                )}
              </React.Fragment>
            ),
          },
          {
            label: I18n.t('campaigns.tabs.settings'),
            content: (
              <BotTaskSetting
                app={app}
                data={botTask}
                updateData={setBotTask}
                saveData={saveData}
              />
            ),
          },
          {
            label: I18n.t('campaigns.tabs.audience'),
            content: (
              <Segment
                app={app}
                data={botTask}
                updateData={(task) => {
                  setBotTask(task);
                }}
                handleSave={(segments, cb) => {
                  setBotTask(
                    Object.assign({}, botTask, {
                      segments: segments,
                    })
                  );
                  saveData(cb);
                }}
              />
            ),
          },
          {
            label: I18n.t('campaigns.tabs.editor'),
            content: (
              <div>
                <BotPathEditor
                  app={app}
                  botTask={botTask}
                  // updateData={setBotTask}
                  saveData={saveData}
                  // errors={errors}
                  paths={paths}
                  setPaths={setPaths}
                  searchFields={searchFields}
                  selectedPath={selectedPath}
                  setSelectedPath={setSelectedPath}
                />
                {/*<JsonDebug data={paths}/>*/}
              </div>
            ),
          },
        ]}
      ></Tabs>
    );
  };

  const getStats = (params, cb) => {
    graphql(BOT_TASK_METRICS, params, {
      success: (data) => {
        setSearchFields(data.app.searcheableFields);
        const d = data.app.botTask;
        cb(d);
      },
      error: (_error) => {},
    });
  };

  function optionsForFilter() {
    return [
      {
        title: I18n.t('campaigns.clone_title'),
        description: I18n.t('campaigns.clone_description'),
        icon: <CopyContentIcon />,
        id: 'enabled',
        state: 'enabled',
        onClick: cloneCampaign,
      },
    ];
  }

  function cloneCampaign(_e) {
    const params = {
      appKey: app.key,
      //@ts-ignore
      id: `${botTask.id}`,
    };

    graphql(CLONE_MESSAGE, params, {
      success: (_data) => {
        dispatch(successMessage(I18n.t('campaigns.cloned_success')));

        // this.props.init()
      },
      error: () => {
        dispatch(errorMessage(I18n.t('campaigns.cloned_error')));
      },
    });
  }

  function updateTitle(title) {
    graphql(
      UPDATE_BOT_TASK,
      {
        appKey: app.key,
        id: match.params.id,
        params: {
          title: title,
        },
      },
      {
        success: (data) => {
          setBotTask(data.updateBotTask.botTask);
        },
        error: () => {},
      }
    );
  }

  return (
    <div>
      <Content>
        <ContentHeader
          title={
            <div>
              <InplaceInputEditor
                defaultValue={botTask.title}
                update={updateTitle}
              />
            </div>
          }
          actions={
            <div className="flex space-x-2 items-center">
              <UpgradeButton
                classes={`absolute z-10 ml-1 mt-3 transform w-screen 
                max-w-md px-2 origin-top-right right-0
                md:-ml-4 sm:px-0 lg:ml-0
                lg:right-2/6 lg:translate-x-1/6`}
                label="Activate Bot Task"
                feature="BotTasks"
              >
                <SwitchControl
                  label={
                    botTask.state === 'disabled'
                      ? I18n.t('campaigns.enables')
                      : I18n.t('campaigns.disables')
                  }
                  setEnabled={toggleBotState}
                  enabled={botTask.state === 'enabled'}
                />
              </UpgradeButton>

              <FilterMenu
                options={optionsForFilter()}
                value={I18n.t('common.actions')}
                filterHandler={(option, _closeHandler) => {
                  return option.onClick && option.onClick(option);
                }}
                position={'right'}
              />
            </div>
          }
        />
        {tabsContent()}
      </Content>
    </div>
  );
};

export function BotPathEditor({
  saveData,
  paths,
  app,
  setPaths,
  searchFields,
  selectedPath,
  setSelectedPath,
  botTask,
}) {
  const [isOpen, setOpen] = useState(false);
  // const [changed, setChanged] = useState(null)
  const [openPackagePanel, setOpenPackagePanel] = useState(null);
  const [menuDisplay, setMenuDisplay] = useState(false);

  const open = () => setOpen(true);
  const close = () => setOpen(false);

  const showPathDialog = () => {
    setOpen(true);
  };

  const handleSelection = (item) => {
    setSelectedPath(item);
  };

  const reorderPathSteps = (path) => {
    let newSteps = path.steps.filter(
      (o) => !o.controls || o.controls.type !== 'ask_option'
    );

    const controlStep = path.steps.find(
      (o) => o.controls && o.controls.type === 'ask_option'
    );

    if (controlStep) {
      newSteps = newSteps.concat(controlStep);
    }

    return { ...path, steps: newSteps };
  };

  const addUpdatedPath = (path, data) => {
    const newSteps = path.steps.concat(data);
    const newPath = reorderPathSteps(
      Object.assign({}, path, { steps: newSteps })
    );

    const newPaths = paths.map((o) => {
      if (o.id === path.id) {
        return newPath;
      } else {
        return o;
      }
    });

    setPaths(newPaths);
    setSelectedPath(newPath); // redundant
  };

  const addSectionMessage = (path) => {
    const dummy = {
      step_uid: create_UUID(),
      type: 'messages',
      messages: [
        {
          app_user: {
            display_name: 'bot',
            email: 'bot@chasqik.com',
            id: 1,
            kind: 'agent',
          },
          serialized_content:
            '{"blocks":[{"key":"9oe8n","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
          html_content: '--***--',
        },
      ],
    };

    addUpdatedPath(path, dummy);
  };

  const addWaitUserMessage = (path) => {
    const id = create_UUID();
    const dummy = {
      step_uid: id,
      type: 'messages',
      messages: [],
      controls: {
        type: 'wait_for_reply',
        schema: [],
      },
    };

    addUpdatedPath(path, dummy);
  };

  const addSectionControl = (path) => {
    const id = create_UUID();
    const dummy = {
      step_uid: id,
      type: 'messages',
      messages: [],
      controls: {
        type: 'ask_option',
        schema: [
          {
            id: create_UUID(),
            element: 'button',
            label: 'write here',
            next_step_uuid: null,
          },
          // {element: "button", label: "quiero contratar el producto", next_step_uuid: 3},
          // {element: "button", label: "estoy solo mirando", next_step_uuid: 4}
        ],
      },
    };
    addUpdatedPath(path, dummy);
  };

  const addDataControl = (path) => {
    const id = create_UUID();
    const dummy = {
      step_uid: id,
      messages: [],
      controls: {
        type: 'data_retrieval',
        schema: [
          {
            id: create_UUID(),
            element: 'input',
            type: 'text',
            placeholder: 'enter email',
            name: 'email',
            label: 'enter your email',
          },
        ],
      },
    };
    addUpdatedPath(path, dummy);
  };

  const insertAddPackage = (p) => {
    const { provider } = p;
    const id = create_UUID();
    const dummy = {
      step_uid: id,
      messages: [],
      controls: {
        type: 'app_package',
        app_package: provider.name,
        schema: provider.schema,
      },
    };
    const path = openPackagePanel;
    addUpdatedPath(path, dummy);
  };

  const addEmptyPath = (data) => {
    addPath(data);
    close();
    setSelectedPath(data);
  };

  const addAppPackage = (path) => {
    setOpenPackagePanel(path);
  };

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    // avoid sort the first item
    if (result.destination.index === 0) {
      return;
    }

    const newPaths = reorder(
      paths,
      result.source.index,
      result.destination.index
    );

    setPaths(newPaths);
  };

  const addPath = (path) => {
    const newPaths = paths.concat(path);
    setPaths(newPaths);
  };

  const updatePath = (path) => {
    const newPaths = paths.map((o) => (o.id === path.id ? path : o));
    setPaths(newPaths);
    setSelectedPath(newPaths.find((o) => o.id === path.id)); // redundant
  };

  return (
    <div>
      <div className="sm:hidden p-2 bg-white flex items-center justify-center">
        <span className="relative z-0 inline-flex shadow-sm rounded-md">
          <button
            onClick={() => setMenuDisplay(true)}
            type="button"
            className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            Paths
          </button>
          <button
            onClick={() => setMenuDisplay(false)}
            type="button"
            className="-ml-px relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            Editor
          </button>
        </span>
      </div>

      <div className="flex justify-between sm:my-4 border-1 border-gray-400 rounded-md shadow border dark:border-gray-600">
        {isOpen && (
          <PathDialog isOpen={isOpen} close={close} submit={addEmptyPath} />
        )}

        <div
          className={`${
            !menuDisplay ? 'hidden' : ''
          } sm:w-2/4 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 sm:flex flex-col py-3 sm:relative absolute z-10 w-full px-5`}
        >
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppablePaths">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={getPathStyle(snapshot.isDraggingOver)}
                >
                  {paths.map((item, index) => (
                    <Draggable
                      key={`path-list-${item.id}-${index}`}
                      draggableId={item.id}
                      index={index}
                      isDragDisabled={index === 0}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                          className="mb-2 mx-2 items-center"
                        >
                          <strong className="mr-2">{index}.</strong>

                          <button
                            onClick={(_e) => handleSelection(item)}
                            className={`
                            ${
                              selectedPath && selectedPath.id === item.id
                                ? 'ring-2 ring-black'
                                : ''
                            }
                            focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50
                            cursor-pointer w-full py-2 px-2 bg-white dark:bg-gray-900 border-1 shadow max-w-3xl break-all flex items-center`}
                          >
                            <div
                              first={true}
                              className={`mr-2 ${
                                index === 0 ? 'hidden' : 'block'
                              }`}
                              {...provided.dragHandleProps}
                            >
                              <DragHandle />
                            </div>

                            <span>{item.title}</span>
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <Button
            size="small"
            variant={'flat-dark'}
            onClick={showPathDialog}
            color="primary"
            className="self-center"
          >
            <PlusIcon />
            Add new path
          </Button>
        </div>

        <div className="w-full shadow">
          <div className="top-0 sticky py-4">
            {selectedPath && (
              <ErrorBoundary>
                <Path
                  botTask={botTask}
                  app={app}
                  path={selectedPath}
                  paths={paths}
                  addWaitUserMessage={addWaitUserMessage}
                  addSectionMessage={addSectionMessage}
                  addSectionControl={addSectionControl}
                  addDataControl={addDataControl}
                  addAppPackage={addAppPackage}
                  updatePath={updatePath}
                  // saveData={saveData}
                  setPaths={setPaths}
                  setSelectedPath={setSelectedPath}
                  searchFields={searchFields}
                />
              </ErrorBoundary>
            )}

            <div className="m-4 flex justify-center">
              <Button
                variant="success"
                color="primary"
                size="medium"
                onClick={saveData}
              >
                {I18n.t('task_bots.save_data')}
              </Button>
            </div>
          </div>
        </div>

        {openPackagePanel && (
          <AppPackagePanel
            open={openPackagePanel}
            kind={'bots'}
            close={() => {
              setOpenPackagePanel(false);
            }}
            insertComment={(data) => {
              insertAddPackage(data);
              setOpenPackagePanel(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

function FollowActionsSelect({ app, path, updatePath }) {
  const options = [
    {
      key: 'close',
      name: I18n.t('task_bots.close_conversation'),
      value: null,
    },
    { key: 'assign', name: I18n.t('task_bots.assign_agent'), value: null },
    // {action_name: "tag", value: null },
    // {action_name: "app_content", value: null },
  ];

  // console.log("PATH FOLLOW ACTIONS", path.followActions, path)

  //const [selectMode, setSelectMode] = useState(null)
  const [actions, setActions] = useState(path.followActions || []);

  useEffect(() => {
    updateData();
  }, [JSON.stringify(actions)]);

  useEffect(() => {
    setActions(path.followActions || []);
  }, [path.id]);

  function updateData() {
    if (!path) return;

    const newPath = Object.assign({}, path, {
      // follow_actions: actions,
      followActions: actions,
    });
    updatePath(newPath);
  }

  /*function renderAddButton () {
    return (
      <Button
        variant="outlined"
        onClick={() => {
          setSelectMode(true)
        }}
      >
        add option
      </Button>
    )
  }*/

  function handleClick(a) {
    setActions(actions.concat(a));
  }

  function renderActions() {
    return actions.map((o, i) => renderActionType(o, i));
  }

  function availableOptions() {
    if (actions.length === 0) return options;
    return options.filter((o) => !actions.find((a) => a.key === o.key));
  }

  function updateAction(action, index) {
    const newActions = actions.map((o, i) => (i === index ? action : o));
    setActions(newActions);
  }

  function removeAction(index) {
    const newActions = actions.filter((o, i) => i != index);
    setActions(newActions);
  }

  function renderActionType(action, i) {
    switch (action.key) {
      case 'assign':
        return (
          <AgentSelector
            app={app}
            index={i}
            action={action}
            updateAction={updateAction}
            removeAction={removeAction}
            key={action.key}
          />
        );

      default:
        return (
          <div className={'flex items-center mb-2'} key={action.key}>
            <p>{action.name}</p>
            <Button
              variant="icon"
              color={'secondary'}
              onClick={() => removeAction(i)}
            >
              <DeleteForeverRounded />
            </Button>
          </div>
        );
    }
  }

  const menuOptions = availableOptions();

  return (
    <div>
      {renderActions()}

      {menuOptions.length > 0 && (
        <div className="py-4">
          <Dropdown
            isOpen={false}
            labelButton={'add'}
            triggerButton={(cb) => (
              <Button
                onClick={cb}
                color="primary"
                size={'small'}
                variant="outlined"
                aria-label="add"
              >
                <PlusIcon />
                {I18n.t('task_bots.add_follow_action')}
              </Button>
            )}
          >
            <List>
              {menuOptions.map((o) => (
                <ListItem key={o.key} onClick={() => handleClick(o)}>
                  {o.name}
                </ListItem>
              ))}
            </List>
          </Dropdown>
        </div>
      )}
    </div>
  );
}

function AgentSelector({ app, updateAction, removeAction, action, index }) {
  const [selected, setSelected] = React.useState(action.value);
  const [agents, setAgents] = React.useState([]);
  const [_mode, setMode] = React.useState('button');

  function getAgents() {
    graphql(
      AGENTS,
      { appKey: app.key },
      {
        success: (data) => {
          setAgents(data.app.agents);
        },
        error: (_error) => {},
      }
    );
  }

  useEffect(() => {
    if (action.value) setSelected(action.value);
  }, [action.value]);

  useEffect(() => {
    getAgents();
  }, []);

  useEffect(() => {
    const agent = agents.find((o) => selected === o.id);
    updateAction(
      Object.assign({}, action, { value: agent && agent.id }),
      index
    );
  }, [selected]);

  function handleChange(e) {
    setSelected(e.value);
    setMode('button');
  }

  function selectedAgent() {
    const agent = agents.find((o) => selected === o.id);
    if (!agent) return '';
    return { label: agent.name || agent.email, value: selected };
  }

  return (
    <div>
      <div className="flex items-center">
        <div className="w-64">
          <Input
            type="select"
            value={selectedAgent()}
            onChange={handleChange}
            defaultValue={selectedAgent()}
            name={'agent'}
            id={'agent'}
            label={I18n.t('task_bots.assignee_agent')}
            data={{}}
            options={agents.map((o) => ({
              label: o.email,
              value: o.id,
            }))}
          ></Input>
        </div>

        <div>
          <Button variant={'icon'} onClick={() => removeAction(index)}>
            <DeleteForeverRounded />
          </Button>
        </div>
      </div>
    </div>
  );
}

const FirstPath = ({
  controlStep,
  path,
  options,
  appendItemControl,
  updateControlPathSelector,
}) => {
  return (
    <div className="m-5">
      <p className="text-sm text-center text-gray-500 font-semibold leading-4 my-6">
        {I18n.t('task_bots.new_conversations_notice')}
      </p>

      <ItemsContainer className="p-4">
        <input
          placeholder="can we help ?"
          defaultValue={controlStep.controls.label}
          className="py-2 mb-4 border-dotted border-gray-400 dark:bg-gray-900 focus:border-gray-900 border-b-2 border-b-red focus:outline-none outline-none"
          onChange={(e) => {
            updateControlPathSelector(
              {
                ...controlStep.controls,
                label: e.currentTarget.value,
              },
              controlStep
            );
          }}
        />

        <FollowActions
          controlStep={controlStep}
          path={path}
          update={(opts) => updateControlPathSelector(opts, controlStep)}
          options={options}
          appendItemControl={appendItemControl}
        />
      </ItemsContainer>
    </div>
  );
};

const Path = ({
  botTask,
  paths,
  path,
  addSectionMessage,
  addWaitUserMessage,
  addSectionControl,
  addAppPackage,
  addDataControl,
  updatePath,
  setPaths,
  setSelectedPath,
  searchFields,
  app,
}) => {
  const [showActions, setShowActions] = React.useState(false);

  const addStepMessage = (path) => {
    addSectionMessage(path);
  };

  const deleteItem = (path, step) => {
    const newSteps = path.steps.filter((o) => o.step_uid != step.step_uid);
    const newPath = Object.assign({}, path, { steps: newSteps });
    updatePath(newPath);
  };

  const deletePath = (path) => {
    const newPaths = paths.filter((o) => o.id != path.id);
    console.log(newPaths);
    setPaths(newPaths);
    setSelectedPath(null);
  };

  const onDragEnd = (path, result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    let newSteps = reorder(
      path.steps.filter((o) => !o.controls || o.controls.type !== 'ask_option'),
      result.source.index,
      result.destination.index
    );

    const controlStep = path.steps.find(
      (o) => o.controls && o.controls.type === 'ask_option'
    );

    if (controlStep) {
      newSteps = newSteps.concat(controlStep);
    }

    const newPath = { ...path, steps: newSteps };

    updatePath(newPath);
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    const newPath = Object.assign({}, path, { title: value });
    updatePath(newPath);
  };

  const options = [
    {
      name: I18n.t('task_bots.options.add_message'),
      key: 'add-message',
      onClick: () => {
        addStepMessage(path);
      },
    } /* {
      name: "Add path chooser",
      key: "add-path-choooser",
      onClick: () => {
        addSectionControl(path);
      },
    }, */,

    {
      name: I18n.t('task_bots.options.wait_user_input'),
      key: 'wait-user-input',
      onClick: () => {
        addWaitUserMessage(path);
      },
    },
    /*{
      name: 'Ask data input',
      key: 'ask-data-input',
      onClick: () => {
        addDataControl(path)
      }
    },*/
    {
      name: I18n.t('task_bots.options.add_app_package'),
      key: 'add-app-package',
      onClick: () => {
        addAppPackage(path);
      },
    },
  ];

  const updateControlPathSelector = (controls, step) => {
    updateControls(controls, step);
  };

  const appendItemControl = (step) => {
    const item = {
      id: create_UUID(),
      label: 'example',
      element: 'button',
      next_step_uuid: null,
    };

    const newControls = Object.assign({}, step.controls, {
      schema: step.controls.schema.concat(item),
      wait_for_input: true,
    });
    updateControls(newControls, step);
  };

  const updateControls = (newControls, step) => {
    const newStep = Object.assign({}, step, { controls: newControls });

    const newSteps = path.steps.map((o) => {
      return o.step_uid === newStep.step_uid ? newStep : o;
    });

    const newPath = Object.assign({}, path, { steps: newSteps });
    updatePath(newPath);
  };

  const findControlItemStep = () =>
    path.steps.find((o) => o.controls && o.controls.type === 'ask_option');

  const controlStep = findControlItemStep();

  const stepOptions = paths.map((o) => ({
    value: o.steps[0] && o.steps[0].step_uid,
    label: o.title,
  }));

  const findPathIndex = paths.findIndex((p) => p.id === path.id);

  const renderControls = () => {
    return (
      <div className="w-full p-6 border-b-2 border-gray-200 dark:border-black">
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="text-lg text-center text-gray-900 font-semibold leading-4 my-6 mr-3">
              {findPathIndex}
            </div>
            <Input
              type="text"
              value={path.title}
              onChange={handleTitleChange}
              helperText={I18n.t('task_bots.path_title_hint')}
              variant={'underline'}
            />
          </div>

          {!needsLock() && (
            <div className="items-end">
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => deletePath(path)}
              >
                <DeleteForever />
                {I18n.t('task_bots.delete_path')}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const needsLock = () => {
    return findPathIndex === 0 && botTask.botType === 'new_conversations';
  };

  if (findPathIndex === 0 && botTask.botType === 'new_conversations') {
    // and type new_conversations
    return (
      <div>
        {renderControls()}
        <FirstPath
          path={path}
          appendItemControl={appendItemControl}
          updateControlPathSelector={updateControlPathSelector}
          controlStep={controlStep}
          options={stepOptions}
        ></FirstPath>
      </div>
    );
  }

  return (
    <div>
      {renderControls()}

      <div className="p-4 flex flex-col justify-center items-center">
        <ItemsContainer className="p-2 sm:p-4 sm:w-3/4 sm:mt-8 mt:2">
          <SortableSteps
            steps={path.steps}
            path={path}
            paths={paths}
            addSectionMessage={addSectionMessage}
            addSectionControl={addSectionControl}
            updatePath={updatePath}
            deleteItem={deleteItem}
            onDragEnd={onDragEnd}
            searchFields={searchFields}
            updateControlPathSelector={updateControlPathSelector}
          />

          <div className="flex justify-start">
            <Dropdown
              isOpen={false}
              labelButton={'add'}
              triggerButton={(cb) => (
                <Button
                  onClick={cb}
                  color="primary"
                  size={'small'}
                  variant="outlined"
                  aria-label="add"
                >
                  <PlusIcon />
                  {I18n.t('task_bots.add_path')}
                </Button>
              )}
            >
              <List>
                {options.map((o) => (
                  <ListItem key={o.key} onClick={o.onClick}>
                    {o.name}
                  </ListItem>
                ))}
              </List>
            </Dropdown>
          </div>
        </ItemsContainer>

        {/* <hr/> */}
      </div>

      <hr className="my-4 w-full border-4" />

      <div className="p-4 flex flex-col justify-center items-center">
        <div className="flex">
          {!controlStep &&
            !showActions &&
            (!path.followActions || path.followActions.length === 0) && (
              <div className="flex items-center mr-4">
                {I18n.t('task_bots.continue_bot_with')}
                <Button
                  variant="outlined"
                  className="ml-2"
                  onClick={() => addSectionControl(path)}
                >
                  {I18n.t('task_bots.reply_button')}
                </Button>
              </div>
            )}

          {!controlStep &&
            !showActions &&
            (!path.followActions || path.followActions.length < 1) && (
              <div className="flex items-center">
                {I18n.t('task_bots.end_bot_with')}
                <Button
                  variant="outlined"
                  className="ml-2"
                  onClick={() => setShowActions(true)}
                >
                  {I18n.t('task_bots.follow_actions')}
                </Button>
              </div>
            )}
        </div>

        {controlStep && (
          <PathActionsContainer className="w-full mt-4 sm:w-3/4 sm:mt-8">
            <p className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100 py-4">
              {I18n.t('task_bots.continue_with_reply_button')}
            </p>

            <ItemButtons className="self-end">
              <Button
                variant={'icon'}
                onClick={() => deleteItem(path, controlStep)}
              >
                <DeleteForever />
              </Button>
            </ItemButtons>

            <FollowActions
              controlStep={controlStep}
              path={path}
              update={(opts) => updateControlPathSelector(opts, controlStep)}
              options={stepOptions}
              searchFields={searchFields}
              appendItemControl={appendItemControl}
            />
          </PathActionsContainer>
        )}

        {(showActions ||
          (!controlStep &&
            path.followActions &&
            path.followActions.length > 0)) && (
          <div className="flex align-start flex-col w-3/4">
            <p className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-200 py-4">
              {I18n.t('task_bots.end_with_follow')}
            </p>

            <div className="self-end">
              <Button
                variant="icon"
                color="secondary"
                onClick={() => {
                  updatePath({ ...path, followActions: [] });
                  setShowActions(false);
                }}
              >
                <DeleteForever />
              </Button>
            </div>

            <FollowActionsSelect
              app={app}
              updatePath={updatePath}
              path={path}
            />

            {/* <p className="max-w-xl text-sm leading-5 text-gray-500 mb-4">
              Hint: Follow actions will be triggered on paths that ends with
              message bubbles. Paths that ends with path chooser will not trigger
              follow actions.
            </p> */}
          </div>
        )}
      </div>
    </div>
  );
};

type FollowActionsProps = {
  controlStep: any;
  path: any;
  update: any;
  options: any;
  searchFields?: any;
  appendItemControl?: any;
};

const FollowActions = ({
  controlStep,
  path,
  update,
  options,
  searchFields,
  appendItemControl,
}: FollowActionsProps) => {
  return (
    <div className="flex flex-col">
      <div className="w-full">
        <ControlWrapper>
          {controlStep.controls && (
            <AppPackageBlocks
              controls={controlStep.controls}
              path={path}
              step={controlStep}
              options={options.filter((o) => o.value)}
              searchFields={searchFields}
              update={update}
            />
          )}
        </ControlWrapper>
      </div>

      {controlStep.controls && controlStep.controls.type === 'ask_option' && (
        <div
          className="w-full flex items-center"
          onClick={() => appendItemControl(controlStep)}
        >
          <Button color={'primary'} variant={'outlined'} size="small">
            {I18n.t('task_bots.add_data_option')}
          </Button>

          {/* <p>
              Save this value to user properties
              <
              [save]
            </p> */}
        </div>
      )}
    </div>
  );
};

const PathEditor = ({ step, message, path, updatePath }) => {
  const [readOnly, setReadOnly] = useState(false);

  const saveHandler = (html, serialized) => {
    console.log('savr handler', serialized);
  };

  const saveContent = ({ _html, serialized }) => {
    const newMessage = Object.assign({}, message, {
      serialized_content: serialized,
    });

    const newSteps = path.steps.map((o) => {
      return o.step_uid === step.step_uid
        ? Object.assign({}, o, { messages: [newMessage] })
        : o;
    });

    const newPath = Object.assign({}, path, { steps: newSteps });
    updatePath(newPath);
  };

  const uploadHandler = ({ serviceUrl, imageBlock }) => {
    imageBlock.uploadCompleted(serviceUrl);
  };

  return (
    <div className="shadow border border-gray-400 rounded p-6 relative dark:bg-gray-800 bg-gray-100 max-w-sm">
      <TextEditor
        uploadHandler={uploadHandler}
        serializedContent={message.serialized_content}
        read_only={readOnly}
        toggleEditable={() => {
          setReadOnly(!readOnly);
        }}
        data={{
          serialized_content: message.serialized_content,
        }}
        styles={{
          lineHeight: '1.2em',
          fontSize: '1em',
        }}
        saveHandler={saveHandler}
        updateState={({ _status, _statusButton, content }) => {
          //console.log('get content', content);
          saveContent(content);
        }}
      />
    </div>
  );
};

// APP Package Preview
const AppPackageBlocks = ({
  options,
  controls,
  path,
  step,
  update,
  searchFields,
}) => {
  const { schema } = controls;

  const updateOption = (value, option) => {
    const newOption = Object.assign({}, option, { next_step_uuid: value });
    const newOptions = controls.schema.map((o) =>
      o.id === newOption.id ? newOption : o
    );
    const newControls = Object.assign({}, controls, { schema: newOptions });
    update(newControls);
  };

  const removeOption = (index) => {
    const newOptions = controls.schema.filter((o, i) => i != index);
    const newControls = Object.assign({}, controls, { schema: newOptions });
    update(newControls);
  };

  const handleInputChange = (value, option, index) => {
    const newOption = Object.assign({}, option, { label: value });
    const newOptions = controls.schema.map((o, i) =>
      i === index ? newOption : o
    );
    const newControls = Object.assign({}, controls, { schema: newOptions });
    update(newControls);
  };

  const renderElement = (item, index) => {
    switch (item.element) {
      case 'separator':
        return <hr key={index} />;
      case 'input':
        return (
          <div className={'form-group'} key={index}>
            <DataInputSelect
              controls={controls}
              update={update}
              item={item}
              options={searchFields.map((o) => ({
                value: o.name,
                label: o.name,
              }))}
            />
          </div>
        );
      case 'submit':
        return (
          <button key={index} style={{ alignSelf: 'flex-end' }} type={'submit'}>
            {item.label}
          </button>
        );
      case 'button':
        return (
          <div className="flex justify-between items-center relative">
            <div className="w-full">
              <Input
                value={item.label}
                type={'text'}
                onChange={(e) => handleInputChange(e.target.value, item, index)}
              />
            </div>

            <div className="w-3/4 px-2">
              {controls && controls.type === 'ask_option' ? (
                <PathSelect
                  option={item}
                  options={options}
                  update={updateOption}
                />
              ) : null}
            </div>

            <div>
              <Button variant="icon" onClick={() => removeOption(index)}>
                <DeleteForeverRounded />
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderElements = () => {
    return schema.map((o, i) => renderElement(o, i));
  };

  return renderElements();
};

// SORTABLE

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  // padding: grid * 2,
  // margin: `0 0 ${grid}px 0`,
  display: 'flex',
  justifyContent: 'space-evenly',
  // change background colour if dragging
  // background: isDragging ? "lightgreen" : "transparent",
  paddingBottom: '1.2em',
  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (_isDraggingOver) => ({
  // background: isDraggingOver ? "lightblue" : "transparent",
  padding: grid,
  // width: 250
});

const getPathStyle = (isDraggingOver) => ({
  background: isDraggingOver ? 'lightblue' : 'transparent',
  padding: 2,
  // width: 250
});

type SortableStepsProps = {
  steps: any;
  path: any;
  paths: any;
  deleteItem: any;
  updatePath: any;
  updateControlPathSelector: any;
  searchFields: any;
  addSectionMessage?: any;
  addSectionControl?: any;
  onDragEnd: (path: string, result: string) => void;
};

class SortableSteps extends Component<SortableStepsProps> {
  constructor(props) {
    super(props);
  }

  onDragEnd = (result) => {
    this.props.onDragEnd(this.props.path, result);
  };

  render() {
    const {
      steps,
      path,
      paths,
      deleteItem,
      updatePath,
      updateControlPathSelector,
      searchFields,
    } = this.props;

    const stepsWithoutcontrols = steps.filter(
      (o) => !o.controls || o.controls.type !== 'ask_option'
    );

    const stepOptions = paths.map((o) => ({
      value: o.steps[0] && o.steps[0].step_uid,
      label: o.title,
    }));

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {stepsWithoutcontrols.map((item, index) => (
                <Draggable
                  key={item.step_uid}
                  draggableId={item.step_uid}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="mb-4"
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      <ItemButtons first={true} {...provided.dragHandleProps}>
                        <DragHandle />
                      </ItemButtons>

                      <ItemManagerContainer>
                        {item.controls &&
                          item.controls.type === 'wait_for_reply' && (
                            <div className="p-4 bg-blue-100 text-blue-300 border border-md border-blue-300 rounded-md">
                              ... wait for user input ...
                            </div>
                          )}

                        {item.messages &&
                          item.messages.map((message) => (
                            <PathEditor
                              key={`path-editor-${path.id}`}
                              path={path}
                              step={item}
                              message={message}
                              updatePath={updatePath}
                            />
                          ))}

                        <div>
                          <ControlWrapper>
                            {item.controls &&
                              item.controls.type !== 'ask_option' &&
                              item.controls.type !== 'app_package' && (
                                <AppPackageBlocks
                                  controls={item.controls}
                                  path={path}
                                  step={item}
                                  options={stepOptions}
                                  searchFields={searchFields}
                                  update={(opts) =>
                                    updateControlPathSelector(opts, item)
                                  }
                                />
                              )}

                            {item.controls &&
                              item.controls.type === 'app_package' && (
                                <DefinitionRenderer
                                  schema={item.controls.schema}
                                  updatePackage={(data, cb) => {
                                    cb && cb();
                                  }}
                                />
                              )}
                          </ControlWrapper>
                        </div>
                      </ItemManagerContainer>

                      <ItemButtons>
                        <Button
                          variant={'icon'}
                          onClick={() => deleteItem(path, item)}
                        >
                          <DeleteForever />
                        </Button>
                      </ItemButtons>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
}

const PathSelect = ({ option, options, update }) => {
  const handleChange = (e) => {
    update(e.value, option);
  };
  const selectedOption = options.find((o) => option.next_step_uuid === o.value);

  return (
    <Input
      type="select"
      data={{}}
      value={selectedOption}
      defaultValue={selectedOption}
      onChange={handleChange}
      options={options}
    ></Input>
  );
};

type DataInputSelectType = {
  controls: any;
  update: any;
  item: any;
  options: any;
};

const DataInputSelect = ({
  item,
  options,
  update,
  controls,
}: DataInputSelectType) => {
  const handleChange = (e) => {
    const newOption = Object.assign({}, item, { name: e.value });
    // const newOptions = //controls.schema.map((o)=> o.name === newOption.name ? newOption : o)
    const newControls = Object.assign({}, controls, { schema: [newOption] });

    update(newControls);
  };

  const selectedItem = options.find((o) => o.value === item.name);

  return (
    <div>
      <Input
        type="select"
        value={selectedItem}
        defaultValue={selectedItem}
        onChange={handleChange}
        label={item.label}
        // helperText={"oeoeoe"}
        options={options}
      ></Input>
    </div>
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

export default withRouter(connect(mapStateToProps)(BotEditor));
