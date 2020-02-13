import React, {Component} from 'react'
import styled from '@emotion/styled'
import Moment from 'react-moment';
import Accordeon from './accordeon'
import Avatar from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Box from '@material-ui/core/Box'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import {toggleDrawer} from '../actions/drawer'
import {AnchorLink} from '../shared/RouterLink'

import {syncExternalProfile} from '../actions/app_user'

const ActivityAvatar = styled.div`
  display: flex;
  justify-content: center;
`

const UserDataList = styled.ul`
  li{
    span{
      margin-left:10px;
    }
  }
`

const UserDataInformation = styled.div`
  padding: 20px;
`

const UserDataContent = styled.div`
  display: inline-block;
  align-items: center;
  text-align: center;
`

const useStyles = makeStyles({
  avatar: {
    margin: 10,
  },
  bigAvatar: {
    margin: 10,
    width: 60,
    height: 60,
  },
});

export const LoaderWrapper = styled.div`
  width: 300px;
  padding: 1em;
  display: flex;
  justify-content: center;
`

function ImageAvatars(props) {
  const classes = useStyles();

  return (
      <Avatar 
        style={{width: '120px', height: '120px'}}
        alt={props.email}
        src={props.src} 
        className={classes.avatar} 
      />
  );
}

class UserData extends Component {

  syncExternalProfile = (profile)=>{
    this.props.dispatch(
      syncExternalProfile(
        this.props.appUser.id,
        profile
      )
    )
  }

  render(){

    return <UserDataContent style={{width: this.props.width}}>


            {
              !this.props.hideConactInformation ?
              <UserDataInformation>
    
                <ActivityAvatar>
                  <ImageAvatars
                    email={this.props.appUser.email}
                    src={this.props.appUser.avatarUrl + "&s=120px"}
                  />

                </ActivityAvatar>


                <AnchorLink 
                  to={`/apps/${this.props.app.key}/users/${this.props.appUser.id}`}
                  onClick={()=> {
                    this.props.dispatch(
                      toggleDrawer({ rightDrawer: false }, ()=>{
                      })
                    )}
                  }>
                  
                  See full profile
                </AnchorLink>

                <p style={{
                  fontWeight: '700'
                }}>
                  {this.props.appUser.email}
                </p>

                <p>
                  <Moment fromNow>
                    {this.props.appUser.lastVisitedAt}
                  </Moment>
                </p>

              </UserDataInformation> : null 
            }

            <Accordeon items={[
              {
                name: "Location",
                component: null,
                items: [{
                  label: 'referrer',
                  value: this.props.appUser.referrer
                },

                {
                  label: 'city',
                  value: this.props.appUser.city
                },

                {
                  label: 'region',
                  value: this.props.appUser.region
                },

                {
                  label: 'country',
                  value: this.props.appUser.country
                },

                {
                  label: 'lat',
                  value: this.props.appUser.lat
                },

                {
                  label: 'lng',
                  value: this.props.appUser.lng
                },
                {
                  label: 'postal:',
                  value: this.props.appUser.postal
                },
                ]

              },
              {
                name: "Browsing Properties",
                component: null,
                items: [
                  {
                    label: 'web sessions:',
                    value: this.props.appUser.webSessions
                  },

                  {
                    label: 'timezone:',
                    value: this.props.appUser.timezone
                  },

                  {
                    label: 'browser version:',
                    value: this.props.appUser.browserVersion
                  },

                  {
                    label: 'browser:',
                    value: this.props.appUser.browser
                  },

                  {
                    label: 'os:',
                    value: this.props.appUser.os
                  },

                  {
                    label: 'os version:',
                    value: this.props.appUser.osVersion
                  }
                ]

              },
              {
                name: "Properties", 
                component: <List dense>
                  {
                    this.props.appUser.properties &&
                      Object.keys(this.props.appUser.properties).map((o, i) => {
                        if(!this.props.appUser.properties[o]) return null 
                        return <ListItem key={`app-user-${this.props.appUser.id}-${i}`}>
                                  <ListItemText
                                    primary={`${o}:`}
                                    secondary={this.props.appUser.properties[o]}
                                  />
                                </ListItem>
                      }) 
                  }
                  </List>
              }, 
              {
                name: "External Profiles",
                component: <div>

                <List dense>
                {
                  this.props.appUser.externalProfiles &&
                    this.props.appUser.externalProfiles.map((o, i) => {
                      return <Box
                              m={2}
                              key={`app-user-profile-${this.props.appUser.id}-${o.id}`}>
                                <div style={{
                                  textAlign: 'left', 
                                  display: 'flex',
                                  justifyContent: 'space-between'
                                }}>

                                  <Typography variant="h6">
                                    {o.provider}
                                  </Typography>

                                  <Button 
                                    size="small" 
                                    variant={'outlined'} 
                                    onClick={()=> this.syncExternalProfile(o) }>
                                    sync
                                  </Button>

                                </div>

                                <div style={
                                  {
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    textAlign: 'left'}
                                  }>
                                  { 
                                    Object.keys(o.data).map((a, i) => {
                                      if(!o.data[a] || typeof(o.data[a]) === 'object') return null 
                                      return <Typography 
                                                variant={"caption"}
                                                key={`app-user-${o.provider}-${this.props.appUser.id}-${i}`}>
                                                  {<b>{a}:</b>}{` ${o.data[a]}`}
                                              </Typography>
                                    }) 
                                  }
                                </div>
                            </Box>
                    }) 
                }
                </List>
                
                 
                </div>
              }

            ]} />
    
          </UserDataContent>
  }
}

function mapStateToProps(state) {

  const { app } = state

  return {
    app,
  }
}

export default withRouter(connect(mapStateToProps)(UserData))