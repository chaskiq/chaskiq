import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import UserData from '../components/UserData'
import styled from '@emotion/styled'
import {isEmpty} from 'lodash'

import {
  CREATE_DIRECT_UPLOAD,
} from '../graphql/mutations'
import {getFileMetadata, directUpload} from '../shared/fileUploader'


import graphql from '../graphql/client'
import {
  APP_USER_CONVERSATIONS, 
  AGENT
} from '../graphql/queries'

import {
  START_CONVERSATION,
  APP_USER_UPDATE_STATE,
  UPDATE_AGENT
} from '../graphql/mutations'


import Button from '../components/Button' 
import Avatar from '../components/Avatar'
import TextField from '../components/forms/Input'

import {
  getAppUser
} from '../actions/app_user'

import Content from '../components/Content'
import UserListItem from '../components/conversations/ItemList'
import sanitizeHtml from 'sanitize-html';
import DialogEditor from '../components/DialogEditor'
import FilterMenu from '../components/FilterMenu'

import { EditIcon, ArchiveIcon,
  BlockIcon,
  UnsubscribeIcon,
  MoreIcon
} from '../components/icons'

const AppUserHeaderOverlay = styled.div`
  position: absolute;
  z-index: 99;
  //color: #fff;
  width: 100%;
  height: 185px;
  //background: {(props)=>  props.theme.palette.background.default };
  //background: linear-gradient(to bottom,rgba(250,250,250,0) 40%,#f6f6f6 100%);
  opacity: 0.6;
`

const AppUserHeaderInfo = styled.div`
  position: absolute;
  z-index: 99;
  //color: #fff;
  width: 100%;
  height: 185px;
  display: flex;
  align-items: self-start;
  justify-content: space-between;

  .name-description {
    display: flex;
    flex-direction: column;
    margin-left: 10px;
  }

  .controls {
    display:flex;
    margin-top: 10px;
    margin-right: 10px;
  }

  .user-info {
    display: flex;
    align-items: center;
    margin-left: 20px;
    margin-top: 20px;
  }
`

const HeaderContainer = styled.div`
  width: 100%;
  height: 192px;
`

class ProfilePage extends Component {

  state = {
    collection: [],
    meta: {},
    startConversationModal: false,
    agent: {},
    editName: false
  }

  componentDidMount(){
    this.getAgent()
  }

  getAgent = ()=>{
    graphql(AGENT, {
      appKey: this.props.app.key, 
      id: parseInt(this.props.match.params.id),
      page: 1,
      per: 20
    }, {
      success: (data)=>{
        this.setState({agent: data.app.agent})
      }, 
      error: (error)=>{

      }
    })
  }

  fetchUserConversations = ()=>{
    graphql(APP_USER_CONVERSATIONS, {
      appKey: this.props.app.key,
      id: this.state.agent.id,
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

  handleSubmit = ({html, serialized, text})=> {

    graphql(START_CONVERSATION, {
      appKey: this.props.app.key, 
      id: this.state.agent.id,
      message: {html, serialized, text}
    }, {
      success: (data)=>{
        console.log(data.startConversation)
      },
      errors: (error)=>{
        debugger
      }
    })
  }

  updateState = (option)=>{

    graphql(APP_USER_UPDATE_STATE, {
      appKey: this.props.app.key, 
      id: this.state.agent.id,
      state: option.id
    }, {
      success: (data)=>{

        this.props.dispatch(
          getAppUser(
            parseInt(this.state.agent.id)
          )
        )

        //data.appUserUpdateData.appUser
      },
      error: (error)=>{
        debugger
      }
    })

  }

  toggleNameEdit = ()=>{
    this.setState({editName: !this.state.editName})
  }

  handleEnter = (e)=>{
    if(e.key === "Enter"){
      graphql(UPDATE_AGENT, {
        appKey: this.props.app.key, 
        email: this.state.agent.email,
        params:{
          name: e.target.value
        }
      }, {
        success: (data)=>{
          this.setState({editName: false})
          this.getAgent()
        },
        error: ()=>{

        }
      })
    }
  }

  updateAgentLogo = (signedBlobId)=>{
    graphql(UPDATE_AGENT, {
      appKey: this.props.app.key, 
      email: this.state.agent.email,
      params: {
        avatar: signedBlobId
      }
    }, {
      success: (data)=>{
        this.setState({editName: false})
        this.getAgent()
      },
      error: ()=>{

      }
    })
  }


  uploadHandler = (file, kind)=>{

    getFileMetadata(file).then((input) => {
      graphql(CREATE_DIRECT_UPLOAD, input, {
        success: (data)=>{
          const {signedBlobId, headers, url, serviceUrl} = data.createDirectUpload.directUpload
       
          directUpload(url, JSON.parse(headers), file).then(
            () => {
              let params = {}
              params[kind] = signedBlobId

              this.updateAgentLogo(signedBlobId)
          });
        },
        error: (error)=>{
         console.log("error on signing blob", error)
        }
      })
    });
  }

  optionsForFilter = ()=>{
    const options = [
      {
        title: 'Archive',
        description: 'Archive this person and their conversation history',
        //icon: <ArchiveIcon/>,
        id: 'archive',
        state: 'archived'
      },
      {
        title: 'Block',
        description: 'Blocks them so you won’t get their replies',
        //icon: <BlockIcon/>,
        id: 'block',
        state: 'blocked'
      },
    
      { 
        title: 'Unsubscribe',
        description: 'Removes them from your email list',
        //icon: <UnsubscribeIcon/>,
        id: 'unsubscribe',
        state: 'unsubscribed'
      }
    ];

    return options
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
    return (

      <div>

        <div className="border-b flex items-center justify-between bg-gray-900 text-white">


          <div className="flex m-6 items-center">

            <div classes={'mr-3 flex flex-col items-center'}>
            
              <Avatar size={20}
                src={this.state.agent.avatarUrl + "&s=120px"}
              />

              <div 
                //className={classes.upload}
                >
                <input
                  accept="image/*"
                  style={{display: 'none'}}
                  //className={classes.input}
                  id={'avatarUpload'}
                  onChange={(e) => this.uploadHandler(e.currentTarget.files[0])}
                  //multiple
                  type="file"
                />
                <label htmlFor={'avatarUpload'}
                  className="text-sm leading-5 text-gray-500">
                  Upload avatar
                </label>
              </div>

            </div>
            
            <div className="flex flex-col ml-3">
              <h5 className="flex text-2xl leading-9 font-extrabold tracking-tight text-gray-100 sm:text-2xl sm:leading-10">
                {
                  this.state.editName ?
                  <TextField
                    type={'text'}
                    //className={classes.input}
                    onKeyUp={this.handleEnter}
                    defaultValue={this.state.agent.name}
                    placeholder="enter agent's name"
                    inputProps={{ 'aria-label': 'enter agent\'s name' }}
                  /> : this.state.agent.name || 'no name' 

                  /*<input defaultValue={this.state.agent.name || 'no name'}/>*/
                }
                <Button variant="icon" 
                  onClick={this.toggleNameEdit} 
                  color={"inherit"}>
                  <EditIcon/>
                </Button>

              </h5>

              <p className="leading-4 font-normal tracking-tight text-gray-100 sm:text-2xl sm:leading-4">
                {this.state.agent.email}
              </p>

              <p variant={"subtitle1"}>
                {this.state.agent.city}
                {this.state.agent.country}
              </p>

              <p variant={"caption"}>
                {this.state.agent.state}
              </p>
            </div>

          </div>

          <div className="controls">

            <FilterMenu
              options={this.optionsForFilter()}
              value={this.props.app_user.state}
              filterHandler={(e) => this.updateState(e.state)}
              triggerButton={this.toggleButton}
              position={"right"}
            />

          </div>

        </div>

        <Content>

          <div className="flex">

            <div className="w-full md:3/4">
              <div className="m-1">
                <h5>
                  Conversations
                </h5>
              </div>

              <div>
                
                {
                  this.state.agent.conversations && 
                
                    this.state.agent.conversations.collection.map((o)=>{
                      const user = o.mainParticipant
                      console.log("ssss", o)
                      return <div 
                                key={o.id} 
                                onClick={(e)=> this.props.history.push(`/apps/${this.props.app.key}/conversations/${o.key}`) }>
                                        
                                <UserListItem
                                  value={null}
                                  app={this.props.app}
                                  mainUser={user}
                                  object={o.id}
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
            </div>

            <div className="w-full md:1/4">
              { 
                /*
                !isEmpty(this.state.agent) ? 
                <UserData 
                  width={"100%"}
                  hideConactInformation={true}
                  appUser={this.state.agent} 
                  app={this.props.app}
                /> : null
                */
              }
            </div>

          </div>


        </Content>


        {
          this.state.startConversationModal ?
           
            <DialogEditor 
              handleSubmit={this.handleSubmit}
              open={this.state.startConversationModal}
            /> : null 
        }

      </div>
    );
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
