
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import UserData from '../components/UserData'
import styled from '@emotion/styled'
import { isEmpty } from 'lodash'

import graphql from '../graphql/client'
import Mapa from '../components/map'
import DialogEditor from '../components/DialogEditor'
import {
  APP_USER_CONVERSATIONS,
  APP_USER_VISITS
} from '../graphql/queries'

import {
  START_CONVERSATION,
  APP_USER_UPDATE_STATE,
  APP_USER_UPDATE
} from '../graphql/mutations'

import Button from '../components/Button'
import Avatar from '../components/Avatar'

import {
  getAppUser
} from '../actions/app_user'


import sanitizeHtml from 'sanitize-html'
import DataTable from '../components/Table'
import FilterMenu from '../components/FilterMenu'

import {
  EditIcon, ArchiveIcon,
  BlockIcon,
  UnsubscribeIcon,
  MoreIcon
} from '../components/icons'
import CircularProgress from '../components/Progress'
import TextField from '../components/forms/Input'

import { setCurrentSection } from '../actions/navigation'

const AppUserHeaderOverlay = styled.div`
  position: absolute;
  z-index: 99;
  color: #fff;
  width: 100%;
  height: 185px;
  //background: linear-gradient(to bottom,rgba(250,250,250,0) 40%,#f6f6f6 100%);
`

class ProfilePage extends Component {
  state = {
    collection: [],
    meta: {},
    startConversationModal: false,
    editName: false,
    editEmail: false,
    tab: 0
  }

  componentDidMount () {
    this.props.dispatch(
      setCurrentSection('Platform')
    )

    this.getUser(this.fetchUserConversations)
  }

  getUser = (cb) => {
    this.props.dispatch(
      getAppUser(
        parseInt(this.props.match.params.id)
        , cb && cb())
    )
  }

  fetchUserConversations = () => {
    graphql(APP_USER_CONVERSATIONS, {
      appKey: this.props.app.key,
      id: parseInt(this.props.match.params.id),
      page: 1,
      per: 20
    }, {
      success: (data) => {
        const { collection } = data.app.appUser.conversations
        this.setState({ collection: collection })
      },
      error: () => {

      }
    })
  }

  openStartConversationModal = () => {
    this.setState({ startConversationModal: true })
  }

  handleDialogClose = () => {
    this.setState({ startConversationModal: false })
  }

  handleSubmit = ({ html, serialized, text }) => {
    graphql(START_CONVERSATION, {
      appKey: this.props.app.key,
      id: this.props.app_user.id,
      message: { html, serialized, text }
    }, {
      success: (data) => {
        const { conversation } = data.startConversation
        const url = `/apps/${this.props.app.key}/conversations/${conversation.key}`
        this.props.history.push(url)
      },
      errors: (_error) => {
      }
    })
  }

  updateState = (option) => {
    graphql(APP_USER_UPDATE_STATE, {
      appKey: this.props.app.key,
      id: this.props.app_user.id,
      state: option
    }, {
      success: (_data) => {
        this.props.dispatch(
          getAppUser(
            parseInt(this.props.app_user.id)
          )
        )

        // data.appUserUpdateData.appUser
      },
      error: (_error) => {
      }
    })
  }

  handleEnter = (e, attrName) => {
    const attribute = {}
    attribute[attrName] = e.target.value

    if (e.key === 'Enter') {
      graphql(APP_USER_UPDATE, {
        appKey: this.props.app.key,
        id: this.props.app_user.id,
        options: attribute
      }, {
        success: (_data) => {
          this.setState({ editName: null })
          this.setState({ editEmail: null })
          this.getUser()
        },
        error: () => {

        }
      })
    }
  }

  toggleNameEdit = () => {
    this.setState({ editName: !this.state.editName })
  }

  toggleEmailEdit = () => {
    this.setState({ editEmail: !this.state.editEmail })
  }

  optionsForFilter = () => {
    return [
      {
        title: 'Archive',
        description: 'Archive this person and their conversation history',
        icon: <ArchiveIcon/>,
        id: 'archive',
        state: 'archived'
      },
      {
        title: 'Block',
        description: 'Blocks them so you won’t get their replies',
        icon: <BlockIcon/>,
        id: 'block',
        state: 'blocked'
      },
      {
        title: 'Unsubscribe',
        description: 'Removes them from your email list',
        icon: <UnsubscribeIcon/>,
        id: 'unsubscribe',
        state: 'unsubscribed'
      }
    ]
  }

  toggleButton = (clickHandler) => {
    return (
      <div>
        <button
          onClick={clickHandler}
          className="text-xs leading-4 font-medium text-gray-600
        group-hover:text-gray-800 group-focus:underline transition
        ease-in-out duration-150">
          <MoreIcon/>
        </button>
      </div>
    )
  }

  setTab = (val) => {
    this.setState({ tab: val })
  }

  render () {
    if (!this.props.app_user) {
      return <div className="flex p-2 justify-center">
        <CircularProgress/>
      </div>
    }

    return (
      <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none xl:order-last" tabIndex={0}>
        {/* Breadcrumb */}
        <nav className="flex items-start px-4 py-3 sm:px-6 lg:px-8 xl:hidden" aria-label="Breadcrumb">
          <a href="#" className="inline-flex items-center space-x-3 text-sm font-medium text-gray-900">
            <svg className="-ml-2 h-5 w-5 text-gray-400" x-description="Heroicon name: solid/chevron-left" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Directory</span>
          </a>
        </nav>
        <article>
          {/* Profile header */}
          <div>
            <div>

              <div className="h-32 w-full object-cover lg:h-48">
                <Mapa
                  interactive={true}
                  data={[this.props.app_user]}
                  forceZoom={10}
                  wrapperStyle={{
                    position: 'relative',
                    width: '100%',
                    height: '184px',
                    marginTop: '0px'
                  }}>
                  <AppUserHeaderOverlay/>
                </Mapa>
              </div>
            </div>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
                <div className="flex">

                  <Avatar size={24}
                    classes={'h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32'}
                    src={this.props.app_user.avatarUrl + '&s=120px'}
                  />
                  <img className="hidden h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32" src="https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=1024&h=1024&q=80" alt="" />
                </div>
                <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                  <div className="sm:hidden 2xl:block mt-6 min-w-0 flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 truncate">
                      {this.props.app_user.displayName}
                    </h1>
                  </div>
                  <div className="items-center mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">

                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={this.openStartConversationModal}>
                      <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" x-description="Heroicon name: solid/mail" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      {I18n.t('conversations.start_conversation')}
                    </Button>

                    <FilterMenu
                      options={this.optionsForFilter()}
                      value={this.props.app_user.state}
                      filterHandler={(e) => this.updateState(e.state)}
                      triggerButton={this.toggleButton}
                      position={'right'}
                    />

                    {/* <button type="button" className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" x-description="Heroicon name: solid/phone" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span>Call</span>
              </button> */}
                  </div>
                </div>
              </div>
              <div className="hidden sm:block 2xl:hidden mt-6 min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 truncate flex-inline flex items-center">
                  {
                    this.props.app_user && this.state.editName
                      ? <TextField
                        type={'text'}
                        // className={classes.input}
                        onKeyUp={(e) => this.handleEnter(e, 'name')}
                        defaultValue={this.props.app_user.name}
                        placeholder="enter user's name"
                      /> : this.props.app_user.name
                  }

                  <Button variant={'icon'}
                    onClick={this.toggleNameEdit} color={'inherit'}>
                    <EditIcon/>
                  </Button>

                </h1>

                <h6 className="w-1/3 font-bold leading-7 text-gray-500 sm:text-1xl sm:leading-9 sm:truncate flex items-center">
                  {
                    this.props.app_user && this.state.editEmail
                      ? <TextField
                        type={'text'}
                        onKeyUp={(e) => this.handleEnter(e, 'email')}
                        defaultValue={this.props.app_user.email}
                        placeholder="enter user's email"
                      /> : this.props.app_user.email
                  }

                  <Button
                    variant={'icon'}
                    onClick={this.toggleEmailEdit} color={'inherit'}>
                    <EditIcon/>
                  </Button>

                </h6>

              </div>
            </div>
          </div>

          {
            this.state.startConversationModal &&
            <DialogEditor
              handleSubmit={this.handleSubmit}
              close={this.handleDialogClose}
              open={this.state.startConversationModal}
            />
          }

          {/* Tabs */}
          <div className="mt-6 sm:mt-2 2xl:mt-5">
            <div className="border-b border-gray-200">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  {/* Current: "border-pink-500 text-indigo-600", Default: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300" */}
                  <a href="#" onClick={(_e) => this.setTab(0) } className="border-pink-500 text-gray-900 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm" aria-current="page">
                  Profile
                  </a>
                  <a href="#" onClick={(_e) => this.setTab(1) } className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                  Conversations
                  </a>
                  <a href="#" onClick={(_e) => this.setTab(2) } className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                  Visits
                  </a>
                </nav>
              </div>
            </div>
          </div>

          <div className="mt-8 max-w-5xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">

            {
              this.state.tab === 0 &&
            <div>

              <div className="-flex -flex-col -md:flex-row">

                <div className="w-full -sm:w-1/4">
                  {
                    !isEmpty(this.props.app_user)
                      ? <UserData
                        disableAvatar={true}
                        width={'100%'}
                        hideConactInformation={true}
                        appUser={this.props.app_user}
                        app={this.props.app}
                      /> : null
                  }
                </div>
              </div>
            </div>
            }

            {
              this.state.tab === 2 &&
              <div className="w-full">
                {
                  this.props.app_user.id
                    ? <AppUserVisits {...this.props}/> : null
                }
              </div>
            }

            {
              this.state.tab === 1 &&
              <div>
                <p className="text-2xl font-bold leading-6 text-gray-900 sm:text-2xl sm:leading-9 sm:truncate">
                  {I18n.t('conversations.title')}
                </p>

                <div className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2">

                  { this.state.collection.filter((o) => o.lastMessage).map(
                    (o) => (
                      <div
                        key={`user-list-${o.key}`}
                        onClick={(_e) => this.props.history.push(`/apps/${this.props.app.key}/conversations/${o.key}`) }
                        className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500">
                        <div className="flex-shrink-0">
                          <img className="h-10 w-10 rounded-full"
                            src={o.mainParticipant.avatarUrl} alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <a href="#" className="focus:outline-none">
                            <span className="absolute inset-0" aria-hidden="true" />
                            <p className="text-sm font-medium text-gray-900">
                              {o.mainParticipant.email}
                            </p>
                            <div className="text-sm text-gray-500 truncate"
                              dangerouslySetInnerHTML={
                                { __html: sanitizeHtml(o.lastMessage.message.htmlContent).substring(0, 250) }
                              }/>
                          </a>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            }

          </div>

        </article>
      </main>
    )
  }
}

class AppUserVisits extends React.Component {
  state = {
    collection: [],
    meta: {},
    loading: false
  }

  componentDidMount () {
    this.fetchvisits()
  }

  fetchvisits = (page = null) => {
    this.setState({ loading: true }, () => {
      graphql(APP_USER_VISITS, {
        appKey: this.props.app.key,
        id: this.props.app_user.id,
        page: page || this.state.meta.next_page || 1,
        per: 20
      }, {
        success: (data) => {
          this.setState({
            collection: data.app.appUser.visits.collection,
            meta: data.app.appUser.visits.meta,
            loading: false
          })
        },
        error: () => {
          this.setState({
            loading: true
          })
        }
      })
    })
  }

  render () {
    return <div>

      <DataTable
        title={'visits'}
        data={this.state.collection}
        columns={[
          { field: 'url', title: 'url' },
          { field: 'title', title: 'title' },
          { field: 'browserName', title: 'browser name' },
          { field: 'browserVersion', title: 'browser version' },
          { field: 'os', title: 'os' },
          { field: 'osVersion', title: 'os version' },
          { field: 'createdAt', title: 'created at' }
        ]}
        meta={this.state.meta}
        search={(page) => this.fetchvisits(page)}
      />

    </div>
  }
}

function mapStateToProps (state) {
  const { app_user, app } = state
  return {
    app_user,
    app
  }
}

// export default ShowAppContainer

export default withRouter(connect(mapStateToProps)(ProfilePage))
