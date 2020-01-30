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


import Grid from '@material-ui/core/Grid' 
import Typography from '@material-ui/core/Typography' 
import Button from '@material-ui/core/Button' 
import Avatar from '@material-ui/core/Avatar'
import IconButton from '@material-ui/core/IconButton' 
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'

import EditIcon from '@material-ui/icons/EditOutlined'

import {
  getAppUser
} from '../actions/app_user'

import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import Mapa from '../components/map'
import UserListItem from '../components/conversation/UserListItem'
import sanitizeHtml from 'sanitize-html';
import DialogEditor from '../components/conversation/DialogEditor'
import UserActionsMenu from '../components/userActionsMenu'

const AppUserHeaderOverlay = styled.div`
  position: absolute;
  z-index: 99;
  //color: #fff;
  width: 100%;
  height: 185px;
  background: ${(props)=>  props.theme.palette.background.default };
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

  render() {
    return (

      <div>

        <ContentHeader/>

        <HeaderContainer>
          
          <AppUserHeaderOverlay>

          </AppUserHeaderOverlay>

          <AppUserHeaderInfo>


            <div className="user-info">

              <Avatar style={{width: '120px', height: '120px'}}
                src={this.state.agent.avatarUrl + "&s=120px"}
              />

              <div className="name-description">
                <Typography variant={"h5"}>
                {
                  this.state.editName ?
                  <TextField
                    //className={classes.input}
                    onKeyUp={this.handleEnter}
                    defaultValue={this.state.agent.name}
                    placeholder="enter agent's name"
                    inputProps={{ 'aria-label': 'enter agent\'s name' }}
                  /> : this.state.agent.name || 'no name' 

                  /*<input defaultValue={this.state.agent.name || 'no name'}/>*/
                  
                }
                  <IconButton onClick={this.toggleNameEdit} color={"inherit"}>
                    <EditIcon/>
                  </IconButton>

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

                    
                    <label htmlFor={'avatarUpload'}>
                      <Button variant="contained" component="span" 
                        //className={classes.button}
                        >
                        Upload avatar
                      </Button>
                    </label>
                  </div>

                </Typography>

                <Typography variant={"h6"}>
                  {this.state.agent.email}
                </Typography>

                <Typography variant={"subtitle1"}>
                  {this.state.agent.city}
                  {this.state.agent.country}
                </Typography>

                <Typography variant={"caption"}>
                  {this.state.agent.state}
                </Typography>
              </div>

            </div>

            <div className="controls">

              <UserActionsMenu
                selected={this.state.agent.state}
                handleClick={(item)=>{  this.updateState(item) }}
              />

            </div>

          </AppUserHeaderInfo>
        
        </HeaderContainer>

        <Content>

          <Grid container spacing={2}>

            <Grid item xs={12} sm={8}>
              <Box m={1}>
                <Typography variant={'h5'}>
                  Conversations
                </Typography>
              </Box>

              <Paper>
                
                {
                  this.state.agent.conversations ? 
                
                    this.state.agent.conversations.collection.map((o)=>{
                      const user = o.mainParticipant
                      return <div 
                                key={o.id} 
                                onClick={(e)=> this.props.history.push(`/apps/${this.props.app.key}/conversations/${o.key}`) }>
                                        
                                <UserListItem
                                  value={null}
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
                  : null 
                }
              </Paper>
            </Grid>

            <Grid item xs={12} sm={4}>
              { 
                !isEmpty(this.state.agent) ? 
                <UserData 
                  width={"100%"}
                  hideConactInformation={true}
                  appUser={this.state.agent} 
                  app={this.props.app}
                /> : null
              }
            </Grid>

          </Grid>


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
