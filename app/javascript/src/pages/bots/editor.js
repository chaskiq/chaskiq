import React, { Component, useState, useEffect } from "react";
import { withRouter, Switch } from "react-router-dom";
import { connect } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import styled from "@emotion/styled";
import TextEditor from "../../components/textEditor";
import UpgradeButton from "../../components/upgradeButton"

import graphql from "../../graphql/client";
import {
  BOT_TASK,
  BOT_TASKS,
  AGENTS,
  BOT_TASK_METRICS,
} from "../../graphql/queries";
import { UPDATE_BOT_TASK } from "../../graphql/mutations";
import ContentHeader from "../../components/PageHeader";
import Content from "../../components/Content";
import FormDialog from "../../components/FormDialog";
import Input from "../../components/forms/Input";
import Dropdown from "../../components/Dropdown";
import Segment from "./segment";
import SettingsForm from "./settings";
import BotTaskSetting from "./taskSettings";
import { errorMessage, successMessage } from "../../actions/status_messages";
import List, { ListItem, ListItemText } from "../../components/List";
import Button from "../../components/Button";
import Tabs from "../../components/Tabs";
import ErrorBoundary from '../../components/ErrorBoundary'

import {
  DefinitionRenderer,
} from '../../components/packageBlocks/components'


import {
  PlusIcon,
  DragHandle,
  DeleteForever,
  //RemoveCircle ,
  DeleteForeverRounded,
} from "../../components/icons";

import { isEmpty } from "lodash";
import Stats from "../../components/stats";
import { setCurrentSection, setCurrentPage } from "../../actions/navigation";
import AppPackagePanel from "../../components/conversations/appPackagePanel"

const ItemManagerContainer = styled.div`
  flex-grow: 4;
  margin-right: 19px;
`;

const ItemsContainer = styled.div`
  box-shadow: 0 24px 0 0 #fff, 0 -24px 0 0 #fff, 16px 0 32px -12px rgba(0,0,0,.1), -16px 0 32px -12px rgba(0,0,0,.1);
`

const PathActionsContainer = styled.div`
align-items: flex-end;
border-radius: 0 0 8px 8px;
box-sizing: border-box;
box-shadow: 0 16px 32px -12px rgba(0,0,0,.1), 0 -24px 0 0 #fff, 16px 0 32px -12px rgba(0,0,0,.1), -16px 0 32px -12px rgba(0,0,0,.1);
padding: 20px 20px 24px;
`

const ItemButtons = styled.div`
  align-self: center;
  /* width: 203px; */
  align-items: center;
  display: flex;
  flex-grow: 1;

  justify-content: ${(props) => (props.first ? "flex-start" : "flex-end")};
`;

const ControlWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-flow: column;
`;

function create_UUID() {
  var dt = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (
    c
  ) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

const PathDialog = ({ open, close, isOpen, submit }) => {
  let titleRef = React.createRef();
  //const titleRef = null

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
        //contentText={"lipsum"}
        titleContent={"Create Path"}
        formComponent={
          <form>
            <Input
              label="None"
              id="title"
              type={"text"}
              ref={(ref) => (titleRef = ref)}
              placeholder={"write path title"}
              //defaultValue="Default Value"
              //className={classes.textField}
              helperText="Some important text"
            />
          </form>
        }
        dialogButtons={
          <React.Fragment>
            <Button onClick={close} variant="outlined">
              Cancel
            </Button>

            <Button onClick={handleSubmit} className="mr-1">
              Create
            </Button>
          </React.Fragment>
        }
        //actions={actions}
        //onClose={this.close}
        //heading={this.props.title}
      ></FormDialog>
    )
  );
};

const BotEditor = ({ match, app, dispatch, mode, actions }) => {
  const [botTask, setBotTask] = useState({});
  const [errors, setErrors] = useState({});
  const [paths, setPaths] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchFields, setSearchFields] = useState([])
  const [selectedPath, setSelectedPath] = useState(null);


  useEffect(() => {
    graphql(
      BOT_TASK,
      { 
        appKey: app.key, 
        id: match.params.id 
      },
      {
        success: (data) => {
          setBotTask(data.app.botTask);
          setPaths(data.app.botTask.paths);
          setSelectedPath(data.app.botTask.paths[0]);
        },
        error: (err) => {
          debugger;
        },
      }
    );

    dispatch(setCurrentSection("Bot"));
    dispatch(setCurrentPage(`bot${mode}`));
  }, []);

  const saveData = () => {

    const snake_case_paths = paths.map((o)=> {
      let b = Object.assign({}, o, { follow_actions: o.followActions } ) 
      delete b['followActions']
      return b
     })

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
          //setSelectedPath(data.updateBotTask.botTask.paths[0]);
          dispatch(successMessage("bot updated"));
        },
        error: (err) => {
          dispatch(errorMessage("bot not updated"));
        },
      }
    );
  };

  const toggleBotState = ()=>{
    graphql(
      UPDATE_BOT_TASK,
      {
        appKey: app.key,
        id: match.params.id,
        params: {
          state: botTask.state === 'enabled' ? null : 'enabled'
        },
      },
      {
        success: (data) => {
          setBotTask(data.updateBotTask.botTask)
          dispatch(successMessage("bot updated"));
        },
        error: (err) => {
          dispatch(errorMessage("bot not updated"));
        },
      }
    );
  }

  const handleTabChange = (e, i) => {
    setTabValue(i);
  };

  const tabsContent = () => {
    return (
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        textColor="inherit"
        tabs={[
          {
            label: "Stats",
            content: (
              <React.Fragment>
                {!isEmpty(botTask) && (
                  <Stats
                    match={match}
                    app={app}
                    data={botTask}
                    getStats={getStats}
                    actions={actions}
                    mode={"counter_blocks"}
                  />
                )}
              </React.Fragment>
            ),
          },
          {
            label: "Settings",
            content: (
              <BotTaskSetting
                app={app}
                data={botTask}
                updateData={setBotTask}
                saveData={saveData}
                errors={errors}
              />
            ),
          },
          {
            label: "Audience",
            content: (
              <Segment
                app={app}
                data={botTask}
                updateData={(task) => {
                  setBotTask(task);
                }}
                handleSave={(segments) => {
                  setBotTask(
                    Object.assign({}, botTask, { segments: segments })
                  );
                  saveData();
                }}
              />
            ),
          },
          {
            label: "Editor",
            content: <BotPathEditor 
              app={app}
              botTask={botTask}
              updateData={setBotTask}
              saveData={saveData}
              errors={errors}
              paths={paths}
              setPaths={setPaths}
              searchFields={searchFields}
              selectedPath={selectedPath}
              setSelectedPath={setSelectedPath}
            />,
          },
        ]}
      ></Tabs>
    );
  };

  const getStats = (params, cb) => {
    graphql(BOT_TASK_METRICS, params, {
      success: (data) => {
        setSearchFields(data.app.searcheableFields)
        const d = data.app.botTask;
        cb(d);
      },
      error: (error) => {},
    });
  };

  return (
    <div>
      <Content>
        <ContentHeader 
          title={botTask.title} 
          items={[]}
          actions={
            <UpgradeButton 
            classes={
              `absolute z-10 ml-1 mt-3 transform w-screen 
              max-w-md px-2 origin-top-right right-0
              md:-ml-4 sm:px-0 lg:ml-0
              lg:right-2/6 lg:translate-x-1/6`
            }
            label="Activate Bot Task"
            feature="BotTasks">
          
            <Button
              className="mr-2"
              //icon= <CheckCircle />
              id="enabled"
              state="enabled"
              variant={"success"}
              onClick={toggleBotState}
            >
              {botTask.state === 'enabled' ? 'Disable' : 'Enable'}
            </Button>
          </UpgradeButton>
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
  botTask
}){

  const [isOpen, setOpen] = useState(false);
  const [changed, setChanged] = useState(null);
  const [openPackagePanel, setOpenPackagePanel] = useState(null)


  const open = () => setOpen(true);
  const close = () => setOpen(false);

  const showPathDialog = () => {
    setOpen(true);
  };

  const handleSelection = (item) => {
    setSelectedPath(item);
  };

  const addSectionMessage = (path) => {
    const dummy = {
      step_uid: create_UUID(),
      type: "messages",
      messages: [
        {
          app_user: {
            display_name: "bot",
            email: "bot@chasqik.com",
            id: 1,
            kind: "agent",
          },
          serialized_content:
            '{"blocks":[{"key":"9oe8n","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
          html_content: "--***--",
        },
      ],
    };

    const newSteps = path.steps.concat(dummy);
    let newPath = null;

    const newPaths = paths.map((o) => {
      if (o.id === path.id) {
        newPath = Object.assign({}, path, { steps: newSteps });
        return newPath;
      } else {
        return o;
      }
    });
    setPaths(newPaths);
    setSelectedPath(newPath); // redundant
  };

  const addWaitUserMessage = (path) => {
    const id = create_UUID();
    const dummy = {
      step_uid: id,
      type: "messages",
      messages: [],
      controls: {
        type: "wait_for_reply",
        schema: [],
      },
    };

    const newSteps = path.steps.concat(dummy);
    let newPath = null;

    const newPaths = paths.map((o) => {
      if (o.id === path.id) {
        newPath = Object.assign({}, path, { steps: newSteps });
        return newPath;
      } else {
        return o;
      }
    });

    setPaths(newPaths);
    setSelectedPath(newPath); // redundant
  };

  const addSectionControl = (path) => {
    const id = create_UUID();
    const dummy = {
      step_uid: id,
      type: "messages",
      messages: [],
      controls: {
        type: "ask_option",
        schema: [
          {
            id: create_UUID(),
            element: "button",
            label: "write here",
            next_step_uuid: null,
          },
          //{element: "button", label: "quiero contratar el producto", next_step_uuid: 3},
          //{element: "button", label: "estoy solo mirando", next_step_uuid: 4}
        ],
      },
    };

    const newSteps = path.steps.concat(dummy);
    let newPath = null;

    const newPaths = paths.map((o) => {
      if (o.id === path.id) {
        newPath = Object.assign({}, path, { steps: newSteps });
        return newPath;
      } else {
        return o;
      }
    });

    setPaths(newPaths);
    setSelectedPath(newPath); // redundant
  };

  const addDataControl = (path) => {
    const id = create_UUID();
    const dummy = {
      step_uid: id,
      messages: [],
      controls: {
        type: "data_retrieval",
        schema: [
          {
            id: create_UUID(),
            element: "input",
            type: "text",
            placeholder: "enter email",
            name: "email",
            label: "enter your email",
          },
        ],
      },
    };

    const newSteps = path.steps.concat(dummy);
    let newPath = null;

    const newPaths = paths.map((o) => {
      if (o.id === path.id) {
        newPath = Object.assign({}, path, { steps: newSteps });
        return newPath;
      } else {
        return o;
      }
    });

    setPaths(newPaths);
    setSelectedPath(newPath); // redundant
  };

  const insertAddPackage = (p) => {
    const {provider} = p
    const id = create_UUID();
    const dummy = {
      step_uid: id,
      messages: [],
      controls: {
        type: "app_package",
        app_package: provider.name,
        schema: provider.schema,
      }
    };

    const path = openPackagePanel
    const newSteps = path.steps.concat(dummy);
    let newPath = null;

    const newPaths = paths.map((o) => {
      if (o.id === path.id) {
        newPath = Object.assign({}, path, { steps: newSteps });
        return newPath;
      } else {
        return o;
      }
    });

    setPaths(newPaths);
    setSelectedPath(newPath); // redundant
  };

  const addEmptyPath = (data) => {
    addPath(data);
    close();
  };

  const addAppPackage = (path) => {
    setOpenPackagePanel(path)
  }

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
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
      <div className="flex justify-between my-4 border-1 border-gray-400 rounded-md shadow">
        {isOpen && (
          <PathDialog
            isOpen={isOpen}
            open={open}
            close={close}
            submit={addEmptyPath}
          />
        )}

        <div className="w-2/4 bg-gray-50 flex flex-col py-3">
          <h3 className="text-sm leading-5 font-medium text-gray-900 my-2 text-center">
            Paths
          </h3>

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

                          <PathList
                            path={item}
                            handleSelection={handleSelection}
                          />

                          <ItemButtons first={true} {...provided.dragHandleProps}>
                            <DragHandle />
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

          <Button
            size="small"
            variant={"contained"}
            onClick={showPathDialog}
            color="primary"
            className="self-center"
          >
            <PlusIcon />
            Add new path
          </Button>
        </div>

        <div className="w-full shadow">
          <div>
              {selectedPath && 
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
                    saveData={saveData}
                    setPaths={setPaths}
                    setSelectedPath={setSelectedPath}
                    searchFields={searchFields}
                  />
                </ErrorBoundary>
              }

            <div className="m-4">
              <Button
                variant="contained"
                color="primary"
                size="medium"
                onClick={saveData}
              >
                Save data
              </Button>
            </div>
          </div>
        </div>


        {openPackagePanel && (
          <AppPackagePanel
            open={openPackagePanel}
            kind={'bots'}
            close={() => {
              setOpenPackagePanel(false)
            }}
            insertComment={(data) => {
              insertAddPackage(data)
              setOpenPackagePanel(false)
            }}
          />
        )}
      </div>
    );
}

function FollowActionsSelect({ app, path, updatePath }) {
  const options = [
    { key: "close", name: "Close conversation", value: null },
    { key: "assign", name: "Assign Agent", value: null },
    //{action_name: "tag", value: null },
    //{action_name: "app_content", value: null },
  ];

  //console.log("PATH FOLLOW ACTIONS", path.followActions, path)

  const [selectMode, setSelectMode] = useState(null);
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
      //follow_actions: actions,
      followActions: actions,
    });
    updatePath(newPath);
  }

  function renderAddButton() {
    return (
      <Button
        variant="outlined"
        onClick={() => {
          setSelectMode(true);
        }}
      >
        add option
      </Button>
    );
  }

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
      case "assign":
        return (
          <AgentSelector
            app={app}
            index={i}
            action={action}
            updateAction={updateAction}
            removeAction={removeAction}
            key={action.key}
          >
            {action.name}
          </AgentSelector>
        );

      default:
        return (
          <div
            className={'flex items-center mb-2'}
            key={action.key}
          >
            <p>{action.name}</p>
            <Button 
              variant="icon"
              color={"secondary"} 
              onClick={() => removeAction(i)}>
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

      { 
        menuOptions.length > 0 &&
        <div className="py-4">
          <Dropdown
            isOpen={false}
            labelButton={"add"}
            triggerButton={(cb) => (
              <Button
                onClick={cb}
                color="primary"
                size={"small"}
                variant="outlined"
                aria-label="add"
              >
                <PlusIcon />
                Add Follow Action
              </Button>
            )}
          >
            <List>
              {menuOptions.map((o) => (
                <ListItem key={o.key} onClick={()=> handleClick(o)}>
                  {o.name}
                </ListItem>
              ))}
            </List>
          </Dropdown> 
        </div>
      }

    </div>
  );
}

function AgentSelector({ app, updateAction, removeAction, action, index }) {
  const [selected, setSelected] = React.useState(action.value);
  const [agents, setAgents] = React.useState([]);
  const [mode, setMode] = React.useState("button");

  function getAgents() {
    graphql(
      AGENTS,
      { appKey: app.key },
      {
        success: (data) => {
          setAgents(data.app.agents);
        },
        error: (error) => {},
      }
    );
  }

  useEffect(()=>{
    if(action.value) setSelected(action.value)
  },[action.value])

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
    setMode("button");
  }

  function selectedAgent() {
    const agent = agents.find((o) => selected === o.id);
    if (!agent) return "";
    return {label: agent.name || agent.email, value: selected};
  }

  return (
    <div>
    
      <div className="flex items-center">
        <div className="w-64">
          <Input
            type="select"
            value={ selectedAgent() }
            onChange={handleChange}
            defaultValue={selectedAgent()}
            name={'agent'}
            id={'agent'}
            label={"Assignee Agent"}
            data={{}}
            options={
              agents.map((o) => ({ label: o.email, value: o.id }))
            }>
          </Input>
        </div>

        <div>
          <Button 
            variant={"icon"} 
            onClick={() => removeAction(index)}>
            <DeleteForeverRounded />
          </Button>
        </div>
      </div>
    
    </div>
  );
}

const PathList = ({ path, handleSelection }) => {
  return (
    <li className="pr-4 pb-2 w-full w-1/3">
      <Button 
        className="w-full py-2 px-2 bg-white border-1 shadow max-w-3xl break-all"
        onClick={(e) => handleSelection(path)}
        variant={"outlined"}>
        {path.title}
      </Button>
    </li>
  );
};

const FirstPath = ({
  controlStep, 
  path, 
  options, 
  appendItemControl, 
  updateControlPathSelector 
})=>{

  return (
    <div className="m-5">

      <p className="text-sm text-center text-gray-500 font-semibold leading-4 my-6">
        This is what people will see when they start a new conversation
      </p>

      <ItemsContainer className="p-4">
      
        <input placeholder="can we help ?"
          onChange={(e)=> {
              updateControlPathSelector(
                { ...controlStep.controls, label: e.currentTarget.value},
                controlStep
              ) 
            }
          }
          defaultValue={controlStep.controls.label} 

          className="border-b-2 border-b-red focus:outline-none outline-none"
        />

        <FollowActions 
          controlStep={controlStep} 
          path={path}
          update={(opts) =>
            updateControlPathSelector(opts, controlStep)
          }
          options={options}
          appendItemControl={appendItemControl}
        />      
      
      </ItemsContainer>


    </div>
  )
}

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
  saveData,
  setSelectedPath,
  searchFields,
  app,
}) => {

  const [showActions, setShowActions] = React.useState(false)

  const addStepMessage = (path) => {
    addSectionMessage(path);
  };

  const deleteItem = (path, step) => {
    const newSteps = path.steps.filter((o, i) => o.step_uid != step.step_uid);
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
      path.steps.filter((o)=> !o.controls || o.controls.type !== "ask_option" ),
      result.source.index,
      result.destination.index
    );

    const controlStep = path.steps.find((o)=> o.controls && o.controls.type === "ask_option" ) 

    if(controlStep) 
      newSteps = newSteps.concat(controlStep)

    const newPath = { ...path, steps: newSteps }

    updatePath(newPath);
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    const newPath = Object.assign({}, path, { title: value });
    updatePath(newPath);
  };

  const options = [
    {
      name: "Add Message Bubble",
      key: "add-message",
      onClick: () => {
        addStepMessage(path);
      },
    },
    /*{
      name: "Add path chooser",
      key: "add-path-choooser",
      onClick: () => {
        addSectionControl(path);
      },
    },*/
    ,
    {
      name: "Wait for user input",
      key: "wait-user-input",
      onClick: () => {
        addWaitUserMessage(path);
      },
    },
    {
      name: "Ask data input",
      key: "ask-data-input",
      onClick: () => {
        addDataControl(path);
      },
    },
    {
      name: "Add App",
      key: "add-app-package",
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
      label: "example",
      element: "button",
      next_step_uuid: null,
    };
    const newControls = Object.assign({}, step.controls, {
      schema: step.controls.schema.concat(item, step),
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

  const findControlItemStep = ()=>(
    path.steps.find((o)=> o.controls && o.controls.type === "ask_option" )
  )

  const controlStep = findControlItemStep()

  const stepOptions = paths.map((o) => ({
    value: o.steps[0] && o.steps[0].step_uid,
    label: o.title,
  }));

  const findPathIndex = paths.findIndex((p)=> p.id === path.id)

  const renderControls = ()=>{
    return (
      <div className="w-full p-6 border-b-2 border-gray-200">
        <div className="flex justify-between">
          <div className="">
            <Input
              type="text"
              value={path.title}
              onChange={handleTitleChange}
              hint={"path title"}
            />
          </div>

          {
            !needsLock() &&
            <div className="items-end">
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => deletePath(path)}
              >
                delete path
                <DeleteForeverRounded />
              </Button>
            </div>
          }
        </div>
      </div>
    )
  }

  const needsLock = ()=>{
    return findPathIndex === 0 && botTask.botType === 'new_conversations'
  } 

  if(findPathIndex === 0 && botTask.botType === 'new_conversations'){ // and type new_conversations
    return  (
      <div>
        {renderControls()}
        <FirstPath 
          path={path}
          appendItemControl={appendItemControl}
          updateControlPathSelector={updateControlPathSelector}
          controlStep={controlStep} 
          options={stepOptions}>
        </FirstPath>      
      </div>
    )
  }


  return (
    <div>
      <div className="w-full p-6 border-b-2 border-gray-200">
        <div className="flex justify-between">
          <div className="">
            <Input
              type="text"
              value={path.title}
              onChange={handleTitleChange}
              hint={"path title"}
            />
          </div>

          <div className="items-end">
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => deletePath(path)}
            >
              delete path
              <DeleteForeverRounded />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col justify-center items-center">

        <ItemsContainer className="p-4 w-3/4 mt-8">
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
              labelButton={"add"}
              triggerButton={(cb) => (
                <Button
                  onClick={cb}
                  color="primary"
                  size={"small"}
                  variant="outlined"
                  aria-label="add"
                >
                  <PlusIcon />
                  Add new conversation part
                </Button>
              )}
            >
              <List>
                {options.map((o) => (
                  <ListItem 
                    key={o.key} 
                    onClick={o.onClick}>
                    {o.name}
                  </ListItem>
                ))}
              </List>
            </Dropdown>
          </div>

        </ItemsContainer>

        {/*<hr/>*/}

      </div>

      <hr  className="my-4 w-full border-4" />

      <div className="p-4 flex flex-col justify-center items-center">
        
        <div className="flex">
          {
            !controlStep && !showActions && (!path.followActions || path.followActions.length === 0) &&
              <div className="flex items-center mr-4">
                Continue bot with 
                <Button variant="outlined" 
                  className="ml-2"
                  onClick={()=> addSectionControl(path)}>
                  reply button
                </Button>
              </div>
          }

          {
            !controlStep && !showActions && (!path.followActions || path.followActions.length < 1) &&
              <div className="flex items-center">
                End bot with
                <Button variant="outlined" 
                  className="ml-2"
                  onClick={()=> setShowActions(true)}>
                  follow actions
                </Button>
              </div>
          }

        </div>

        {controlStep && 
          <PathActionsContainer className="w-3/4 mt-8">

            <p className="text-lg leading-6 font-medium text-gray-900 py-4">
              Continue bot with reply button
            </p> 

            <ItemButtons className="self-end">
              <Button
                variant={"icon"}
                onClick={() => deleteItem(path, controlStep)}
              >
                <DeleteForever />
              </Button>
            </ItemButtons>

            <FollowActions 
              controlStep={controlStep} 
              path={path}
              update={(opts) =>
                updateControlPathSelector(opts, controlStep)
              }
              options={stepOptions}
              searchFields={searchFields}
              appendItemControl={appendItemControl}
            />
      
          </PathActionsContainer> 
        }

        {
          (showActions || (!controlStep && path.followActions && path.followActions.length > 0)) &&
          <div className="flex align-start flex-col w-3/4">

            <p className="text-lg leading-6 font-medium text-gray-900 py-4">
              End bot with follow actions
            </p>

            <div className="self-end">
              <Button
                variant="icon"
                color="secondary"
                onClick={() => {
                  updatePath({...path, followActions: [] })
                  setShowActions(false)
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

            {/*<p className="max-w-xl text-sm leading-5 text-gray-500 mb-4">
              Hint: Follow actions will be triggered on paths that ends with
              message bubbles. Paths that ends with path chooser will not trigger
              follow actions.
            </p>*/}
          </div>
        }

      </div>
      
    </div>
  );
};

const FollowActions = ({
  controlStep,
  path,
  update,
  options,
  searchFields,
  appendItemControl
})=>{
  return (
    <div className="flex flex-col">
      <div className="w-full">
        <ControlWrapper>
          {controlStep.controls && (
            <AppPackageBlocks
              controls={controlStep.controls}
              path={path}
              step={controlStep}
              options={options}
              searchFields={searchFields}
              update={update}
            />
          )}
        </ControlWrapper>

      </div>

      {controlStep.controls &&
        controlStep.controls.type === "ask_option" && (
          <div
            className="w-full flex items-center"
            onClick={() => appendItemControl(controlStep)}
          >
            <Button
              color={"primary"}
              variant={"outlined"}
              size="small"
            >
              + add data option
            </Button>

            {/*<p>
              Save this value to user properties
              <
              [save]
            </p>*/}
          </div>
        )}
    </div>
  )
}

const PathEditor = ({ step, message, path, updatePath }) => {
  const [readOnly, setReadOnly] = useState(false);

  const saveHandler = (html, serialized) => {
    console.log("savr handler", serialized);
  };

  const saveContent = ({ html, serialized }) => {
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
    <div className="shadow border rounded p-6 relative bg-gray-100 max-w-sm">
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
          lineHeight: "1.2em",
          fontSize: "1em",
        }}
        saveHandler={saveHandler}
        updateState={({ status, statusButton, content }) => {
          console.log("get content", content);
          saveContent(content);
        }}
      />
    </div>
  );
};

// APp Package Preview
const AppPackageBlocks = ({ options, controls, path, step, update, searchFields }) => {
  const { schema, type } = controls;

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
    const element = item.element;

    switch (item.element) {
      case "separator":
        return <hr key={index} />;
      case "input":
        console.log("controls;", controls);
        return (
          <div className={"form-group"} key={index}>

            <DataInputSelect
              controls={controls}
              path={path}
              step={step}
              update={update}
              item={item}
              options={
                searchFields.map(
                  (o)=> ({ 
                    value: o.name, 
                    label: o.name 
                  })
                )
              }
            />
          </div>
        );
      case "submit":
        return (
          <button key={index} style={{ alignSelf: "flex-end" }} type={"submit"}>
            {item.label}
          </button>
        );
      case "button":
        return (
          <div className="flex justify-between items-center relative">
            <div className="w-full">
              <Input
                value={item.label}
                type={"text"}
                onChange={(e) => handleInputChange(e.target.value, item, index)}
              />
            </div>

            <div className="w-3/4 px-2">
              {controls && controls.type === "ask_option" ? (
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
  userSelect: "none",
  //padding: grid * 2,
  //margin: `0 0 ${grid}px 0`,
  display: "flex",
  justifyContent: "space-evenly",
  // change background colour if dragging
  background: isDragging ? "lightgreen" : "transparent",
  paddingBottom: '1.2em',
  borderBottom: '1px solid #ccc',
  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "transparent",
  padding: grid,
  //width: 250
});

const getPathStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "transparent",
  padding: 2,
  //width: 250
});

class SortableSteps extends Component {
  constructor(props) {
    super(props);
  }

  onDragEnd = (result) => {
    this.props.onDragEnd(this.props.path, result);
  };

  render() {
    const { steps, path, paths, deleteItem, 
      updatePath, updateControlPathSelector ,
      searchFields
    } = this.props;

    const stepsWithoutcontrols = steps.filter((o)=> !o.controls || o.controls.type !== "ask_option" )

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
                  {
                    (provided, snapshot) => (
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

                          {
                            item.controls && item.controls.type === "wait_for_reply" &&
                            <div className="p-4 bg-blue-100 text-blue-300 border border-md border-blue-300 rounded-md">
                              ... wait for user input ...
                            </div>
                          }


                          {item.messages && item.messages.map((message) => (
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
                                item.controls.type !== "ask_option" &&
                                item.controls.type !== "app_package" && (	
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

                              {
                                item.controls && item.controls.type === "app_package" && (
                                  <DefinitionRenderer
                                    schema={item.controls.schema}
                                    updatePackage={(data, cb)=>{ cb && cb() }} 
                                  />
                                )
                              }
                            </ControlWrapper>	
                          </div>	


                        </ItemManagerContainer>

                        <ItemButtons>
                          <Button
                            variant={"icon"}
                            onClick={() => deleteItem(path, item)}
                          >
                            <DeleteForever />
                          </Button>
                        </ItemButtons>
                      </div>
                    )
                  }
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
      fullWidth={true}
      options={options}
    >
    </Input>
  );
};

const DataInputSelect = ({ item, options, update, controls, path, step }) => {
  const handleChange = (e) => {
    const newOption = Object.assign({}, item, { name: e.value });
    //const newOptions = //controls.schema.map((o)=> o.name === newOption.name ? newOption : o)
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
        fullWidth={true}
        label={item.label}
        //helperText={"oeoeoe"}
        options={options}
      >
      </Input>
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
