import React, { Component } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { connect } from 'react-redux'


import Avatar from '@chaskiq/components/src/components/Avatar'
import Button from '@chaskiq/components/src/components/Button'
import {DropdownButton} from '@chaskiq/components/src/components/Button'
import Input from '@chaskiq/components/src/components/forms/Input'
import ContentHeader from '@chaskiq/components/src/components/PageHeader'
import FilterMenu from '@chaskiq/components/src/components/FilterMenu'
import Tabs from '@chaskiq/components/src/components/Tabs'
import { 
  GestureIcon, CheckCircle
} from '@chaskiq/components/src/components/icons'

import ArticleEditor from './editor'

import langs from '../../shared/langsOptions'
import I18n from '../../shared/FakeI18n'

import graphql from '@chaskiq/store/src/graphql/client'

import {
  setCurrentPage, setCurrentSection,
} from '@chaskiq/store/src/actions/navigation'

import {
  successMessage,
  errorMessage
} from '@chaskiq/store/src/actions/status_messages'

import {
  CREATE_ARTICLE,
  EDIT_ARTICLE,
  ARTICLE_BLOB_ATTACH,
  TOGGLE_ARTICLE,
  ARTICLE_ASSIGN_AUTHOR,
  ARTICLE_COLLECTION_CHANGE,
} from '@chaskiq/store/src/graphql/mutations'

import { ARTICLE, AGENTS, ARTICLE_COLLECTIONS } from '@chaskiq/store/src/graphql/queries'
class ArticlesNew extends Component {
  state = {
    currentContent: null,
    content: null,
    article: {},
    changed: false,
    loading: true,
    agents: [],
    collections: [],
    lang: 'en',
  }

  titleRef = null
  descriptionRef = null
  switch_ref = null

  options = [
    {
      name: I18n.t('articles.state.published'),
      description: I18n.t('articles.state.published_desc'),
      icon: <CheckCircle />,
      id: 'published',
      state: 'published',
    },
    {
      name: I18n.t('articles.state.draft'),
      description: I18n.t('articles.state.draft_desc'),
      icon: <GestureIcon />,
      id: 'draft',
      state: 'draft',
    },
  ]

  componentDidMount() {
    if (this.props.match.params.id !== 'new') {
      this.getArticle(this.props.match.params.id)
    } else {
      this.setState({
        loading: false,
      })
    }

    this.getAgents()
    this.getCollections()

    this.props.dispatch(setCurrentSection('HelpCenter'))

    this.props.dispatch(setCurrentPage('Articles'))
  }

  componentDidUpdate(prevProps, prevState) {
    // maybe do this ony with content and submit
    // checkbox and agent directly and independently from content
    if (prevState.content !== this.state.content) {
      this.registerChange()
    }
  }

  registerChange = () => {
    this.setState({
      changesAvailable: true,
    })
  }

  getCollections = () => {
    graphql(
      ARTICLE_COLLECTIONS,
      {
        appKey: this.props.app.key,
      },
      {
        success: (data) => {
          this.setState({
            collections: data.app.collections,
          })
        },
      }
    )
  }

  getArticle = (id) => {
    graphql(
      ARTICLE,
      {
        appKey: this.props.app.key,
        id: id,
        lang: this.state.lang,
      },
      {
        success: (data) => {
          this.setState({
            article: data.app.article,
            loading: false,
          })
        },
        error: () => {},
      }
    )
  }

  updateUrlFromNew = () => {
    this.props.history.push(
      `/apps/${this.props.app.key}/articles/${this.state.article.id}`
    )
  }

  getAgents = () => {
    graphql(
      AGENTS,
      {
        appKey: this.props.app.key,
      },
      {
        success: (data) => {
          this.setState({
            agents: data.app.agents,
          })
        },
        error: () => {},
      }
    )
  }

  createArticle = () => {
    graphql(
      CREATE_ARTICLE,
      {
        appKey: this.props.app.key,
        title: this.titleRef.value,
        content: this.state.content,
      },
      {
        success: (data) => {
          const article = data.createArticle.article
          this.setState(
            {
              article: article,
              changesAvailable: false,
            },
            () => {
              this.updateUrlFromNew()
              this.updatedMessage()
            }
          )
        },
        error: () => {
          this.errorMessage()
        },
      }
    )
  }

  editArticle = () => {
    graphql(
      EDIT_ARTICLE,
      {
        appKey: this.props.app.key,
        title: this.titleRef.value,
        description: this.descriptionRef.value,
        id: this.state.article.id,
        content: this.state.content,
        lang: this.state.lang,
      },
      {
        success: (data) => {
          const article = data.editArticle.article
          this.setState(
            {
              article: article,
              changesAvailable: false,
            },
            () => {
              this.updatedMessage()
            }
          )
        },
        error: (_e) => {
          this.errorMessage()
        },
      }
    )
  }

  updatedMessage = () => {
    this.props.dispatch(successMessage(I18n.t('articles.updated_success')))
  }

  errorMessage = () => {
    this.props.dispatch(errorMessage(I18n.t('articles.updated_error')))
  }

  submitChanges = () => {
    this.setState(
      {
        changesAvailable: false,
      },
      () => {
        if (this.state.article.id) {
          this.editArticle()
        } else {
          this.createArticle()
        }
      }
    )
  }

  toggleButton = (clickHandler) => {
    const stateColor =
      this.state.article.state === 'published' ? 'primary' : 'secondary'
    return (
      <div variant="outlined" color={stateColor}>
        <DropdownButton
          onClick={clickHandler}
          label={I18n.t(`articles.state.${this.state.article.state}`)}
          icon={
            this.state.article.state === 'published' ? (
              <CheckCircle />
            ) : (
              <GestureIcon />
            )
          }
        />
      </div>
    )
  }

  togglePublishState = (state) => {
    const val = state.state
    graphql(
      TOGGLE_ARTICLE,
      {
        appKey: this.props.app.key,
        id: this.state.article.id,
        state: val,
      },
      {
        success: (data) => {
          this.setState({ article: data.toggleArticle.article }, () => {
            this.updatedMessage()
          })
        },
        error: () => {
          this.errorMessage()
        },
      }
    )
  }

  handleAuthorchange = (input) => {
    graphql(
      ARTICLE_ASSIGN_AUTHOR,
      {
        appKey: this.props.app.key,
        authorId: input.value,
        id: this.state.article.id,
      },
      {
        success: (data) => {
          this.setState(
            {
              article: data.assignAuthor.article,
            },
            () => {
              this.updatedMessage()
            }
          )
        },
        error: () => {
          this.errorMessage()
        },
      }
    )
  }

  handleCollectionChange = (input) => {
    graphql(
      ARTICLE_COLLECTION_CHANGE,
      {
        appKey: this.props.app.key,
        collectionId: input.value,
        id: this.state.article.id,
      },
      {
        success: (data) => {
          this.setState(
            {
              article: data.changeCollectionArticle.article,
            },
            () => {
              this.updatedMessage()
            }
          )
        },
        error: () => {
          this.errorMessage()
        },
      }
    )
  }

  updateState = (data) => {
    this.setState(data)
  }

  uploadHandler = ({ serviceUrl, signedBlobId, imageBlock }) => {
    graphql(
      ARTICLE_BLOB_ATTACH,
      {
        appKey: this.props.app.key,
        id: parseInt(this.state.article.id),
        blobId: signedBlobId,
      },
      {
        success: (_data) => {
          imageBlock.uploadCompleted(serviceUrl)
        },
        error: (err) => {
          console.log('error on direct upload', err)
        },
      }
    )
  }

  handleLangChange = (lang) => {
    if (!lang) return
    if (!this.state.article.id) return
    this.setState(
      {
        lang: lang,
        loading: true,
      },
      () => this.getArticle(this.state.article.id)
    )
  }

  handleInputChange = (_e) => {
    this.registerChange()
  }

  articleCollection = () => {
    return this.state.article.collection ? this.state.article.collection : null
  }

  renderAside = () => {
    return (
      <div className="mt-6 border-t border-b border-gray-200 py-6 space-y-8 dark:border-gray-900">
        <div>
          {!this.state.loading &&
            this.state.article.id &&
            this.state.article.author && (
              <React.Fragment>
                <h2 className="text-sm font-medium text-gray-500">
                  {I18n.t('articles.author')}
                </h2>
                <ul className="mt-3 space-y-3">
                  <li className="flex justify-start">
                    <a href="#" className="flex items-center space-x-3">
                      <div className="flex flex-shrink-0 items-center">
                        <Avatar src={this.state.article.author.avatarUrl} />
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {this.state.article.author.name ||
                          this.state.article.author.email}
                      </div>
                    </a>
                  </li>
                </ul>
              </React.Fragment>
            )}

          {!this.state.loading && (
            <React.Fragment>
              {!this.state.loading && this.state.article.author && (
                <div className="flex">
                  {this.state.agents.length > 0 && (
                    <div className="flex items-center">
                      <Input
                        type={'select'}
                        className="w-32"
                        options={this.state.agents.map((o) => ({
                          label: o.name || o.email,
                          value: o.email,
                        }))}
                        data={{}}
                        name={'author'}
                        placeholder={'select author'}
                        onChange={this.handleAuthorchange}
                        defaultValue={{
                          label: this.state.article.author.email,
                          value: this.state.article.author.email,
                        }}
                      ></Input>
                    </div>
                  )}

                  <div className="flex items-center">
                    <strong className="m-2">In</strong>
                    <Input
                      type={'select'}
                      options={this.state.collections.map((o) => ({
                        label: o.title,
                        value: o.id,
                      }))}
                      data={{}}
                      className={'w-32'}
                      name={'collection'}
                      placeholder={'select collection'}
                      onChange={this.handleCollectionChange}
                      defaultValue={
                        this.articleCollection() && {
                          label: this.articleCollection().title,
                          value: this.articleCollection().id,
                        }
                      }
                    ></Input>
                  </div>
                </div>
              )}

              <Input
                id="article-title"
                type={'text'}
                // label="Name"
                placeholder={I18n.t('articles.create_article.placeholder')}
                // helperText="Full width!"
                ref={(ref) => {
                  this.titleRef = ref
                }}
                defaultValue={this.state.article.title}
                margin="normal"
                onChange={this.handleInputChange}
              />

              <Input
                id="article-description"
                type={'textarea'}
                // label="Description"
                placeholder={I18n.t(
                  'articles.create_article.description_placeholder'
                )}
                // helperText="Full width!"
                multiline
                ref={(ref) => {
                  this.descriptionRef = ref
                }}
                defaultValue={this.state.article.description}
                margin="normal"
                onChange={this.handleInputChange}
              />
            </React.Fragment>
          )}
        </div>
      </div>
    )
  }

  render() {
    const { app } = this.props

    return (
      <main className="flex-1 relative overflow-y-auto focus:outline-none">
        <ContentHeader
          // title={ 'Help Center Settings' }
          breadcrumbs={[
            {
              to: `/apps/${app.key}/articles`,
              title: I18n.t('articles.help_center'),
            },
            {
              to: '',
              title: this.state.article.title,
            },
          ]}
        />

        <div className="py-8 xl:py-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-5xl xl:grid xl:grid-cols-3">
            <div className="xl:col-span-2 xl:pr-8 xl:border-r xl:border-gray-200 xl:dark:border-gray-900">
              <div>
                <div>
                  <div className="md:flex md:items-center md:justify-between md:space-x-4 xl:border-b xl:pb-6 dark:border-gray-900">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {this.state.article.title}
                      </h1>
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                        {this.state.article.author && (
                          <span>
                            {I18n.t('articles.written_by')}{' '}
                            <Link
                              to={`/apps/${this.props.app.key}/agents/${this.state.article.author.id}`}
                              className="font-medium text-gray-900 dark:text-gray-100"
                            >
                              {this.state.article.author.name ||
                                this.state.article.author.email}
                            </Link>
                          </span>
                        )}

                        {this.articleCollection() && (
                          <span>
                            in{' '}
                            <a
                              href="#"
                              className="font-medium text-gray-900 dark:text-gray-100"
                            >
                              {this.articleCollection().title}
                            </a>
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="mt-4 flex space-x-3 md:mt-0">
                      {!this.state.loading && (
                        <React.Fragment>
                          <Button
                            variant="success"
                            onClick={this.submitChanges}
                            disabled={!this.state.changesAvailable}
                            color={'primary'}
                          >
                            {I18n.t('common.save')}
                          </Button>

                          <FilterMenu
                            options={this.options}
                            value={this.state.article.state}
                            filterHandler={this.togglePublishState}
                            triggerButton={this.toggleButton}
                            position={'right'}
                          />
                        </React.Fragment>
                      )}
                    </div>
                  </div>
                  <aside className="mt-8 xl:hidden">
                    <h2 className="sr-only">Details</h2>
                    {this.renderAside()}
                  </aside>
                  <div className="py-3 xl:pt-6 xl:pb-0">
                    <h2 className="sr-only">Description</h2>
                    <div className="prose max-w-none">
                      <div>
                        <div>
                          <Tabs
                            scrollButtons="on"
                            // tabs={this.props.settings.availableLanguages}
                            tabs={this.props.settings.availableLanguages.map(
                              (o) => langs.find((lang) => lang.value === o)
                            )}
                            onChange={(index) => {
                              this.handleLangChange(
                                this.props.settings.availableLanguages[index]
                              )
                            }}
                          />
                        </div>

                        <div className="relative z-0 p-6 shadow rounded border  bg-yellow-50 dark:border-pink-800 dark:bg-gray-800 border-yellow-100 mb-4 my-4">
                          {!this.state.loading && (
                            <ArticleEditor
                              article={this.state.article}
                              data={this.props.data}
                              app={this.props.app}
                              updateState={this.updateState}
                              loading={false}
                              uploadHandler={this.uploadHandler}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <aside className="hidden xl:block xl:pl-8">
              <h2 className="sr-only">Details</h2>

              <div className="space-y-5">
                {this.state.article.state && (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="h-5 w-5 text-green-500"
                      x-description="Heroicon name: solid/lock-open"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                    </svg>
                    <span className="text-green-700 text-sm font-medium">
                      {this.state.article.state && 'published'}
                    </span>
                  </div>
                )}

                {this.state.article.createdAt && (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      x-description="Heroicon name: solid/calendar"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-900 text-sm font-medium">
                      {I18n.t('articles.created_on')}{' '}
                      <time dateTime="2020-12-02">
                        {this.state.article.createdAt}
                      </time>
                    </span>
                  </div>
                )}
              </div>
              {this.renderAside()}
            </aside>
          </div>
        </div>
      </main>
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

export default withRouter(connect(mapStateToProps)(ArticlesNew))
