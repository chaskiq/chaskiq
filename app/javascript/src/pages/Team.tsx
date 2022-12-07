import React, { Component } from 'react';

import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Moment from 'react-moment';
import { isEmpty } from 'lodash';
import Select from 'react-select';

import PageHeader from '@chaskiq/components/src/components/PageHeader';
import Content from '@chaskiq/components/src/components/Content';
import Tabs from '@chaskiq/components/src/components/Tabs';
import Progress from '@chaskiq/components/src/components/Progress';
import DataTable from '@chaskiq/components/src/components/Table';
import Input from '@chaskiq/components/src/components/forms/Input';
import Button from '@chaskiq/components/src/components/Button';
import FieldRenderer, {
  gridClasses,
} from '@chaskiq/components/src/components/forms/FieldRenderer';
import Badge from '@chaskiq/components/src/components/Badge';
import FormDialog from '@chaskiq/components/src/components/FormDialog';

import serialize from 'form-serialize';

import graphql from '@chaskiq/store/src/graphql/client';

import { camelizeKeys } from '@chaskiq/store/src/actions/conversation';

import {
  setCurrentPage,
  setCurrentSection,
} from '@chaskiq/store/src/actions/navigation';

import {
  successMessage,
  errorMessage,
} from '@chaskiq/store/src/actions/status_messages';

import {
  ROLE_AGENTS,
  PENDING_AGENTS,
  TEAMS,
  AGENT_SEARCH,
  TEAM_WITH_AGENTS,
} from '@chaskiq/store/src/graphql/queries';
import {
  INVITE_AGENT,
  UPDATE_AGENT_ROLE,
  DESTROY_AGENT_ROLE,
  CREATE_TEAM,
  DELETE_TEAM,
  ADD_TEAM_AGENT,
  DELETE_TEAM_AGENT,
  UPDATE_TEAM,
} from '@chaskiq/store/src/graphql/mutations';
import I18n from '../shared/FakeI18n';
import useDebounce from '@chaskiq/components/src/components/hooks/useDebounce';

type TeamPageProps = {
  dispatch: (val: any) => void;
  app: any;
};
class TeamPage extends Component<TeamPageProps> {
  state = {
    meta: {},
    tabValue: 0,
  };

  componentDidMount() {
    this.props.dispatch(setCurrentSection('Settings'));
    this.props.dispatch(setCurrentPage('team'));
  }

  handleTabChange = (e: React.SyntheticEvent, i: number) => {
    this.setState({ tabValue: i });
  };

  render() {
    return (
      <Content>
        <PageHeader title={I18n.t('settings.team.title')} />

        <Tabs
          currentTab={this.state.tabValue}
          tabs={[
            {
              label: I18n.t('settings.team.agents'),
              // icon: <HomeIcon />,
              content: <AppUsers {...this.props} />,
            },
            {
              label: I18n.t('settings.team.title'),
              // icon: <HomeIcon />,
              content: <Teams {...this.props} />,
            },
            {
              label: I18n.t('settings.team.invitations'),
              content: <NonAcceptedAppUsers {...this.props} />,
            },
          ]}
        />
      </Content>
    );
  }
}

interface AppUsersProps {
  app: any;
  dispatch: (value: any) => void;
}

interface AppUsersState {
  collection: Array<any>;
  loading: boolean;
  isEditDialogOpen: any;
  isDestroyDialogOpen: any;
  errors: any;
}

class AppUsers extends React.Component<AppUsersProps, AppUsersState> {
  state = {
    collection: [],
    loading: true,
    isEditDialogOpen: null,
    isDestroyDialogOpen: null,
    errors: {},
  };

  form = React.createRef<HTMLFormElement>();

  componentDidMount() {
    this.search();
  }

  getAgents = () => {
    graphql(
      ROLE_AGENTS,
      { appKey: this.props.app.key },
      {
        success: (data) => {
          this.setState({
            collection: data.app.roleAgents,
            loading: false,
          });
        },
        error: () => {},
      }
    );
  };

  search = () => {
    this.setState(
      {
        loading: true,
      },
      this.getAgents
    );
  };

  destroyAgent = () => {
    graphql(
      DESTROY_AGENT_ROLE,
      {
        appKey: this.props.app.key,
        id: this.state.isDestroyDialogOpen.id,
      },
      {
        success: () => {
          this.props.dispatch(
            successMessage(I18n.t('settings.team.destroyed_agent'))
          );
          this.setState({ isDestroyDialogOpen: false });
          this.getAgents();
        },
        error: () => {
          // errorMessage('...')
        },
      }
    );
  };

  updateAgent = (params) => {
    graphql(
      UPDATE_AGENT_ROLE,
      {
        appKey: this.props.app.key,
        id: this.state.isEditDialogOpen.agentId,
        params: params,
      },
      {
        success: (_data) => {
          this.props.dispatch(
            successMessage(I18n.t('settings.team.updated_agent'))
          );
          this.setState({ isEditDialogOpen: false });
          this.getAgents();
        },
        error: (_err) => {
          // errorMessage('...')
        },
      }
    );
  };

  submit = () => {
    const serializedData = serialize(this.form.current, {
      hash: true,
      empty: true,
    });
    this.updateAgent(serializedData.app);
    // open.id ? updateWebhook(serializedData) : createWebhook(serializedData)
  };

  close = () => {
    this.setState({
      isEditDialogOpen: false,
      isDestroyDialogOpen: false,
    });
  };

  definitions = () => {
    return [
      {
        name: 'name',
        type: 'string',
        label: I18n.t('definitions.agents.name.label'),
        // hint: "we'll send POST requests",
        placeholder: I18n.t('definitions.agents.name.placeholder'),
        grid: { xs: 'w-full', sm: 'w-full' },
      },

      {
        name: 'email',
        type: 'string',
        label: I18n.t('definitions.agents.email.label'),
        // hint: "we'll send POST requests",
        placeholder: I18n.t('definitions.agents.email.placeholder'),
        grid: { xs: 'w-full', sm: 'w-full' },
      },
      {
        name: 'role',
        type: 'select',
        label: I18n.t('definitions.agents.access_list.label'),
        hint: I18n.t('definitions.agents.access_list.hint'),
        multiple: false,
        options: Object.keys(this.props.app.availableRoles).map((o) => ({
          label: o,
          value: o,
        })),
        /*[
          { label: 'none', value: null },
          { label: 'mananger', value: 'manage' },
          { label: 'admin', value: 'admin' },
        ]*/ grid: {
          xs: 'w-full',
          sm: 'w-full',
        },
      },
    ];
  };

  destroyButton = () => {
    return (
      <div className="flex py-2 justify-end">
        {this.state.isDestroyDialogOpen && (
          <FormDialog
            open={this.state.isDestroyDialogOpen}
            handleClose={this.close}
            titleContent={I18n.t('settings.team.destroy_agent_title')}
            formComponent={
              <form ref={this.form}>
                {I18n.t('settings.team.destroy_agent_warning', {
                  agent: this.state.isDestroyDialogOpen.email,
                })}
              </form>
            }
            dialogButtons={
              <React.Fragment>
                <Button onClick={this.destroyAgent}>
                  {I18n.t('settings.team.destroy_agent')}
                </Button>
                <Button
                  onClick={this.close}
                  className="mr-1"
                  variant="outlined"
                >
                  {I18n.t('common.cancel')}
                </Button>
              </React.Fragment>
            }
          />
        )}
      </div>
    );
  };

  editButton = () => {
    return (
      <div className="flex py-2 justify-end">
        {this.state.isEditDialogOpen ? (
          <FormDialog
            open={this.state.isEditDialogOpen}
            handleClose={this.close}
            actionButton={I18n.t('settings.team.action_button')}
            titleContent={I18n.t('settings.team.update_agent_title')}
            contentText={I18n.t('settings.team.content_text')}
            formComponent={
              <form ref={this.form}>
                {this.definitions().map((field) => {
                  return (
                    <div
                      className={`${gridClasses(field)} py-2 pr-2`}
                      key={field.name}
                    >
                      <FieldRenderer
                        namespace={'app'}
                        type={field.type}
                        data={camelizeKeys(field)}
                        props={{
                          data: camelizeKeys(this.state.isEditDialogOpen),
                        }}
                        errors={this.state.errors || {}}
                      />
                    </div>
                  );
                })}
              </form>
            }
            dialogButtons={
              <React.Fragment>
                <Button onClick={this.close} variant="outlined">
                  {I18n.t('common.cancel')}
                </Button>

                <Button className="mr-1" onClick={this.submit}>
                  {I18n.t('settings.team.update_agent')}
                </Button>
              </React.Fragment>
            }
          />
        ) : null}
      </div>
    );
  };

  handleEdit = (row) => {
    this.setState({ isEditDialogOpen: row });
  };

  handleDelete = (row) => {
    this.setState({ isDestroyDialogOpen: row });
  };

  render() {
    return (
      <React.Fragment>
        {this.editButton()}
        {this.destroyButton()}

        {/* title={I18n.t('settings.team.agents')} */}

        {!this.state.loading ? (
          <DataTable
            meta={{}}
            data={this.state.collection}
            search={this.search}
            disablePagination={true}
            columns={[
              {
                field: 'email',
                title: I18n.t('data_tables.agents.email'),
                render: (row) =>
                  row && (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Link
                          to={`/apps/${this.props.app.key}/agents/${row.agentId}`}
                        >
                          <img
                            className="h-10 w-10 rounded-full"
                            src={row.avatarUrl}
                            alt=""
                          />
                        </Link>
                      </div>

                      <div className="ml-4">
                        <div className="text-sm leading-5 font-medium text-gray-900 dark:text-gray-50">
                          <Link
                            to={`/apps/${this.props.app.key}/agents/${row.agentId}`}
                          >
                            {row.displayName}
                          </Link>
                        </div>
                        <div className="text-sm leading-5 text-gray-500 dark:text-gray-50">
                          <Link
                            to={`/apps/${this.props.app.key}/agents/${row.agentId}`}
                          >
                            {row.email}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ),
              },
              { field: 'name', title: I18n.t('data_tables.agents.name') },
              {
                field: 'owner',
                title: I18n.t('data_tables.agents.owner'),
                render: (row) =>
                  row && row.owner && <Badge variant="green">OWNER</Badge>,
              },
              /*{
                field: 'accessList',
                title: I18n.t('data_tables.agents.access_list'),
                render: (row) =>
                  row &&
                  row.accessList.map((o) => (
                    <Badge className="mr-2" key={`access-list-${o}-${row.id}`}>
                      {o}
                    </Badge>
                  ))
              },*/
              {
                field: 'role',
                title: I18n.t('data_tables.agents.access_list'),
                render: (row) =>
                  row && row.role && <Badge className="mr-2">{row.role}</Badge>,
              },
              {
                field: 'Actions',
                title: I18n.t('data_tables.agents.actions'),
                render: (row) =>
                  row && (
                    <React.Fragment>
                      <Button
                        onClick={() => this.handleEdit(row)}
                        variant="outlined"
                        className="mr-1"
                        size="small"
                      >
                        {I18n.t('common.edit')}
                      </Button>
                      <Button
                        onClick={() => this.handleDelete(row)}
                        className="danger"
                        variant="outlined"
                        size="small"
                      >
                        {I18n.t('common.delete')}
                      </Button>
                    </React.Fragment>
                  ),
              },
              {
                field: 'Sign In Count',
                title: I18n.t('data_tables.agents.sign_in_count'),
              },
              {
                field: 'Last Sign in at',
                title: I18n.t('data_tables.agents.last_sign_in_at'),
                render: (row) =>
                  row && (
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      row.state === 'subscribed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                    >
                      {row.lastSignInAt && (
                        <Moment fromNow>{row.lastSignInAt}</Moment>
                      )}
                    </span>
                  ),
              },
              {
                field: 'invitationAcceptedAt',
                title: I18n.t('data_tables.agents.invitation_accepted_at'),
                render: (row) =>
                  row && (
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      row.state === 'subscribed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                    >
                      {row.invitationAcceptedAt && (
                        <Moment fromNow>{row.invitationAcceptedAt}</Moment>
                      )}
                    </span>
                  ),
              },
            ]}
            enableMapView={false}
          />
        ) : (
          <Progress />
        )}
      </React.Fragment>
    );
  }
}

interface NonAcceptedAppUsersProps {
  app: any;
  dispatch: (value: any) => void;
}

interface NonAcceptedAppUsersState {
  collection: Array<any>;
  loading: boolean;
  isOpen: boolean;
  sent: boolean;
}

class NonAcceptedAppUsers extends React.Component<
  NonAcceptedAppUsersProps,
  NonAcceptedAppUsersState
> {
  input_ref = React.createRef<HTMLInputElement>();

  constructor(props) {
    super(props);
    this.state = {
      collection: [],
      loading: true,
      isOpen: false,
      sent: false,
    };
    //this.input_ref = React.createRef<HTMLDivElement>();
  }

  open = () => this.setState({ isOpen: true });
  close = () => this.setState({ isOpen: false });

  componentDidMount() {
    this.search();
  }

  sendInvitation = () => {
    graphql(
      INVITE_AGENT,
      {
        appKey: this.props.app.key,
        email: this.input_ref.current.value,
      },
      {
        success: () => {
          this.props.dispatch(
            successMessage(I18n.t('settings.team.invitation_success'))
          );
          this.setState(
            {
              sent: true,
              isOpen: false,
            },
            this.search
          );
        },
        error: () => {
          this.props.dispatch(
            errorMessage(I18n.t('settings.team.invitation_error'))
          );
        },
      }
    );
  };

  inviteButton = () => {
    return (
      <div className="flex py-2 justify-end">
        {this.state.isOpen ? (
          <FormDialog
            open={this.state.isOpen}
            handleClose={this.close}
            actionButton={I18n.t('settings.team.action_button')}
            titleContent={I18n.t('settings.team.title_content')}
            contentText={I18n.t('settings.team.content_text')}
            formComponent={
              <Input
                autoFocus
                id="email"
                name="email"
                label="email"
                helperText={I18n.t('settings.team.hint')}
                type="string"
                ref={this.input_ref}
              />
            }
            dialogButtons={
              <React.Fragment>
                <Button onClick={this.close} variant="outlined">
                  {I18n.t('common.cancel')}
                </Button>

                <Button className="mr-1" onClick={this.sendInvitation}>
                  {I18n.t('settings.team.send_invitation')}
                </Button>
              </React.Fragment>
            }
          />
        ) : null}

        <Button variant="contained" color="primary" onClick={this.open}>
          {I18n.t('settings.team.add_new')}
        </Button>
      </div>
    );
  };

  getAgents = () => {
    graphql(
      PENDING_AGENTS,
      { appKey: this.props.app.key },
      {
        success: (data) => {
          this.setState({
            collection: data.app.notConfirmedAgents,
            loading: false,
          });
        },
        error: () => {},
      }
    );
  };

  search = () => {
    this.setState(
      {
        loading: true,
      },
      this.getAgents
    );
  };

  resendInvitation = (email) => {
    graphql(
      INVITE_AGENT,
      {
        appKey: this.props.app.key,
        email: email,
      },
      {
        success: (_data) => {
          this.props.dispatch(
            successMessage(I18n.t('settings.team.invitation_success'))
          );
        },
        error: () => {
          this.props.dispatch(
            errorMessage(I18n.t('settings.team.invitation_error'))
          );
        },
      }
    );
  };

  render() {
    return (
      <React.Fragment>
        {this.inviteButton()}

        {!this.state.loading ? (
          <DataTable
            meta={{}}
            data={this.state.collection}
            search={this.search}
            disablePagination={true}
            columns={[
              { field: 'email', title: 'email' },
              {
                field: 'name',
                title: I18n.t('data_tables.agents.email'),
              },
              {
                field: 'actions',
                title: I18n.t('data_tables.agents.actions'),
                render: (row) => {
                  return (
                    <Button
                      onClick={() => this.resendInvitation(row.email)}
                      variant="outlined"
                      size="md"
                    >
                      {I18n.t('settings.team.resend_invitation')}
                    </Button>
                  );
                },
              },
            ]}
            enableMapView={false}
          />
        ) : (
          <Progress />
        )}
      </React.Fragment>
    );
  }
}

const Teams = function (props) {
  const [teams, setTeams] = React.useState({ collection: [], loading: false });
  const [action, setAction] = React.useState(null);
  const [team, setTeam] = React.useState(null);
  const [errors, setErrors] = React.useState({});

  const form = React.useRef(null);

  function getTeams() {
    graphql(
      TEAMS,
      { appKey: props.app.key, page: 1, per: 10 },
      {
        success: (data) => {
          setTeams({
            collection: data.app.teams.collection,
            loading: false,
          });
        },
        error: () => {},
      }
    );
  }

  function search() {
    getTeams();
    console.log('search teams');
  }

  function handleEdit(row, kind = 'edit') {
    setTeam(row);
    setAction(kind);
  }

  function handleDelete(row) {
    setTeam(row);
    setAction('delete');
  }

  function handleNew(row) {
    setTeam({});
    setAction('new');
  }

  function closeModal() {
    setAction(null);
  }

  React.useEffect(() => {
    search();
  }, []);

  function createTeam(_e) {
    const serializedData = serialize(form.current, {
      hash: true,
      empty: true,
    });

    graphql(
      CREATE_TEAM,
      {
        appKey: props.app.key,
        name: serializedData.app.name,
        description: serializedData.app.description,
        role: serializedData.app.role,
      },
      {
        success: (data) => {
          if (!isEmpty(data.createTeam.errors)) {
            return setErrors(data.createTeam.errors);
          }

          search();

          props.dispatch(successMessage(I18n.t('settings.team.created_team')));
          setAction(null);
        },
        error: (_err) => {
          // errorMessage('...')
        },
      }
    );
  }

  function updateTeam(_e) {
    const serializedData = serialize(form.current, {
      hash: true,
      empty: true,
    });

    graphql(
      UPDATE_TEAM,
      {
        appKey: props.app.key,
        name: serializedData.app.name,
        id: team.id,
        description: serializedData.app.description,
        role: serializedData.app.role,
      },
      {
        success: (data) => {
          if (!isEmpty(data.updateTeam.errors)) {
            return setErrors(data.updateTeam.errors);
          }

          search();

          props.dispatch(successMessage(I18n.t('settings.team.updated_team')));
          setAction(null);
        },
        error: (_err) => {
          // errorMessage('...')
        },
      }
    );
  }

  function deleteTeam(id) {
    graphql(
      DELETE_TEAM,
      {
        appKey: props.app.key,
        id: id,
      },
      {
        success: (data) => {
          if (!isEmpty(data.deleteTeam.errors)) {
            return setErrors(data.createTeam.errors);
          }

          props.dispatch(successMessage(I18n.t('settings.team.deleted_team')));

          search();
          setAction(null);
        },
        error: (_err) => {
          // errorMessage('...')
        },
      }
    );
  }

  function definitions() {
    return [
      {
        name: 'name',
        type: 'string',
        label: I18n.t('definitions.teams.name.label'),
        placeholder: I18n.t('definitions.teams.name.placeholder'),
        grid: { xs: 'w-full', sm: 'w-full' },
      },
      {
        name: 'role',
        type: 'select',
        label: I18n.t('definitions.agents.access_list.label'),
        hint: I18n.t('definitions.agents.access_list.hint'),
        multiple: false,
        options: Object.keys(props.app.availableRoles).map((o) => ({
          label: o,
          value: o,
        })),
        grid: {
          xs: 'w-full',
          sm: 'w-full',
        },
      },
      {
        name: 'description',
        type: 'textarea',
        label: I18n.t('definitions.teams.description.label'),
        placeholder: I18n.t('definitions.teams.description.placeholder'),
        grid: { xs: 'w-full', sm: 'w-full' },
      },
    ];
  }

  return (
    <div className="py-2">
      <div className="flex justify-end">
        <Button variant="flat-dark" onClick={handleNew}>
          {I18n.t('settings.agent_teams.add_team')}
        </Button>
      </div>

      <div className="py-2 justify-end">
        {!teams.loading ? (
          <DataTable
            meta={{}}
            data={teams.collection}
            search={search}
            disablePagination={true}
            columns={[
              { field: 'name', title: I18n.t('data_tables.agents.name') },
              {
                field: 'role',
                title: I18n.t('data_tables.agents.access_list'),
                render: (row) =>
                  row && row.role && <Badge className="mr-2">{row.role}</Badge>,
              },
              {
                field: 'Actions',
                title: I18n.t('data_tables.agents.actions'),
                render: (row) =>
                  row && (
                    <React.Fragment>
                      <Button
                        onClick={() => handleEdit(row)}
                        variant="outlined"
                        className="mr-1"
                        size="small"
                      >
                        {I18n.t('common.edit')}
                      </Button>
                      <Button
                        onClick={() => handleEdit(row, 'editParticipants')}
                        variant="outlined"
                        className="mr-1"
                        size="small"
                      >
                        {I18n.t('settings.team.participants')}
                      </Button>
                      <Button
                        onClick={() => handleDelete(row)}
                        variant="danger"
                        size="small"
                      >
                        {I18n.t('common.delete')}
                      </Button>
                    </React.Fragment>
                  ),
              },
            ]}
            enableMapView={false}
          />
        ) : (
          <Progress />
        )}
      </div>

      {action === 'new' && (
        <FormDialog
          open={true}
          handleClose={closeModal}
          actionButton={I18n.t('settings.team.new.action_button')}
          titleContent={I18n.t('settings.team.new.title_content')}
          contentText={I18n.t('settings.team.new.content_text')}
          formComponent={
            <form ref={form}>
              {definitions().map((field) => {
                return (
                  <div
                    className={`${gridClasses(field)} py-2 pr-2`}
                    key={field.name}
                  >
                    <FieldRenderer
                      namespace={'app'}
                      type={field.type}
                      data={camelizeKeys(field)}
                      props={{
                        data: camelizeKeys(team),
                      }}
                      errors={errors}
                    />
                  </div>
                );
              })}
            </form>
          }
          dialogButtons={
            <React.Fragment>
              <Button variant="success" onClick={createTeam}>
                {I18n.t('common.submit')}
              </Button>
            </React.Fragment>
          }
        />
      )}

      {action === 'edit' && (
        <FormDialog
          open={true}
          handleClose={closeModal}
          actionButton={I18n.t('settings.team.edit.action_button')}
          titleContent={I18n.t('settings.team.edit.title_content')}
          contentText={I18n.t('settings.team.edit.content_text')}
          formComponent={
            <form ref={form}>
              {definitions().map((field) => {
                return (
                  <div
                    className={`${gridClasses(field)} py-2 pr-2`}
                    key={field.name}
                  >
                    <FieldRenderer
                      namespace={'app'}
                      type={field.type}
                      data={camelizeKeys(field)}
                      props={{
                        data: camelizeKeys(team),
                      }}
                      errors={errors}
                    />
                  </div>
                );
              })}
            </form>
          }
          dialogButtons={
            <React.Fragment>
              <Button variant="success" onClick={updateTeam}>
                {I18n.t('common.submit')}
              </Button>
            </React.Fragment>
          }
        />
      )}

      {action === 'editParticipants' && (
        <TeamAgentEdit {...props} closeModal={closeModal} team={team} />
      )}

      {action === 'delete' && (
        <FormDialog
          open={true}
          handleClose={closeModal}
          actionButton={I18n.t('settings.team.delete.action_button')}
          titleContent={I18n.t('settings.team.delete.title_content')}
          contentText={I18n.t('settings.team.delete.content_text')}
          formComponent={<p>{I18n.t('settings.team.confirm_team_delete')}</p>}
          dialogButtons={
            <React.Fragment>
              <Button variant="danger" onClick={() => deleteTeam(team.id)}>
                {I18n.t('common.confirm_deletion')}
              </Button>
            </React.Fragment>
          }
        />
      )}
    </div>
  );
};

function TeamAgentEdit(props) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [elements, setElements] = React.useState([]);
  const [isLoading, setLoading] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState(null);
  const [agents, setAgents] = React.useState([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  React.useEffect(
    () => {
      if (debouncedSearchTerm) {
        getElements(debouncedSearchTerm);
      } else {
        setElements([]);
      }
    },
    [debouncedSearchTerm] // Only call effect if debounced search term changes
  );

  React.useEffect(() => {
    getTeamAgents();
  }, []);

  function getElements(term) {
    graphql(
      AGENT_SEARCH,
      {
        appKey: props.app.key,
        term: term,
      },
      {
        success: (data) => {
          setElements(data.app.agentSearch);
        },
        error: (err) => {
          console.log('err', err);
        },
      }
    );
  }

  function displayElementList() {
    return elements.map((o) => ({
      label: `${o.displayName} · ${o.email}`,
      value: o.id,
    }));
  }

  function handleChange(e) {
    setSearchValue(e);
  }

  function handleInputChange(e) {
    setSearchTerm(e);
  }

  function addAgent() {
    if (!searchValue.value) return;

    graphql(
      ADD_TEAM_AGENT,
      {
        appKey: props.app.key,
        id: props.team.id,
        agentId: searchValue.value,
      },
      {
        success: (data) => {
          if (isEmpty(data.addTeamAgent.errors)) {
            props.dispatch(
              successMessage(I18n.t('settings.agent_teams.added_success'))
            );
            return getTeamAgents();
          }
          if (data.addTeamAgent.errors.role_id) {
            props.dispatch(errorMessage(data.addTeamAgent.errors.role_id));
          }
        },
        error: (err) => {
          console.log('err', err);
        },
      }
    );
  }

  function getTeamAgents() {
    graphql(
      TEAM_WITH_AGENTS,
      {
        appKey: props.app.key,
        id: props.team.id,
      },
      {
        success: (data) => {
          setLoading(false);
          setAgents(data.app.team.agents.collection);
        },
        error: (err) => {
          console.log('err', err);
        },
      }
    );
  }

  function removeAgent(id) {
    graphql(
      DELETE_TEAM_AGENT,
      {
        appKey: props.app.key,
        id: props.team.id,
        agentId: id,
      },
      {
        success: (data) => {
          props.dispatch(
            successMessage(I18n.t('settings.agent_teams.delete_success'))
          );
          getTeamAgents();
        },
        error: (err) => {
          console.log('err', err);
        },
      }
    );
  }

  return (
    <React.Fragment>
      <FormDialog
        open={true}
        handleClose={props.closeModal}
        actionButton={I18n.t('settings.agent_teams.action_button')}
        titleContent={I18n.t('settings.agent_teams.title_content')}
        contentText={I18n.t('settings.agent_teams.content_text')}
        formComponent={
          <div className="space-y-2 w-full">
            <div className="space-y-1">
              <div className="flex">
                <div className="flex-grow">
                  <Select
                    isClearable
                    options={displayElementList()}
                    isLoading={isLoading}
                    value={searchValue}
                    onChange={handleChange}
                    placeholder={I18n.t(
                      'settings.agent_teams.search_placeholder'
                    )}
                    onInputChange={handleInputChange}
                  />
                </div>

                <span className="ml-3">
                  <button
                    type="button"
                    onClick={addAgent}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                  >
                    <svg
                      className="-ml-2 mr-1 h-5 w-5 text-gray-400"
                      x-description="Heroicon name: mini/plus"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"></path>
                    </svg>
                    <span>{I18n.t('common.add')}</span>
                  </button>
                </span>
              </div>
            </div>

            <div className="border-b border-gray-200">
              <ul role="list" className="divide-y divide-gray-200">
                {agents.map((agent) => (
                  <li className="flex py-4" key={`agent-team-id-${agent.id}`}>
                    <img
                      className="h-10 w-10 rounded-full"
                      src={agent.avatarUrl}
                      alt=""
                    />
                    <div className="flex justify-between w-full">
                      <div className="ml-3 flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {agent.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {agent.email}
                        </span>
                      </div>
                      <Button
                        variant="danger"
                        onClick={() => removeAgent(agent.id)}
                      >
                        {I18n.t('common.remove')}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        }
        dialogButtons={<React.Fragment></React.Fragment>}
      />
    </React.Fragment>
  );
}

function mapStateToProps(state) {
  const { auth, app } = state;
  const { isAuthenticated } = auth;
  // const { sort, filter, collection , meta, loading} = conversations

  return {
    app,
    isAuthenticated,
  };
}

export default withRouter(connect(mapStateToProps)(TeamPage));
