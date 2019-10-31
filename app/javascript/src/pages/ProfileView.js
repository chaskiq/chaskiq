import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import UserData from '../components/UserData'
import styled from '@emotion/styled'
import {isEmpty} from 'lodash'

import graphql from '../graphql/client'
import {
  APP_USER_CONVERSATIONS, 
  APP_USER_VISITS,
} from '../graphql/queries'

import {
  START_CONVERSATION,
  APP_USER_UPDATE_STATE
} from '../graphql/mutations'

import {Grid, 
  Typography, 
  Button, 
  Avatar, 
} from '@material-ui/core'
import gravatar from '../shared/gravatar'

import {
  getAppUser
} from '../actions/app_user'

import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import Mapa from '../components/map'
import UserListItem from '../components/conversation/UserListItem'
import sanitizeHtml from 'sanitize-html';
import DataTable from '../components/table'

import DialogEditor from '../components/conversation/DialogEditor'
import UserActionsMenu from '../components/userActionsMenu'

const AppUserHeaderOverlay = styled.div`
  position: absolute;
  z-index: 99;
  color: #fff;
  width: 100%;
  height: 185px;
  background: #01011078;
  //background: linear-gradient(to bottom,rgba(250,250,250,0) 40%,#f6f6f6 100%);
`

const AppUserHeaderInfo = styled.div`
  position: absolute;
  z-index: 99;
  color: #fff;
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



class ProfilePage extends Component {

  state = {
    collection: [],
    meta: {},
    startConversationModal: false

  }

  componentDidMount(){
    this.props.dispatch(
      getAppUser(
        parseInt(this.props.match.params.id)
      , ()=>{
        this.fetchUserConversations()
      })
    )
  }

  fetchUserConversations = ()=>{
    graphql(APP_USER_CONVERSATIONS, {
      appKey: this.props.app.key,
      id: this.props.app_user.id,
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

  render() {
    return (

      <div>

        <ContentHeader title={"contact profile"}/>

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

          <AppUserHeaderInfo>


            <div className="user-info">

              <Avatar style={{width: '120px', height: '120px'}}
                src={gravatar(this.props.app_user.email, {s: '120px'})}
              />

              <div className="name-description">
                <Typography variant={"h5"}>
                  {this.props.app_user.name || 'no name'}
                </Typography>

                <Typography variant={"h6"}>
                  {this.props.app_user.email}
                </Typography>

                <Typography variant={"subtitle1"}>
                  {this.props.app_user.city}
                  {" "}
                  {this.props.app_user.country}
                </Typography>

                <Typography variant={"caption"}>
                  {this.props.app_user.state}
                </Typography>
              </div>

            </div>

            <div className="controls">

              <Button 
                variant="contained" 
                color="secondary"
                onClick={this.openStartConversationModal}>
                start conversation
              </Button>

              <UserActionsMenu
                selected={this.props.app_user.state}
                handleClick={(item)=>{  this.updateState(item) }}
              />

            </div>

          </AppUserHeaderInfo>
        
        </Mapa>

        <Content>

          <Grid container spacing={2}>

            <Grid item xs={12} sm={8}>
              <Typography variant="h5" gutterBottom>
                conversations
              </Typography>
              {
                this.state.collection.filter((o)=> o.lastMessage ).map((o)=>{
                  const user = o.mainParticipant
                 
                  return <div 
                            key={`user-list-${o.key}`} 
                            onClick={(e)=> this.props.history.push(`/apps/${this.props.app.key}/conversations/${o.key}`) }>
                                    
                            <UserListItem
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
            </Grid>

            <Grid item xs={12} sm={4}>
              { 
                !isEmpty(this.props.app_user) ? 
                <UserData 
                  width={"100%"}
                  hideConactInformation={true}
                  appUser={this.props.app_user} 
                  app={this.props.app}
                /> : null
              }
            </Grid>

          </Grid>


          <Grid item xs={12} sm={12}>
            {
              this.props.app_user.id ?
              <AppUserVisits {...this.props}/> : null
            }
          </Grid>

        </Content>


        {
          this.state.startConversationModal ?
           
            <DialogEditor 
              handleSubmit={this.handleSubmit}
              close={this.handleDialogClose}
              open={this.state.startConversationModal}
            /> : null 
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
          {field: "osVersion", title: "os version"}
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
