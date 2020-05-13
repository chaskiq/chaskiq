import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import UserData from '../components/UserData'
import styled from '@emotion/styled'
import {isEmpty} from 'lodash'
import Badge from '../components/Badge'
import graphql from '../graphql/client'
import Mapa from '../components/map'
import DialogEditor from '../components/DialogEditor'
import {
  APP_USER_CONVERSATIONS, 
  APP_USER_VISITS,
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

import UserListItem from '../components/conversations/ItemList'
import sanitizeHtml from 'sanitize-html';
import DataTable from '../components/Table'
import FilterMenu from '../components/FilterMenu'

import { EditIcon, ArchiveIcon,
  BlockIcon,
  UnsubscribeIcon,
  MoreIcon
} from '../components/icons'
import CircularProgress from '../components/Progress'
import TextField from '../components/forms/Input'

import {setCurrentSection, setCurrentPage} from '../actions/navigation'

const AppUserHeaderOverlay = styled.div`
  position: absolute;
  z-index: 99;
  color: #fff;
  width: 100%;
  height: 185px;
  background: #000000c7;
  //background: linear-gradient(to bottom,rgba(250,250,250,0) 40%,#f6f6f6 100%);
`



class ProfilePage extends Component {

  state = {
    collection: [],
    meta: {},
    startConversationModal: false,
    editName: false,
    editEmail: false
  }

  componentDidMount(){

    this.props.dispatch(
      setCurrentSection("Platform")
    )

    this.getUser( this.fetchUserConversations )
  }

  getUser = (cb)=>{
    this.props.dispatch(
      getAppUser(
        parseInt(this.props.match.params.id)
      , cb && cb() )
    )
  }

  fetchUserConversations = ()=>{
    graphql(APP_USER_CONVERSATIONS, {
      appKey: this.props.app.key,
      id: parseInt(this.props.match.params.id),
      page: 1,
      per: 20
    }, {
      success: (data)=>{
        const {collection} = data.app.appUser.conversations
        this.setState({collection: collection })
      },
      error: ()=>{

      }
    })
  }

  openStartConversationModal = ()=>{
    this.setState({startConversationModal: true})
  }

  handleDialogClose = ()=>{
    this.setState({startConversationModal: false})
  }

  handleSubmit = ({html, serialized, text})=> {

    graphql(START_CONVERSATION, {
      appKey: this.props.app.key, 
      id: this.props.app_user.id,
      message: {html, serialized, text}
    }, {
      success: (data)=>{
        const {conversation} = data.startConversation
        const url = `/apps/${this.props.app.key}/conversations/${conversation.key}`
        this.props.history.push(url)
      },
      errors: (error)=>{
        debugger
      }
    })
  }

  updateState = (option)=>{

    graphql(APP_USER_UPDATE_STATE, {
      appKey: this.props.app.key, 
      id: this.props.app_user.id,
      state: option.id
    }, {
      success: (data)=>{

        this.props.dispatch(
          getAppUser(
            parseInt(this.props.app_user.id)
          )
        )

        //data.appUserUpdateData.appUser
      },
      error: (error)=>{
        debugger
      }
    })

  }

  handleEnter = (e, attrName)=>{
    let attribute = {}
    attribute[attrName] = e.target.value

    if(e.key === "Enter"){
      graphql(APP_USER_UPDATE, {
        appKey: this.props.app.key, 
        id: this.props.app_user.id,
        options: attribute
      }, {
        success: (data)=>{
          this.setState({editName: null})
          this.setState({editEmail: null})
          this.getUser()
        },
        error: ()=>{

        }
      })
    }
  }

  toggleNameEdit = ()=>{
    this.setState({editName: !this.state.editName})
  }

  toggleEmailEdit = ()=>{
    this.setState({editEmail: !this.state.editEmail})
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
        className="text-xs leading-4 font-medium text-gray-100 
        group-hover:text-gray-300 group-focus:underline transition 
        ease-in-out duration-150">
          <MoreIcon/>
        </button>
      </div>
    );
  }

  render() {
    if(!this.props.app_user)
      return <div className="flex p-2 justify-center">
              <CircularProgress/>
            </div>
    
    return (

      <div>

        <div className="relative h-48">

          <div className="flex p-4 absolute w-full 
          z-20 top-0 bottom-0">

            <Avatar size={20}
              classes={'mr-3'}
              src={this.props.app_user.avatarUrl + "&s=120px"}
            />

            <div className="flex flex-col w-full pl-3">
              <h5 className="text-2xl font-bold leading-7 text-white sm:text-3xl sm:leading-9 sm:truncate">

                {
                  this.props.app_user && this.state.editName ?
                  <TextField
                    type={'text'}
                    //className={classes.input}
                    onKeyUp={(e)=>this.handleEnter(e, "name")}
                    defaultValue={this.props.app_user.name}
                    placeholder="enter user's name"
                    inputProps={{ 'aria-label': 'enter user\'s name' }}
                  /> : this.props.app_user.name
                }

                <Button variant={'icon'} 
                  onClick={this.toggleNameEdit} color={"inherit"}>
                  <EditIcon/>
                </Button>
              </h5>

              <h6 className="font-bold leading-7 text-gray-100 sm:text-1xl sm:leading-9 sm:truncate">
                {
                  this.props.app_user && this.state.editEmail ?
                  <TextField
                    type={'text'}
                    //className={classes.input}
                    onKeyUp={(e)=>this.handleEnter(e, "email")}
                    defaultValue={this.props.app_user.name}
                    placeholder="enter user's email"
                    inputProps={{ 'aria-label': 'user agent\'s email' }}
                  /> : this.props.app_user.email
                }

                <Button 
                  variant={'icon'}
                  onClick={this.toggleEmailEdit} color={"inherit"}>
                  <EditIcon/>
                </Button>

              </h6>

              <div className="flex items-center justify-between">

                <div className="flex flex-col text-gray-200">
                  <p variant={"subtitle1"}>
                    {this.props.app_user.city}
                    {" "}
                    {this.props.app_user.country}
                  </p>

                  <p variant={"caption"}>
                    <Badge> {this.props.app_user.state} </Badge>
                  </p>

                </div>

                <div className="flex justify-end items-center">

                  <Button 
                    variant="contained" 
                    color="secondary"
                    onClick={this.openStartConversationModal}>
                    start conversation
                  </Button>

                  <FilterMenu
                    options={this.optionsForFilter()}
                    value={this.props.app_user.state}
                    filterHandler={(e) => this.updateState(e.state)}
                    triggerButton={this.toggleButton}
                    position={"right"}
                  />
  
                </div>

              </div>
            </div>
          </div>

          <div className="absolute w-full z-10 top-0 bottom-0">
            <Mapa 
              interactive={true} 
              data={[this.props.app_user]} 
              forceZoom={10}
              wrapperStyle={{
                position: 'relative',
                width: '100%',
                height: '184px',
                marginTop: '0px',
              }}>
              <AppUserHeaderOverlay/>
            </Mapa>
          </div>

        </div>

        <div className="flex flex-col md:flex-row">

          <div className="w-full md:w-3/4 p-3 shadow rounded m-4">
            <p className="text-2xl font-bold leading-6 text-gray-900 sm:text-2xl sm:leading-9 sm:truncate">
              conversations
            </p>
            {
              this.state.collection.filter((o)=> o.lastMessage ).map((o)=>{
                const user = o.mainParticipant
                
                return <div 
                          key={`user-list-${o.key}`} 
                          onClick={(e)=> this.props.history.push(`/apps/${this.props.app.key}/conversations/${o.key}`) }>
                                  
                          <UserListItem
                            app={this.props.app}
                            value={null}
                            mainUser={user}
                            object={o.key}
                            messageUser={o.lastMessage.appUser}
                            showUserDrawer={this.showUserDrawer}
                            messageObject={o.lastMessage}
                            conversation={o}
                            //createdAt={o.lastMessage.message.created_at}
                            message={sanitizeHtml(o.lastMessage.message.htmlContent).substring(0, 250)}
                          />
                        </div>
              
              })
            }
          </div>

          <div className="w-full sm:w-1/4">
            { 
              !isEmpty(this.props.app_user) ? 
              <UserData
                disableAvatar={true} 
                width={"100%"}
                hideConactInformation={true}
                appUser={this.props.app_user} 
                app={this.props.app}
              /> : null
            }
          </div>

        </div>


        <div className="w-full">
          {
            this.props.app_user.id ?
            <AppUserVisits {...this.props}/> : null
          }
        </div>

        {
          this.state.startConversationModal &&
            <DialogEditor 
              handleSubmit={this.handleSubmit}
              close={this.handleDialogClose}
              open={this.state.startConversationModal}
            /> 
        }

      </div>
    );
  }
}

class AppUserVisits extends React.Component {

  state = {
    collection: [],
    meta: {},
    loading: false
  }
  componentDidMount(){
    this.fetchvisits()
  }

  fetchvisits = (page=null)=>{
    this.setState({loading: true}, ()=>{
      graphql(APP_USER_VISITS, {
        appKey: this.props.app.key,
        id: this.props.app_user.id,
        page: page || this.state.meta.next_page || 1,
        per: 20
      }, {
        success: (data)=>{
          this.setState({
            collection: data.app.appUser.visits.collection,
            meta: data.app.appUser.visits.meta,
            loading: false
          })
        }, 
        error: ()=>{
          this.setState({
            loading: true
          })
        }
      })
    })
  }




  render(){
    return <div>
      
      <DataTable 
        title={"visits"}
        data={this.state.collection}
        columns={[
          {field: "url", title: "url"},
          {field: "title", title: "title"},
          {field: "browserName", title: "browser name"},
          {field: "browserVersion", title: "browser version"},
          {field: "os", title: "os"},
          {field: "osVersion", title: "os version"},
          {field: "createdAt", title: "created at"}
        ]}
        meta={this.state.meta}
        search={(page)=>this.fetchvisits(page)}
      />

    </div>
  }
}



function mapStateToProps(state) {
  const { app_user, app } = state
  return {
    app_user,
    app
  }
}

//export default ShowAppContainer

export default withRouter(connect(mapStateToProps)(ProfilePage))
