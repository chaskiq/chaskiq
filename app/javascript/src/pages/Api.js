import PropTypes from "prop-types";
import React, { Component } from "react";
import {isEmpty} from 'lodash'
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
import DeleteDialog from '../components/DeleteDialog'
import { HomeIcon } from "../components/icons";
import I18n from '../shared/FakeI18n'
import { 
  Link, 
  Route, 
  Switch, 
  useParams, 
  useHistory, 
  withRouter 
} from "react-router-dom";
import graphql from "../graphql/client";
import serialize from "form-serialize";
import FieldRenderer, {
  gridClasses,
} from "../components/forms/FieldRenderer";
import { 
  OAUTH_APPS, 
  OAUTH_APP,
  AUTHORIZED_OAUTH_APPS
} from "../graphql/queries";
import { 
  CREATE_OAUTH_APP,
  UPDATE_OAUTH_APP,
  DELETE_OAUTH_APP 
} from "../graphql/mutations";

import FormDialog from "../components/FormDialog";
import { setCurrentPage, setCurrentSection } from "../actions/navigation";

function formDefinitions(){
  return [
    {
      name: "name",
      label: "Oauth app name",
      type: "string",
      grid: { xs: "w-full", sm: "w-full" },
    },
    {
      name: "confidential",
      label: "Confidential",
      hint: "Application will be used where the client secret can be kept confidential. Native mobile apps and Single Page Apps are considered non-confidential.",
      type: "bool",
      grid: { xs: "w-full", sm: "w-full" },
    },
    {
      name: "redirect_uri",
      label: "Redirect URI",
      hint: `Use one line per URI
              Leave it blank if you configured your provider to use Client Credentials, 
              Resource Owner Password Credentials or any other grant type that doesn\'t require redirect URI.`,
      type: "string",
      grid: { xs: "w-full", sm: "w-full" },
    },
    {
      name: "scopes",
      label: "Scopes for application",
      hint: "Separate scopes with spaces. Leave blank to use the default scopes.",
      type: "string",
      grid: { xs: "w-full", sm: "w-full" },
    }
  ];
}

class ApiPage extends Component {
  state = {
    meta: {},
    tabValue: 0,
  };

  componentDidMount() {
    this.props.dispatch(setCurrentSection("Settings"));
    this.props.dispatch(setCurrentPage("oauth_applications"));
  }

  handleTabChange = (e, i) => {
    this.setState({ tabValue: i });
  };

  getApps = (cb) => {
    graphql(
      OAUTH_APPS,
      { appKey: this.props.app.key },
      {
        success: (data) => {
          /*this.setState({
            collection: data.app.oauthApplications,
            loading: false,
          });*/
          cb(data.app.oauthApplications)
        },
        error: () => {},
      }
    );
  };

  getAuthorizedApps = (cb) => {
    graphql(
      AUTHORIZED_OAUTH_APPS,
      { appKey: this.props.app.key },
      {
        success: (data) => {
          cb(data.app.authorizedOauthApplications)
          /*this.setState({
            collection: data.app.authorizedOauthApplications,
            loading: false,
          });*/
        },
        error: () => {},
      }
    );
  };

  render() {
    return (
      <Content>
        <PageHeader
          title={I18n.t("settings.api.title")}
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

        <Switch>
          <Route path={`${this.props.match.path}`} exact>

            <Tabs
              currentTab={this.state.tabValue}
              tabs={[
                {
                  label: I18n.t("settings.api.tabs.apps"),
                  content: <OauthList getApps={this.getApps} {...this.props} />,
                },
                {
                  label: I18n.t("settings.api.tabs.authorized"),
                  content: <OauthList getApps={this.getAuthorizedApps} {...this.props} />,
                },
              ]}
            />

          </Route>

          <Route path={`${this.props.match.path}/:uid`}>
            <OauthApp app={this.props.app} />
          </Route>
        </Switch>
      </Content>
    );
  }
}


function OauthApp(props){
  let params = useParams();
  let formRef = React.useRef(null)
  let history = useHistory();

  const [data, setData ] = React.useState({})
  const [loading, setLoading ] = React.useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false)
  const [editIsOpen, setEditIsOpen] = React.useState(false)
  const [errors, setErrors] = React.useState({})
  
  React.useState(()=>{
    setLoading(true)
    graphql(
      OAUTH_APP,
      {
        appKey: props.app.key,
        uid: params.uid,
      },
      {
        success: (data) => {
          setData(data.app.oauthApplication)
          setLoading(false)
        },
        error: () => {},
      }
    );

  }, [])

  function authorizeUrl(){
    return `/oauth/authorize?client_id=${data.uid}&redirect_uri=${encodeURI(data.redirectUri)}&response_type=code&scope=`
  }

  function updateApp(e) {
    e.preventDefault && e.preventDefault()
    const serializedData = serialize(formRef.current, {
      hash: true,
      empty: true,
    });

    graphql(
      UPDATE_OAUTH_APP,
      {
        appKey: props.app.key,
        uid: data.uid,
        params: serializedData.doorkeeper_application
      },
      {
        success: (data) => {
          if(isEmpty(data.updateOauthApplication.errors)) {
            setData(data.updateOauthApplication.oauthApplication)
            setEditIsOpen(false)
          } else {
            setLoading(false)
            setErrors(data.updateOauthApplication.errors)
          }
        },
        error: () => {},
      }
    );
  };

  function deleteApp() {
    graphql(
      DELETE_OAUTH_APP,
      {
        appKey: props.app.key,
        uid: data.uid,
      },
      {
        success: (data) => {
          history.push(`/apps/${props.app.key}/oauth_applications`)
        },
        error: () => {},
      }
    );
  };

  return (
    <div className="bg-white shadow overflow-hidden  sm:rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {I18n.t("settings.api.oauth_information")}
        </h3>
        <div className="flex justify-between">
          <p className="mt-1 max-w-2xl text-sm leading-5 text-gray-500">
            {I18n.t("settings.api.details")}
          </p>
          <div>
            <Button
              className="mr-3" 
              onClick={()=> setEditIsOpen(true)}>
              {I18n.t("common.edit")}
            </Button>
            <Button 
              variant="danger"
              onClick={()=> setOpenDeleteDialog(true)}>
              {I18n.t("common.delete")}
            </Button>
          </div>
        </div>
      </div>
      <div className="px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 col-gap-4 row-gap-8 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm leading-5 font-medium text-gray-500">
              Name
            </dt>
            <dd className="mt-1 text-sm leading-5 text-gray-900">
              {data.name}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm leading-5 font-medium text-gray-500">
              Confidential
            </dt>
            <dd className="mt-1 text-sm leading-5 text-gray-900">
              {data.confidential}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm leading-5 font-medium text-gray-500">
              Client id
            </dt>
            <dd className="mt-1 text-sm leading-5 text-gray-900">
              {data.uid}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm leading-5 font-medium text-gray-500">
              Redirect URI
            </dt>
            <dd className="mt-1 text-sm leading-5 text-gray-900 flex justify-between items-center">
              {data.redirectUri}
              <Button 
                size={'small'}
                variant="outlined"
                onClick={()=> window.location = authorizeUrl()}>authorize</Button>
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm leading-5 font-medium text-gray-500">
              Secret
            </dt>
            <dd className="mt-1 text-sm leading-5 text-gray-900">
              {data.secret}
            </dd>
          </div>
        </dl>
      </div>

      <div className="py-2">
        {editIsOpen && 
          <FormDialog
            open={editIsOpen}
            handleClose={()=> setEditIsOpen(false)}
            actionButton={"edit"}
            titleContent={`Edit ${data.name} oauth app`}
            contentText={"bla bla"}
            formComponent={
              <form
                name="create-repo"
                onSubmit={updateApp}
                ref={formRef}
              >
                {formDefinitions().map((field, i) => {
                  return (
                    
                      <div
                        key={`field-${field.name}`}
                        className={`${gridClasses(field)} py-2 pr-2`}
                        {...field.gridProps}
                      >
                        <FieldRenderer
                          {...field}
                          key={`field-renderer-oauth-${i}`}
                          namespace={"doorkeeper_application"}
                          data={field}
                          props={{
                            data: data
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
                <Button onClick={()=> setEditIsOpen(false)} 
                  variant="outlined">
                  {I18n.t("common.cancel")}
                </Button>

                <Button className="mr-1" onClick={ updateApp }>
                  {I18n.t("common.update")}
                </Button>
              </React.Fragment>
            }
          />
        }
      </div>

      {openDeleteDialog && (
        <DeleteDialog
          open={openDeleteDialog}
          title={I18n.t("settings.api.delete_app")}
          closeHandler={() => {
            setOpenDeleteDialog(null);
          }}
          deleteHandler={() => {
            deleteApp(data);
          }}
        >
          <p variant="subtitle2">
            {I18n.t("settings.api.delete_app_hint")}
          </p>
        </DeleteDialog>
      )}

    </div>
  )
}

class OauthList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collection: [],
      loading: true,
      isOpen: false,
      sent: false,
      data: {},
      errors: {}
    };
    this.input_ref = React.createRef();
  }

  open = () => this.setState({ isOpen: true, errors: {} });
  close = () => this.setState({ isOpen: false });

  componentDidMount() {
    this.search();
  }

  createApp = () => {
    const serializedData = serialize(this.input_ref.current, {
      hash: true,
      empty: true,
    });

    graphql(
      CREATE_OAUTH_APP,
      {
        appKey: this.props.app.key,
        params: serializedData.doorkeeper_application,
      },
      {
        success: (data) => {
          const errs = data.createOauthApplication.errors
          this.setState(
            {
              sent: true,
              isOpen: !isEmpty(errs),
              errors: errs,
              data: data.createOauthApplication.oauthApplication
            },
            this.search
          );
        },
        error: () => {},
      }
    );
  };

  inviteButton = () => {
    return (
      <div className="py-2 flex justify-end">
        {this.state.isOpen ? (
          <FormDialog
            open={this.state.isOpen}
            handleClose={this.close}
            actionButton={"add user"}
            titleContent={I18n.t("settings.api.invite.title")}
            contentText={I18n.t("settings.api.invite.text")}
            formComponent={
              <form
                name="create-repo"
                onSubmit={this.createApp}
                ref={this.input_ref}
              >
                {formDefinitions().map((field, i) => {
                  return (
                    
                      <div
                        key={`field-${field.name}`}
                        className={`${gridClasses(field)} py-2 pr-2`}
                        {...field.gridProps}
                      >
                        <FieldRenderer
                          {...field}
                          key={`field-renderer-oauth-${i}`}
                          namespace={"doorkeeper_application"}
                          data={field}
                          props={{
                            data: this.state.data || {}
                          }}
                          errors={this.state.errors}
                        />
                      </div>
                  
                  );
                })}
              </form>

            }
            dialogButtons={
              <React.Fragment>
                <Button onClick={this.close} 
                  variant="outlined">
                  {I18n.t("common.cancel")}
                </Button>

                <Button className="mr-1" onClick={this.createApp}>
                  {I18n.t("settings.api.create_app")}
                </Button>
              </React.Fragment>
            }
          />
        ) : null}

        <Button 
          variant="contained" 
          color="primary"
          onClick={this.open}>
          {I18n.t("settings.api.create_app")}
        </Button>
      </div>
    );
  };

  search = () => {
    this.setState(
      {
        loading: true,
      },
      this.props.getApps((data)=>{
        this.setState({
          collection: data,
          loading: false,
        });
      })
    );
  };

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
              { field: "name", title: "name", render: (row)=>{
                return <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                  <Link className="font-bold text-2xl" to={`${this.props.match.path}/${row.uid}`}>
                    {row.name}
                  </Link>
                </td>
              }},
              { field: "redirectUri", title: "redirect uri" },
              { field: "confidential", title: "confidential" },
              {
                field: "createdAt",
                title: "Created at",
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

export default withRouter(connect(mapStateToProps)(ApiPage));
