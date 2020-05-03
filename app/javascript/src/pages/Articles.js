import PropTypes from "prop-types";
import React, { Component } from "react";

import { withRouter, Route, Switch, Link } from "react-router-dom";
import { connect } from "react-redux";

import Content from "../components/Content";
import ContentHeader from "../components/PageHeader";
import Tabs from "../components/Tabs";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import TextField from "../components/forms/Input";
import CircularProgress from "../components/Progress";
import { errorMessage, successMessage } from "../actions/status_messages";

import { AnchorLink } from "../shared/RouterLink";

import { LinkButton, LinkIconButton } from "../shared/RouterLink";

import ScrollableTabsButtonForce from "../components/scrollingTabs";
import langs from "../shared/langsOptions";

import graphql from "../graphql/client";
import { ARTICLES } from "../graphql/queries";
import {
  CREATE_ARTICLE,
  EDIT_ARTICLE,
  DELETE_ARTICLE,
  ARTICLE_SETTINGS_UPDATE,
  ARTICLE_SETTINGS_DELETE_LANG,
} from "../graphql/mutations";

import FormDialog from "../components/FormDialog";
import DataTable from "../components/Table";
import ArticlesNew from "./articles/new";
import Settings from "./articles/settings";

import Collections from "./articles/collections/index";
import CollectionDetail from "./articles/collections/show";

import { setCurrentSection, setCurrentPage } from "../actions/navigation";
import { ARTICLE_SETTINGS } from "../graphql/queries";
import Badge from '../components/Badge'

import {
  AddIcon, GestureIcon, CheckCircleIcon
} from '../components/icons'

const styles = (theme) => ({
  addUser: {
    marginRight: theme.spacing(1),
  },
});

class Articles extends Component {
  state = {
    meta: {},
    tabValue: 0,
    settings: null,
    errors: [],
  };

  componentDidMount() {
    this.props.dispatch(setCurrentSection("HelpCenter"));
    this.getSettings();
  }

  getSettings = (cb) => {
    graphql(
      ARTICLE_SETTINGS,
      {
        appKey: this.props.app.key,
      },
      {
        success: (data) => {
          this.setState(
            {
              settings: data.app.articleSettings,
            },
            cb
          );
        },
        error: (e) => {
          debugger;
        },
      }
    );
  };

  updateSettings = (data) => {
    const { settings } = data;
    graphql(
      ARTICLE_SETTINGS_UPDATE,
      {
        appKey: this.props.app.key,
        settings: settings,
      },
      {
        success: (data) => {
          this.setState(
            {
              settings: data.articleSettingsUpdate.settings,
              errors: data.articleSettingsUpdate.errors,
            },
            () => {
              this.props.dispatch(successMessage("article settings updated"));
            }
          );
        },
        error: (e) => {
          debugger;
        },
      }
    );
  };

  deleteLang = (item, cb) => {
    graphql(
      ARTICLE_SETTINGS_DELETE_LANG,
      {
        appKey: this.props.app.key,
        langItem: item,
      },
      {
        success: (data) => {
          this.setState(
            {
              settings: data.articleSettingsDeleteLang.settings,
              errors: data.articleSettingsDeleteLang.errors,
            },
            () => {
              cb && cb();
              this.props.dispatch(successMessage("article settings updated"));
            }
          );
        },
        error: (e) => {
          debugger;
        },
      }
    );
  };

  handleTabChange = (e, i) => {
    this.setState({ tabValue: i });
  };

  tabsContent = () => {
    return (
      <Tabs
        value={this.state.tabValue}
        onChange={this.handleTabChange}
        textColor="inherit"
        tabs={[
          {
            label: "All",
            content: (
              <AllArticles
                {...this.props}
                settings={this.state.settings}
                mode={"all"}
              />
            ),
          },
          {
            label: "Published",
            content: (
              <AllArticles
                {...this.props}
                settings={this.state.settings}
                mode={"published"}
              />
            ),
          },
          {
            label: "Draft",
            content: (
              <AllArticles
                {...this.props}
                settings={this.state.settings}
                mode={"draft"}
              />
            ),
          },
        ]}
      ></Tabs>
    );
  };

  render() {
    return (
      <Content>
        {this.state.settings ? (
          <Switch>
            <Route
              exact
              path={`/apps/${this.props.app.key}/articles`}
              render={(props) => {
                return (
                  <React.Fragment>
                    <ContentHeader
                      title={"Articles"}
                      //tabsContent={ this.tabsContent() }
                      actions={
                        <React.Fragment>
                          {this.state.settings &&
                          this.state.settings.subdomain ? (
                            <div item>
                              <Button
                                href={`https://${this.state.settings.subdomain}.chaskiq.io`}
                                variant="outlined"
                                color="inherit"
                                size="small"
                                target={"blank"}
                                className="mr-2"
                              >
                                visit help center
                              </Button>
                            </div>
                          ) : null}

                          <Button 
                            variant={'contained'} 
                            color={'primary'} 
                            onClick={()=> this.props.history.push(`/apps/${this.props.app.key}/articles/new`)}>
                            {/*<AddIcon />*/}
                            {" New article"}
                          </Button>
                        </React.Fragment>
                      }
                    />
                    {this.state.settings && this.tabsContent()}
                  </React.Fragment>
                );
              }}
            />

            <Route
              exact
              path={`/apps/${this.props.app.key}/articles/settings`}
              render={(props) => {
                return (
                  <Settings
                    settings={this.state.settings}
                    errors={this.state.errors}
                    getSettings={this.getSettings}
                    match={props.match}
                    history={props.history}
                    update={this.updateSettings}
                    deleteLang={this.deleteLang}
                  />
                );
              }}
            />

            <Route
              exact
              path={`/apps/${this.props.app.key}/articles/collections`}
              render={(props) => {
                return (
                  <Collections
                    settings={this.state.settings}
                    getSettings={this.getSettings}
                    match={props.match}
                    history={props.history}
                  />
                );
              }}
            />

            <Route
              exact
              path={`/apps/${this.props.app.key}/articles/collections/:id`}
              render={(props) => {
                return (
                  <CollectionDetail
                    settings={this.state.settings}
                    getSettings={this.getSettings}
                    match={props.match}
                    history={props.history}
                  />
                );
              }}
            />

            <Route
              exact
              path={`/apps/${this.props.app.key}/articles/:id`}
              render={(props) => {
                return (
                  <ArticlesNew
                    settings={this.state.settings}
                    getSettings={this.getSettings}
                    history={this.props.history}
                    data={{}}
                  />
                );
              }}
            />
          </Switch>
        ) : null}
      </Content>
    );
  }
}

class AllArticles extends React.Component {
  state = {
    collection: [],
    loading: true,
    lang: "en",
    openDeleteDialog: false,
  };

  componentDidMount() {
    this.search();

    this.props.dispatch(setCurrentSection("HelpCenter"));

    this.props.dispatch(setCurrentPage("Articles"));
  }

  componentDidUpdate(prevProps) {
    if (prevProps.mode != this.props.mode) {
      this.search();
    }
  }

  getArticles = () => {
    graphql(
      ARTICLES,
      {
        appKey: this.props.app.key,
        page: 1,
        lang: this.state.lang,
        mode: this.props.mode,
      },
      {
        success: (data) => {
          this.setState({
            collection: data.app.articles.collection,
            meta: data.app.articles.meta,
            loading: false,
          });
        },
        error: () => {},
      }
    );
  };

  handleLangChange = (lang) => {
    this.setState(
      {
        lang: lang,
      },
      this.getArticles
    );
  };

  search = (item) => {
    this.setState(
      {
        loading: true,
      },
      this.getArticles
    );
  };

  renderActions = () => {
    return (
      <div container direction="row" justify="flex-end">
        <div item>
          <LinkButton
            variant={"contained"}
            color={"primary"}
            onClick={() =>
              this.props.history.push(
                `/apps/${this.props.app.key}/articles/new`
              )
            }
          >
            <AddIcon />
            {" New article"}
          </LinkButton>
        </div>
      </div>
    );
  };

  setOpenDeleteDialog = (val) => {
    this.setState({ openDeleteDialog: val });
  };

  removeArticle = (row) => {
    graphql(
      DELETE_ARTICLE,
      {
        appKey: this.props.app.key,
        id: row.id.toString(),
      },
      {
        success: (data) => {
          this.setState(
            {
              collection: this.state.collection.filter((o) => o.id != row.id),
            },
            () => {
              this.setOpenDeleteDialog(null);
              this.props.dispatch(successMessage("article deleted"));
            }
          );
        },
        error: (e) => {
          debugger;
        },
      }
    );
  };

  render() {
    const { openDeleteDialog } = this.state;

    return (
      <div actions={this.renderActions()}>
        <ScrollableTabsButtonForce
          tabs={this.props.settings.availableLanguages.map((o) =>
            langs.find((lang) => lang.value === o)
          )}
          changeHandler={(index) =>
            this.handleLangChange(this.props.settings.availableLanguages[index])
          }
        />

        <div mt={2}>
          {!this.state.loading ? (
            <DataTable
              elevation={0}
              title={`${this.props.mode} articles`}
              meta={this.state.meta}
              data={this.state.collection}
              search={this.search}
              loading={this.state.loading}
              disablePagination={true}
              columns={[
                //{field: "id", title: "id"},
                {
                  field: "title",
                  title: "title",
                  render: (row) =>
                    row ? (
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                        <div className="flex items-center text-lg font-bold">
                          {row.id && (
                            <AnchorLink
                              to={`/apps/${this.props.app.key}/articles/${row.id}`}
                            >
                              {row.title
                                ? row.title
                                : "-- missing translation --"}
                            </AnchorLink>
                          )}
                        </div>
                      </td>
                    ) : undefined,
                },
                {
                  field: "author",
                  title: "author",
                  render: (row) =>
                    row ? (
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                        <div className="flex items-center">
                          <span>
                            {row.author.name}
                            <br />
                            {row.author.email}
                          </span>
                        </div>
                      </td>
                    ) : undefined,
                },
                {
                  field: "state",
                  title: "state",
                  render: (row) =>
                    row && (
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                        <div className="flex items-center">
                          <Badge
                            variant={
                              row.state === 'draft' ? 'yellow' : 'green'
                            }
                          >
                            {
                              row.state === "draft" ? (
                                <GestureIcon />
                              ) : (
                                <CheckCircleIcon />
                              )
                            }

                            {" "}

                            {row.state}
                          </Badge>
                        </div>
                      </td>
                    ),
                },
                {
                  field: "collection",
                  title: "collection",
                  render: (row) =>
                    row && (
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                        <div className="flex items-center">
                          {row.collection && (
                            <AnchorLink
                              to={`/apps/${this.props.app.key}/articles/collections/${row.collection.id}`}
                            >
                              {row.collection.title}
                            </AnchorLink>
                          )}
                        </div>
                      </td>
                    ),
                },
                {
                  field: "actions",
                  title: "actions",
                  render: (row) =>
                    row && (
                      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                        <div className="flex items-center">
                          <Button
                            variant={"outlined"}
                            onClick={() => {
                              this.setOpenDeleteDialog(row);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    ),
                },
              ]}
              defaultHiddenColumnNames={[]}
              tableColumnExtensions={[
                { columnName: "title", width: 250 },
                { columnName: "id", width: 10 },
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
            <CircularProgress />
          )}
        </div>

        {openDeleteDialog && (
          <DeleteDialog
            open={openDeleteDialog}
            title={`Delete article "${openDeleteDialog.title} ?"`}
            closeHandler={() => {
              this.setOpenDeleteDialog(null);
            }}
            deleteHandler={() => {
              this.removeArticle(openDeleteDialog);
            }}
          >
            <p variant="subtitle2">
              we will destroy any content and related data
            </p>
          </DeleteDialog>
        )}
      </div>
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

export default withRouter(connect(mapStateToProps)(Articles));
