import PropTypes from "prop-types";
import React, { Component } from "react";

import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import Moment from "react-moment";
import PageHeader from "../components/PageHeader";
import Content from "../components/Content";
import Tabs from "../components/Tabs";
import Progress from "../components/Progress";
import { AnchorLink } from "../shared/RouterLink";
import DataTable from "../components/Table";
import Input from "../components/forms/Input";
import Button from "../components/Button";
import { HomeIcon } from "../components/icons";
import { Link } from "react-router-dom";
import graphql from "../graphql/client";
import { AGENTS, PENDING_AGENTS } from "../graphql/queries";
import { 
  INVITE_AGENT, 
  RESEND_INVITE_AGENT 
} from "../graphql/mutations";

import FormDialog from "../components/FormDialog";
import { successMessage, errorMessage } from '../actions/status_messages'
import { setCurrentPage, setCurrentSection } from "../actions/navigation";

class TeamPage extends Component {
  state = {
    meta: {},
    tabValue: 0,
  };

  componentDidMount() {
    this.props.dispatch(setCurrentSection("Settings"));
    this.props.dispatch(setCurrentPage("team"));
  }

  handleTabChange = (e, i) => {
    this.setState({ tabValue: i });
  };

  render() {
    return (
      <Content>
        <PageHeader
          title={"Team"}
          /*actions={
            <Button
              className={"transition duration-150 ease-in-out"}
              variant={"main"}
              color={"primary"}
              //onClick={newWebhook}
            >
              New team member
            </Button>
          }*/
        />

        <Tabs
          currentTab={this.state.tabValue}
          tabs={[
            {
              label: "Team",
              //icon: <HomeIcon />,
              content: <AppUsers {...this.props} />,
            },
            {
              label: "Invitations",
              content: <NonAcceptedAppUsers {...this.props} />,
            },
          ]}
        />
      </Content>
    );
  }
}

class AppUsers extends React.Component {
  state = {
    collection: [],
    loading: true,
  };

  componentDidMount() {
    this.search();
  }

  getAgents = () => {
    graphql(
      AGENTS,
      { appKey: this.props.app.key },
      {
        success: (data) => {
          this.setState({
            collection: data.app.agents,
            loading: false,
          });
        },
        error: () => {},
      }
    );
  };
  search = (item) => {
    this.setState(
      {
        loading: true,
      },
      this.getAgents
    );
  };

  render() {
    return (
      <React.Fragment>
        {!this.state.loading ? (
          <DataTable
            elevation={0}
            title={"agents"}
            meta={{}}
            data={this.state.collection}
            search={this.search}
            loading={this.state.loading}
            disablePagination={true}
            columns={[
              {
                field: "email",
                title: "email",
                render: (row) =>
                  row && (
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={row.avatarUrl}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm leading-5 font-medium text-gray-900">
                            {row.displayName}
                          </div>
                          <div className="text-sm leading-5 text-gray-500">
                            {row.email}
                          </div>
                        </div>
                      </div>
                    </td>
                  ),
              },
              { field: "name", title: "Name" },
              { field: "Sign In Count", title: "Sign in Count" },
              {
                field: "Last Sign in at",
                title: "Last sign in at",
                render: (row) =>
                  row && (
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        row.state === "subscribed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                      >
                        {row.lastSignInAt && (
                          <Moment fromNow>{row.lastSignInAt}</Moment>
                        )}
                      </span>
                    </td>
                  ),
              },
              {
                field: "invitationAcceptedAt",
                title: "invitation Accepted At",
                render: (row) =>
                  row && (
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        row.state === "subscribed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                      >
                        {row.invitationAcceptedAt && (
                          <Moment fromNow>{row.invitationAcceptedAt}</Moment>
                        )}
                      </span>
                    </td>
                  ),
              },
            ]}
            defaultHiddenColumnNames={[]}
            tableColumnExtensions={[
              { columnName: "email", width: 250 },
              { columnName: "id", width: 10 },
              { columnName: "avatar", width: 55 },
            ]}
            //tableEdit={true}
            //editingRowIds={["email", "name"]}
            commitChanges={(aa, bb) => {
              debugger;
            }}
            //leftColumns={this.props.leftColumns}
            //rightColumns={this.props.rightColumns}
            //toggleMapView={this.props.toggleMapView}
            //map_view={this.props.map_view}
            enableMapView={false}
          />
        ) : (
          <Progress />
        )}
      </React.Fragment>
    );
  }
}

class NonAcceptedAppUsers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collection: [],
      loading: true,
      isOpen: false,
      sent: false,
    };
    this.input_ref = React.createRef();
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
        success: (data) => {
          this.props.dispatch(successMessage('invitation sent!'))
          this.setState(
            {
              sent: true,
              isOpen: false,
            },
            this.search
          );
        },
        error: () => {
          this.props.dispatch(errorMessage('invitation not sent!'))

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
            actionButton={"add user"}
            titleContent={"Add a new agent"}
            contentText={"send an activable invitation"}
            formComponent={
              <Input
                autoFocus
                margin="dense"
                id="email"
                name="email"
                label="email"
                helperText="the new team member will be notified by it's email"
                type="string"
                fullWidth
                ref={this.input_ref}
              />
            }
            dialogButtons={
              <React.Fragment>
                <Button onClick={this.close} 
                  variant="outlined">
                  Cancel
                </Button>

                <Button className="mr-1" onClick={this.sendInvitation}>
                  Send invitation
                </Button>
              </React.Fragment>
            }
          />
        ) : null}

        <Button 
          variant="contained" 
          color="primary"
          onClick={this.open}>
          Add Team Member
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

  resendInvitation = (email)=>{
    graphql(INVITE_AGENT, {
      appKey: this.props.app.key,
      email: email,
    }, {
      success: (data)=>{          
        this.props.dispatch(successMessage('invitation sent!'))
        console.log("inivited")
      },
      error: ()=>{          
        this.props.dispatch(errorMessage('invitation not sent!'))
        console.log("error invited")
      }
    })
  }

  render() {
    return (
      <React.Fragment>
        {this.inviteButton()}

        {!this.state.loading ? (
          <DataTable
            elevation={0}
            title={"invitations"}
            meta={{}}
            data={this.state.collection}
            search={this.search}
            loading={this.state.loading}
            disablePagination={true}
            columns={[
              { field: "email", title: "email" },
              { field: "name", title: "name" },
              { field: "actions", title: "actions", render: (row)=> {
                  return <tr className="flex items-center px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                          <Button 
                            onClick={ ()=> this.resendInvitation(row.email) } 
                            variant="outlined" size="md">
                            resend invitation
                          </Button>
                        </tr>
                }
              }
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
  //const { sort, filter, collection , meta, loading} = conversations

  return {
    app,
    isAuthenticated,
  };
}

export default withRouter(connect(mapStateToProps)(TeamPage));
