import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';

import I18n from '../../shared/FakeI18n';

import FormDialog from '@chaskiq/components/src/components/FormDialog';
import Button from '@chaskiq/components/src/components/Button';
import { InlineFilterDialog } from '@chaskiq/components/src/components/segmentManager';
import SegmentItemButton from '@chaskiq/components/src/components/segmentManager/itemButton';

import defaultFields from '@chaskiq/components/src/utils/defaultFields';
import Input from '@chaskiq/components/src/components/forms/Input';
import arrayMove from 'array-move';

import serialize from 'form-serialize';
import { QueueIcon } from '@chaskiq/components/src/components/icons';
import PageHeader from '@chaskiq/components/src/components/PageHeader';

import graphql from '@chaskiq/store/src/graphql/client';

import {
  setCurrentPage,
  setCurrentSection,
} from '@chaskiq/store/src/actions/navigation';

import { successMessage } from '@chaskiq/store/src/actions/status_messages';

import { AGENTS, ASSIGNMENT_RULES } from '@chaskiq/store/src/graphql/queries';

import {
  CREATE_ASSIGNMENT_RULE,
  EDIT_ASSIGNMENT_RULE,
  DELETE_ASSIGNMENT_RULE,
  UPDATE_RULE_PRIORITIES,
} from '@chaskiq/store/src/graphql/mutations';

const DragHandle = SortableHandle(() => (
  <div>
    <QueueIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
  </div>
));

const SortableItem = SortableElement(({ object, deleteRule, edit }) => (
  <li>
    <div className="border-b bg-white dark:border-gray-800 dark:bg-gray-900 block hover:bg-gray-50 dark:hover:bg-gray-900 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-900 transition duration-150 ease-in-out">
      <div className="flex items-center px-4 py-4 sm:px-6">
        <div>
          <DragHandle />
        </div>

        <div className="min-w-0 flex-1 flex items-center">
          <div className="flex-shrink-0">
            <img
              className="ml-3 h-12 w-12 rounded-full dark:bg-white"
              src={`${object.agent.avatarUrl}`}
              alt=""
            />
          </div>
          <div className="flex w-full px-4 md:div md:div-cols-2 md:gap-4 justify-between">
            <div>
              <div className="text-lg leading-5 font-medium text-indigo-600 truncate">
                {object.title}
              </div>
              <div className="mt-2 flex items-center text-sm leading-5 text-gray-500 dark:text-gray-300">
                <span className="truncate">{object.agent.email}</span>
              </div>
            </div>

            <div className="hidden md:block">
              {/* <div className="mt-2 flex items-center text-sm leading-5 text-gray-500">
                <button>edit</button>
                <button>delete</button>
                </div> */}

              <Button
                variant="outlined"
                className="mr-2"
                color={'outlined'}
                onClick={(e) => {
                  e.preventDefault();
                  edit(object);
                }}
              >
                {I18n.t('common.edit')}
              </Button>

              <Button
                variant="danger"
                onClick={(e) => {
                  e.preventDefault();
                  deleteRule(object);
                }}
              >
                {I18n.t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </li>
));

const SortableList = SortableContainer(({ children }) => {
  return <ul className="bg-white border-md shadow-sm">{children}</ul>;
});

function AssignmentRules({ dispatch, app }) {
  const formRef = React.useRef();

  const [state, setState] = React.useState({
    isOpen: false,
    currentRule: null,
    rules: [],
    conditions: [],
  });

  React.useEffect(() => {
    dispatch(setCurrentPage('Assignment Rules'));
    dispatch(setCurrentSection('Conversations'));
    getAssignmentRules();
  }, []);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setState({
      ...state,
      rules: arrayMove(state.rules, oldIndex, newIndex),
    });

    updatePriorities();
  };

  const open = () => setState({ ...state, isOpen: true });
  const close = () => setState({ ...state, isOpen: false });

  const updatePriorities = () => {
    graphql(
      UPDATE_RULE_PRIORITIES,
      {
        appKey: app.key,
        rules: state.rules,
      },
      {
        success: () => {
          dispatch(successMessage(I18n.t('assignment_rules.success_message')));
        },
      }
    );
  };

  const submitAssignment = () => {
    if (state.currentRule) {
      editAssignmentRule();
    } else {
      createAssignmentRule();
    }
  };

  const getAssignmentRules = () => {
    graphql(
      ASSIGNMENT_RULES,
      {
        appKey: app.key,
      },
      {
        success: (data) => {
          setState({ ...state, rules: data.app.assignmentRules });
        },
        error: () => {},
      }
    );
  };

  const createAssignmentRule = () => {
    const serializedData = serialize(formRef.current, {
      hash: true,
      empty: true,
    });

    graphql(
      CREATE_ASSIGNMENT_RULE,
      {
        appKey: app.key,
        title: serializedData.title,
        agentId: serializedData.agent,
        //active: serializedData.active,
        conditions: state.conditions,
      },
      {
        success: (data) => {
          const rule = data.createAssignmentRule.assignmentRule;
          setState({
            ...state,
            rules: state.rules.concat(rule),
            isOpen: false,
          });
        },
        error: () => {},
      }
    );
  };

  const editAssignmentRule = () => {
    const serializedData = serialize(formRef.current, {
      hash: true,
      empty: true,
    });

    graphql(
      EDIT_ASSIGNMENT_RULE,
      {
        appKey: app.key,
        ruleId: state.currentRule.id,
        title: serializedData.title,
        agentId: serializedData.agent,
        //active: serializedData.active,
        conditions: state.conditions,
      },
      {
        success: (data) => {
          const rule = data.editAssignmentRule.assignmentRule;
          const collection = state.rules.map((o) => {
            if (o.id === rule.id) {
              return rule;
            } else {
              return o;
            }
          });

          setState({
            ...state,
            rules: collection,
            currentRule: null,
            isOpen: false,
          });
        },
        error: () => {},
      }
    );
  };

  const deleteAssignmentRule = (opts) => {
    graphql(
      DELETE_ASSIGNMENT_RULE,
      {
        appKey: app.key,
        ruleId: opts.id,
      },
      {
        success: (data) => {
          const rule = data.deleteAssignmentRule.assignmentRule;
          const collection = state.rules.filter((o) => o.id !== rule.id);
          setState({
            ...state,
            rules: collection,
            currentRule: null,
          });
        },
        error: () => {},
      }
    );
  };

  const edit = (rule) => {
    setState({
      ...state,
      currentRule: rule,
      isOpen: true,
    });
  };

  const deleteRule = (rule) => {
    setState({
      ...state,
      currentRule: rule,
    });

    deleteAssignmentRule(rule);
  };

  const defaultConditions = [
    {
      type: 'match',
      attribute: 'match',
      comparison: 'and',
      value: 'and',
    },
    {
      type: 'string',
      value: ['AppUser'],
      attribute: 'type',
      comparison: 'in',
    },
  ];

  return (
    <div className="p-4">
      <PageHeader
        title={I18n.t('assignment_rules.title')}
        actions={
          <Button
            variant="flat-dark"
            color="primary"
            onClick={() =>
              setState({
                ...state,
                isOpen: true,
                currentRule: null,
              })
            }
          >
            {I18n.t('assignment_rules.create_button')}
          </Button>
        }
      ></PageHeader>

      <FormDialog
        open={state.isOpen}
        titleContent={'Edit rule'}
        handleClose={close}
        formComponent={
          <form
            ref={formRef}
            onSubmit={(e) => e.preventDefault()}
            className="px-8 pt-6 pb-8 mb-4"
          >
            <AssignmentForm
              rule={state.currentRule}
              conditions={
                state.currentRule
                  ? state.currentRule.conditions
                  : defaultConditions
              }
              setConditions={(conditions) =>
                setState({
                  ...state,
                  conditions: conditions,
                })
              }
              app={app}
              dispatch={dispatch}
            />

            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <span className="flex w-full sm:col-start-2">
                <Button type="submit" onClick={submitAssignment}>
                  {I18n.t('common.update')}
                </Button>
              </span>
              <span className="mt-3 flex w-full sm:mt-0 sm:col-start-1">
                <Button type="button" variant={'outlined'} onClick={close}>
                  {I18n.t('common.cancel')}
                </Button>
              </span>
            </div>
          </form>
        }
      />

      <SortableList onSortEnd={onSortEnd} useDragHandle>
        {state.rules.map((value, index) => (
          <SortableItem
            key={`item-${index}`}
            index={index}
            //value={value.id}
            object={value}
            edit={edit}
            deleteRule={() => deleteRule(value)}
          />
        ))}
      </SortableList>
    </div>
  );
}

function AssignmentForm(props) {
  const { rule, setConditions, conditions } = props;

  const [agents, setAgents] = React.useState([]);
  const [_selected, setSelected] = React.useState(rule ? rule.agent.id : '');
  const [title, setTitle] = React.useState(rule ? rule.title : '');
  const [checked, setChecked] = React.useState('');
  const [updater, setUpdater] = React.useState(null);
  const [predicates, setPredicates] = React.useState(conditions || []);

  function availableFields() {
    let fields = [{ name: 'message_content', type: 'string' }].concat(
      defaultFields
    );
    if (!props.app.customFields) return fields;
    return props.app.customFields.concat(fields);
  }

  function selectedValue() {
    if (!rule) return;
    const { agent } = rule;
    return { label: agent.email, value: agent.id };
  }

  function getAgents() {
    graphql(
      AGENTS,
      { appKey: props.app.key },
      {
        success: (data) => {
          setAgents(data.app.agents);
        },
        error: () => {},
      }
    );
  }

  React.useEffect(() => {
    getAgents();
  }, []);

  React.useEffect(() => {
    setConditions(predicates);
  }, [predicates]);

  function handleChange(e) {
    setSelected(e.value);
  }

  function displayName(o) {
    return o.attribute.split('_').join(' ');
  }

  function getTextForPredicate(o) {
    if (o.type === 'match') {
      return `${I18n.t('segment_manager.match')} ${
        o.value === 'and'
          ? I18n.t('segment_manager.all')
          : I18n.t('segment_manager.any')
      } ${I18n.t('segment_manager.criteria')}`;
    } else {
      return `${displayName(o)} ${o.comparison ? o.comparison : ''} ${
        o.value ? o.value : ''
      }`;
    }
  }

  function addPredicate(data) {
    const pending_predicate = {
      attribute: data.name,
      comparison: null,
      type: data.type,
      value: data.value,
    };
    setPredicates(predicates.concat(pending_predicate));

    // it forces a re render on itemButton for new predicates
    setTimeout(() => {
      setUpdater(Math.random());
    }, 2);
  }

  function updatePredicates(data) {
    setPredicates(data);
  }

  function deletePredicate(data) {
    setPredicates(data);
  }

  return (
    <div>
      <div>
        <div className="flex flex-wrap space-x-2 mb-2">
          {predicates.map((o, i) => {
            return (
              <SegmentItemButton
                key={i}
                index={i}
                predicate={o}
                predicates={predicates}
                open={!o.comparison}
                appearance={o.comparison ? 'primary' : 'default'}
                text={getTextForPredicate(o)}
                updatePredicate={updatePredicates}
                predicateCallback={(_jwtToken) => {}}
                deletePredicate={(items) => {
                  deletePredicate(items);
                }}
              />
            );
          })}

          {
            <InlineFilterDialog
              app={props.app}
              fields={availableFields()}
              addPredicate={(predicate) => {
                addPredicate(predicate);
              }}
            />
          }
        </div>
      </div>

      <Input
        label={I18n.t('conversations.assignment_rules.title')}
        value={title}
        name="title"
        type="text"
        onChange={(e) => setTitle(e.target.value)}
        helperText={I18n.t('conversations.assignment_rules.hint')}
      ></Input>

      {agents.length > 0 && (
        <Input
          type={'select'}
          name={'agent'}
          id={'agent'}
          label={I18n.t('conversations.assignment_rules.select_agent')}
          value={selectedValue()}
          options={agents.map((o) => ({
            value: o.id,
            label: o.email,
          }))}
          onChange={handleChange}
        ></Input>
      )}

      {/*<Input
        label={'Activate'}
        type={'checkbox'}
        name={'active'}
        value={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />*/}
    </div>
  );
}

function mapStateToProps(state) {
  const { auth, app, conversations, app_user } = state;
  const { isAuthenticated } = auth;

  return {
    conversations,
    app_user,
    app,
    isAuthenticated,
  };
}

export default withRouter(connect(mapStateToProps)(AssignmentRules));
