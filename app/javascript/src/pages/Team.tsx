import React, { Component } from 'react';

import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Moment from 'react-moment';

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
} from '@chaskiq/store/src/graphql/queries';
import {
  INVITE_AGENT,
  UPDATE_AGENT_ROLE,
  DESTROY_AGENT_ROLE,
} from '@chaskiq/store/src/graphql/mutations';
import I18n from '../shared/FakeI18n';

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
              label: I18n.t('settings.team.title'),
              // icon: <HomeIcon />,
              content: <AppUsers {...this.props} />,
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
