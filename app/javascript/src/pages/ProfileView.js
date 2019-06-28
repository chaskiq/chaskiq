import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import UserData from '../components/UserData'
import {isEmpty} from 'lodash'

import {
  getAppUser
} from '../actions/app_user'

import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import Mapa from '../components/map'

class ProfilePage extends Component {

  componentDidMount(){
    this.props.dispatch(
      getAppUser(
        parseInt(this.props.match.params.id)
      , ()=>{
      })
    )
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
            width: '100%',
            height: '134px',
            marginTop: '0px',
          }}
        />

        <Content>

          { 
            !isEmpty(this.props.app_user) ? 
            <div>
              <p>{this.props.app_user.browser}</p>
              <UserData 
                appUser={this.props.app_user} 
                app={this.props.app}
              />
            </div> : null
          }

        </Content>

         

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
