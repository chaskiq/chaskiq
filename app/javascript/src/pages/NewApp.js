import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import FieldRenderer from '../shared/FormFields'

import serialize from 'form-serialize'
import {SettingsForm} from './AppSettings'
import timezones from '../shared/timezones'

import Paper from '@material-ui/core/Paper' 
import Button from '@material-ui/core/Button' 
import graphql from "../graphql/client";
import { 
  CREATE_APP
 } from '../graphql/mutations'

 import {errorMessage, successMessage} from '../actions/status_messages'

 import { 
  clearApp
} from '../actions/app'
import Snackbar from '../components/snackbar'

import image from '../../../assets/images/up-icon8.png'

const styles = theme => ({
  addUser: {
    marginRight: theme.spacing(1),
  },
  root: {
    [theme.breakpoints.up('sm')]: {
      margin: theme.spacing(3),
    },
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
  },
  itemContent: {
    display: 'flex',
    alignItems: 'center'
   },
   pad: {
     margin: '3em'
   },
   paperPad: {
    [theme.breakpoints.up('sm')]: {
      margin: theme.spacing(5),
    },
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(2),
    },
   }
});

class NewApp extends Component {

  state = {
    data: {},
  };

  componentDidMount(){
    this.props.dispatch(clearApp())
  }

  definitionsForSettings = () => {
    return [
      {
        name: "name",
        type: 'string',
        grid: { xs: 12, sm: 6 }
      },
      {
        name: "domainUrl",
        type: 'string',
        grid: { xs: 12, sm: 6 }
      },
      {
        name: "tagline",
        type: 'text',
        hint: "messenger text on botton",
        grid: { xs: 12, sm: 12 }
      },

      {name: "timezone", type: "timezone", 
        options: timezones, 
        multiple: false,
        grid: {xs: 12, sm: 12 }
      },
      {
        name: "gatherSocialData",
        type: 'bool',
        label: "Collect social data about your users",
        hint: "Collect social profiles (e.g. LinkedIn, Twitter, etc.) for my users via a third party",
        grid: { xs: 12, sm: 12 }
      },
    ]
  }

  handleSuccess = ()=>{
    this.props.dispatch(successMessage("app created successfully"))
    this.props.history.push(`/apps/${this.state.data.app.key}`)
  }

  handleResponse = ()=>{
    this.state.data.app.key ? this.handleSuccess() : null
  }


  handleData = (data)=>{
    graphql(CREATE_APP, {
      appParams: data.app, 
      operation: "create"
    },{
      success: (data)=>{
        this.setState({
          data: data.appsCreate
        }, ()=> (this.handleResponse(data)))
      },
      error: (error)=>{
        this.props.dispatch(errorMessage("server error"))
      }
    }
    )
  }

  render() {

    return (
      <Paper className={this.props.classes.paperPad}>
      <Snackbar/>
       <Grid container justify={"center"} spacing={4}>

        <Grid item sm={6} className={this.props.classes.itemContent}>

          <div className={this.props.classes.pad}>
            <Typography variant="h5" gutterBottom>        
              Create your company’s Chaskiq app
            </Typography>


            <Typography>
              Provide basic information to setup Chaskiq for 
              your team and customers.
            </Typography>

            <img 
              src={image}
              class="is-pablo" style={{width: "100%"}}/>
          </div>

        </Grid>
        <Grid item sm={6}>
          <SettingsForm 
            data={this.state.data}
            classes={this.props.classes}
            update={this.handleData}
            definitions={this.definitionsForSettings}
          />
        </Grid>

      </Grid>
      </Paper>
    );
  }
}


NewApp.contextTypes = {
  router: PropTypes.object,
};


function mapStateToProps(state) {

  const { auth, app } = state
  const { isAuthenticated } = auth
  //const { sort, filter, collection , meta, loading} = conversations

  return {
    isAuthenticated
  }
}


export default withRouter(connect(mapStateToProps)(withStyles(styles)(NewApp)))

