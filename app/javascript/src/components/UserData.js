import React, {Component} from 'react'
import styled from "styled-components"
import gravatar from "../shared/gravatar"
import Moment from 'react-moment';
import Accordeon from './accordeon'
import Avatar from '@material-ui/core/Avatar';
import { makeStyles } from '@material-ui/core/styles';
import {Link} from 'react-router-dom'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

const ActivityAvatar = styled.div`
  //display: flex;
  align-self: center;
  position: relative;
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

function ImageAvatars(props) {
  const classes = useStyles();

  return (
      <Avatar alt={props.email}
        src={props.src} 
        className={classes.avatar} 
      />
  );
}

class UserData extends Component {

  render(){

    return <UserDataContent style={{width: this.props.width}}>

              <UserDataInformation>
    
                <ActivityAvatar>
                  <ImageAvatars
                    email={this.props.appUser.email} 
                    src={gravatar(this.props.appUser.email)}
                  />

                </ActivityAvatar>


                <Link to={`/apps/${this.props.app.key}/users/${this.props.appUser.id}`}>
                  See full profile
                </Link>

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

              </UserDataInformation>

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
                  }
                  ]

                },
                {
                  name: "Browsing Properties",
                  component: null,
                  items: [
                    {
                      label: 'postal:',
                      value: this.props.appUser.postal
                    },

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
                  name: "Properties", component: <UserDataList>
                    {
                      this.props.appUser.properties ?
                        Object.keys(this.props.appUser.properties).map((o, i) => {
                          return <li key={i}>
                            <strong>{o}:</strong>
                            <span>{this.props.appUser.properties[o]}</span>
                          </li>
                        }) : null
                    }
                  </UserDataList>
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