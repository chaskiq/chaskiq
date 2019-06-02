import React, {Component} from 'react'
import styled from "styled-components"
import gravatar from "gravatar"
import Moment from 'react-moment';
import Accordeon from './accordeon'
import Avatar from '@atlaskit/avatar';


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
  width: 300px;
`

export default class UserData extends Component {
  render(){
    return <UserDataContent>

              <UserDataInformation>
    
                <ActivityAvatar>
                  <Avatar
                    src={gravatar.url(this.props.appUser.email)}
                    name="large"
                    size="xlarge"
                    presence={this.props.appUser.state}
                  />

                </ActivityAvatar>

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