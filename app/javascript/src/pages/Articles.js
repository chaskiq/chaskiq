import React, { Component } from 'react'

import { withRouter, Route, Switch, Link } from 'react-router-dom'
import { connect } from 'react-redux'

import langs from '../shared/langsOptions'
import isEmpty from 'lodash/isEmpty'

import graphql from '@chaskiq/store/src/graphql/client'

import ArticlesNew from './articles/new'
import Settings from './articles/settings'

import Collections from './articles/collections/index'
import CollectionDetail from './articles/collections/show'

import {
  errorMessage, successMessage
} from '@chaskiq/store/src/actions/status_messages'

import {
  setCurrentSection, setCurrentPage
} from '@chaskiq/store/src/actions/navigation'

import {AnchorLink} from '@chaskiq/components/src/components/RouterLink'
import Hints from '@chaskiq/components/src/components/Hints'
import DataTable from '@chaskiq/components/src/components/Table'
import Badge from '@chaskiq/components/src/components/Badge'
import Content from '@chaskiq/components/src/components/Content'
import ContentHeader from '@chaskiq/components/src/components/PageHeader'
import Tabs from '@chaskiq/components/src/components/Tabs'
import Button from '@chaskiq/components/src/components/Button'
import CircularProgress from '@chaskiq/components/src/components/Progress'
import DeleteDialog from '@chaskiq/components/src/components/DeleteDialog'
import ScrollableTabsButtonForce from '@chaskiq/components/src/components/scrollingTabs'
import {
  AddIcon, GestureIcon, CheckCircleIcon
} from '@chaskiq/components/src/components/icons'


import { ARTICLES, ARTICLE_SETTINGS } from '@chaskiq/store/src/graphql/queries'
import {
  DELETE_ARTICLE,
  ARTICLE_SETTINGS_UPDATE,
  ARTICLE_SETTINGS_DELETE_LANG,
} from '@chaskiq/store/src/graphql/mutations'
class Articles extends Component {
  state = {
    meta: {},
    tabValue: 0,
    settings: null,
    errors: [],
  }

  componentDidMount() {
    this.props.dispatch(setCurrentSection('HelpCenter'))
    this.getSettings()
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
          )
        },
        error: () => {},
      }
    )
  }

  updateSettings = (data) => {
    const { settings } = data
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
              if (!isEmpty(data.articleSettingsUpdate.errors)) {
                return this.props.dispatch(
                  errorMessage(I18n.t('articles.settings_updated_error'))
                )
              }
              this.props.dispatch(
                successMessage(I18n.t('articles.settings_updated_success'))
              )
            }
          )
        },
        error: () => {
          errorMessage(I18n.t('articles.settings_updated_error'))
        },
      }
    )
  }

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
              cb && cb()
              this.props.dispatch(
                successMessage(I18n.t('articles.settings_updated_success'))
              )
            }
          )
        },
        error: () => {
          errorMessage(I18n.t('articles.settings_updated_error'))
        },
      }
    )
  }

  handleTabChange = (e, i) => {
    this.setState({ tabValue: i })
  }

  tabsContent = () => {
    return (
      <div>
        <Hints type={'articles'} />
        <Tabs
          value={this.state.tabValue}
          onChange={this.handleTabChange}
          textColor="inherit"
          tabs={[
            {
              label: I18n.t('articles.all'),
              content: (
                <div>
                  <AllArticles
                    {...this.props}
                    settings={this.state.settings}
                    mode={'all'}
                  />
                </div>
              ),
            },
            {
              label: I18n.t('articles.published'),
              content: (
                <AllArticles
                  {...this.props}
                  settings={this.state.settings}
                  mode={'published'}
                />
              ),
            },
            {
              label: I18n.t('articles.draft'),
              content: (
                <AllArticles
                  {...this.props}
                  settings={this.state.settings}
                  mode={'draft'}
                />
              ),
            },
          ]}
        />
      </div>
    )
  }

  render() {
    return (
      <Content>
        {this.state.settings ? (
          <Switch>
            <Route
              exact
              path={`/apps/${this.props.app.key}/articles`}
              render={(_props) => {
                return (
                  <React.Fragment>
                    <ContentHeader
                      title={I18n.t('articles.title')}
                      // tabsContent={ this.tabsContent() }
                      actions={
                        <React.Fragment>
                          {this.state.settings &&
                          this.state.settings.subdomain ? (
                            <div item>
                              <Button
                                href={`https://${this.state.settings.subdomain}.chaskiq.io`}
                                variant="outlined"
                                color="inherit"
                                target={'blank'}
                                className="mr-2"
                              >
                                {I18n.t('articles.visit')}
                              </Button>
                            </div>
                          ) : null}

                          <Button
                            variant={'contained'}
                            color={'primary'}
                            onClick={() =>
                              this.props.history.push(
                                `/apps/${this.props.app.key}/articles/new`
                              )
                            }
                          >
                            {/* <AddIcon /> */}
                            {I18n.t('articles.new')}
                          </Button>
                        </React.Fragment>
                      }
                    />
                    {this.state.settings && this.tabsContent()}
                  </React.Fragment>
                )
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
                )
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
                )
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
                )
              }}
            />

            <Route
              exact
              path={`/apps/${this.props.app.key}/articles/:id`}
              render={(_props) => {
                return (
                  <ArticlesNew
                    settings={this.state.settings}
                    getSettings={this.getSettings}
                    history={this.props.history}
                    data={{}}
                  />
                )
              }}
            />
          </Switch>
        ) : null}
      </Content>
    )
  }
}

class AllArticles extends React.Component {
  state = {
    collection: [],
    loading: true,
    lang: 'en',
    openDeleteDialog: false,
  }

  componentDidMount() {
    this.search()

    this.props.dispatch(setCurrentSection('HelpCenter'))

    this.props.dispatch(setCurrentPage('Articles'))
  }

  componentDidUpdate(prevProps) {
    if (prevProps.mode != this.props.mode) {
      this.search()
    }
  }

  getArticles = () => {
    graphql(
      ARTICLES,
      {
        appKey: this.props.app.key,
        page:
          this.state.meta && this.state.meta.next_page
            ? this.state.meta.next_page
            : 1,
        lang: this.state.lang,
        mode: this.props.mode,
      },
      {
        success: (data) => {
          this.setState({
            collection: data.app.articles.collection,
            meta: data.app.articles.meta,
            loading: false,
          })
        },
        error: () => {},
      }
    )
  }

  handleLangChange = (lang) => {
    this.setState(
      {
        lang: lang,
      },
      this.getArticles
    )
  }

  search = () => {
    this.setState(
      {
        loading: true,
      },
      this.getArticles
    )
  }

  renderActions = () => {
    return (
      <div container direction="row" justify="flex-end">
        <div item>
          <AnchorLink
            variant={'contained'}
            color={'primary'}
            onClick={() =>
              this.props.history.push(
                `/apps/${this.props.app.key}/articles/new`
              )
            }
          >
            <AddIcon />
            {I18n.t('articles.new_article')}
          </AnchorLink>
        </div>
      </div>
    )
  }

  setOpenDeleteDialog = (val) => {
    this.setState({ openDeleteDialog: val })
  }

  removeArticle = (row) => {
    graphql(
      DELETE_ARTICLE,
      {
        appKey: this.props.app.key,
        id: row.id.toString(),
      },
      {
        success: () => {
          this.setState(
            {
              collection: this.state.collection.filter((o) => o.id != row.id),
            },
            () => {
              this.setOpenDeleteDialog(null)
              this.props.dispatch(
                successMessage(I18n.t('articles.deleted_success'))
              )
            }
          )
        },
        error: () => {},
      }
    )
  }

  render() {
    const { openDeleteDialog } = this.state

    return (
      <div>
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
                // {field: "id", title: I18n.t("definitions.articles.id.label")},
                {
                  field: 'title',
                  title: I18n.t('definitions.articles.title.label'),
                  render: (row) =>
                    row ? (
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-50">
                        <div className="flex items-center text-lg font-bold">
                          {row.id && (
                            <Link
                              className="truncate w-64"
                              to={`/apps/${this.props.app.key}/articles/${row.slug}`}
                            >
                              {row.title
                                ? row.title
                                : '-- missing translation --'}
                            </Link>
                          )}
                        </div>
                      </td>
                    ) : undefined,
                },
                {
                  field: 'author',
                  title: I18n.t('definitions.articles.author.label'),
                  render: (row) =>
                    row ? (
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-50">
                        <div className="flex items-center">
                          <span>
                            <b className="font-bold">{row.author.name}</b>
                            <br />
                            {row.author.email}
                          </span>
                        </div>
                      </td>
                    ) : undefined,
                },
                {
                  field: 'state',
                  title: I18n.t('definitions.articles.state.label'),
                  render: (row) =>
                    row && (
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-50">
                        <div className="flex items-center">
                          <Badge
                            variant={row.state === 'draft' ? 'yellow' : 'green'}
                          >
                            {row.state === 'draft' ? (
                              <GestureIcon />
                            ) : (
                              <CheckCircleIcon />
                            )}{' '}
                            {I18n.t(`articles.state.${row.state}`)}
                          </Badge>
                        </div>
                      </td>
                    ),
                },
                {
                  field: 'collection',
                  title: I18n.t('definitions.articles.collection.label'),
                  render: (row) =>
                    row && (
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-50">
                        <div className="flex items-center">
                          {row.collection && (
                            <Link
                              to={`/apps/${this.props.app.key}/articles/collections/${row.collection.id}`}
                            >
                              {row.collection.title}
                            </Link>
                          )}
                        </div>
                      </td>
                    ),
                },
                {
                  field: 'actions',
                  title: I18n.t('definitions.articles.actions.label'),
                  render: (row) =>
                    row && (
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-50">
                        <div className="flex items-center">
                          <Button
                            variant={'danger'}
                            onClick={() => {
                              this.setOpenDeleteDialog(row)
                            }}
                          >
                            {I18n.t('common.delete')}
                          </Button>
                        </div>
                      </td>
                    ),
                },
              ]}
              defaultHiddenColumnNames={[]}
              tableColumnExtensions={[
                { columnName: 'title', width: 250 },
                { columnName: 'id', width: 10 },
              ]}
              // tableEdit={true}
              // editingRowIds={["email", "name"]}
              commitChanges={(_aa, _bb) => {}}
              // leftColumns={this.props.leftColumns}
              // rightColumns={this.props.rightColumns}
              // toggleMapView={this.props.toggleMapView}
              // map_view={this.props.map_view}
              enableMapView={false}
            />
          ) : (
            <div className="py-6 h-full flex justify-center items-center">
              <CircularProgress />
            </div>
          )}
        </div>

        {openDeleteDialog && (
          <DeleteDialog
            open={openDeleteDialog}
            title={I18n.t('articles.delete_article', {
              title: openDeleteDialog.title,
            })}
            closeHandler={() => {
              this.setOpenDeleteDialog(null)
            }}
            deleteHandler={() => {
              this.removeArticle(openDeleteDialog)
            }}
          >
            <p variant="subtitle2">{I18n.t('articles.delete_article_exp')}</p>
          </DeleteDialog>
        )}
      </div>
    )
  }
}

function mapStateToProps(state) {
  const { auth, app } = state
  const { isAuthenticated } = auth
  // const { sort, filter, collection , meta, loading} = conversations

  return {
    app,
    isAuthenticated,
  }
}

export default withRouter(connect(mapStateToProps)(Articles))
