import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import UserData from '../components/UserData'
import styled from 'styled-components'
import {isEmpty} from 'lodash'

import graphql from '../graphql/client'
import {
  APP_USER_CONVERSATIONS, 
  APP_USER_VISITS
} from '../graphql/queries'

import {Grid, Typography, Button, Avatar , IconButton} from '@material-ui/core'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import gravatar from '../shared/gravatar'

import {
  getAppUser
} from '../actions/app_user'

import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import Mapa from '../components/map'
import UserListItem from '../components/UserListItem'
import sanitizeHtml from 'sanitize-html';
import DataTable from '../components/newTable'


const AppUserHeaderOverlay = styled.div`
  position: absolute;
  z-index: 99999;
  color: #fff;
  width: 100%;
  height: 185px;
  background: #24852b;
  //background: linear-gradient(to bottom,rgba(250,250,250,0) 40%,#f6f6f6 100%);
  opacity: 0.6;
`

const AppUserHeaderInfo = styled.div`
  position: absolute;
  z-index: 99999;
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
    display:flex
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
    meta: {}

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

  render() {
    console.log(this.props.app_user)
    return (

      <div>

        <ContentHeader/>

        <Mapa 
          interactive={false} 
          data={[this.props.app_user]} 
          wrapperStyle={{
            position: 'relative',
            width: '100%',
            height: '184px',
            marginTop: '0px',
          }}>
          
          <AppUserHeaderOverlay>

          </AppUserHeaderOverlay>

          <AppUserHeaderInfo>


            <div className="user-info">

              <Avatar style={{width: '120px', height: '120px'}}
                src={gravatar(this.props.app_user.email, {s: '120px'})}
              />

              <div className="name-description">
                <Typography variant={"h5"}>
                  {this.props.app_user.displayName}
                </Typography>

                <Typography variant={"h6"}>
                  {this.props.app_user.city}
                  {this.props.app_user.country}
                </Typography>
              </div>

            </div>

            <div className="controls">

              <Button variant="contained" color="primary">
                start conversation
              </Button>

              <IconButton>
                <MoreVertIcon/>
              </IconButton>

            </div>

          </AppUserHeaderInfo>
        
        </Mapa>

        <Content>

          <Grid container spacing={2}>

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

              <Grid item xs={12} sm={4}>
                <Typography>
                  conversations
                </Typography>
                {
                  this.state.collection.map((o)=>{
                    const user = o.mainParticipant
                    return <div 
                              key={o.id} 
                              onClick={(e)=> this.props.history.push(`/apps/${appId}/conversations/${o.id}`) }>
                                      
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

  fetchvisits = ()=>{
    this.setState({loading: true}, ()=>{
      graphql(APP_USER_VISITS, {
        appKey: this.props.app.key,
        id: this.props.app_user.id,
        page: this.state.meta.next_page || 1,
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
        rows={this.state.collection}
        columns={[{name: "url", title: "url"}]}
        meta={this.state.meta}
        search={this.fetchvisits}
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
