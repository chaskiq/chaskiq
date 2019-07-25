import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { withRouter, Route } from 'react-router-dom'
import { connect } from 'react-redux'

import {
        Tab ,
        Tabs ,
        Avatar ,
        Typography,
        Button,
        TextField,
        Paper,
        Grid,
        Divider
} from '@material-ui/core';

import {getFileMetadata, directUpload} from '../../shared/fileUploader'

//import {Link} from 'react-router-dom'

import graphql from '../../graphql/client'
import {toSnakeCase} from '../../shared/caseConverter'

import {
  ARTICLE_SETTINGS
} from '../../graphql/queries'

import {
  CREATE_DIRECT_UPLOAD,
  ARTICLE_BLOB_ATTACH,
  ARTICLE_SETTINGS_UPDATE
} from '../../graphql/mutations'

import { withStyles } from '@material-ui/core/styles';
import serialize from 'form-serialize'

//import Loader from './loader'
import _ from "lodash"

import GestureIcon from '@material-ui/icons/Gesture'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import {setCurrentPage} from '../../actions/navigation'
import FieldRenderer from '../../shared/FormFields'
import ContentHeader from '../../components/ContentHeader'
import Content from '../../components/Content'

const styles = theme => ({

  paper: {
    margin: '9em',
    padding: '1em',
    marginTop: '1.5em',
    paddingBottom: '6em'
  }
});


class Settings extends Component {

  state = {
    loading: true,
    tabValue: 0,
    settings: null,
    errors: []
  };

  titleRef = null
  descriptionRef = null
  switch_ref = null

  componentDidMount(){
    this.getSettings()
    this.props.dispatch(
      setCurrentPage('Help Center')
    )
  }

  getSettings = ()=>{
    graphql(ARTICLE_SETTINGS, {
      appKey: this.props.app.key
    }, {
      success: (data)=>{
        this.setState({
          loading: false,
          settings: data.app.articleSettings
        })
      },
      error: (e)=>{
        debugger
      }
    })
  }

  update = (data)=>{
    const {settings} = data
    graphql(ARTICLE_SETTINGS_UPDATE, {
      appKey: this.props.app.key,
      settings: settings
    }, {
      success: (data)=>{
        this.setState({
          settings: data.articleSettingsUpdate.settings
        })
      },
      error: (e)=>{
        debugger
      }
    })
  }

  updateState = (data)=>{
    this.setState(data)
  }

  uploadHandler = (file, imageBlock)=>{

    getFileMetadata(file).then((input) => {
      graphql(CREATE_DIRECT_UPLOAD, input, {
        success: (data)=>{
          const {signedBlobId, headers, url, serviceUrl} = data.createDirectUpload.directUpload
       
          directUpload(url, JSON.parse(headers), file).then(
            () => {
              graphql(ARTICLE_BLOB_ATTACH, { 
                appKey: this.props.app.key ,
                id: parseInt(this.state.article.id),
                blobId: signedBlobId
              }, {
                success: (data)=>{
                  imageBlock.uploadCompleted(serviceUrl)
                },
                error: (err)=>{
                  console.log("error on direct upload", err)
                }
              })
          });
        },
        error: (error)=>{
         console.log("error on signing blob", error)
        }
      })
    });
  }

  definitionsForSettings = () => {
    return [
      {
        name: "subdomain",
        hint: "documentation site subdomain",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
      {
        name: "siteTitle",
        hint: "documentation site subdomain",
        type: 'text',
        grid: { xs: 12, sm: 12 }
      },
      {
        name: "siteDescription",
        hint: "documentation site subdomain",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
      {
        name: "website",
        hint: "link to your website",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
      {
        name: "googleCode",
        hint: "Google Analytics Tracking ID",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
    ]
  }

  definitionsForAppearance = () => {
    return [
      {
        name: "color",
        type: 'string',
        grid: { xs: 12, sm: 4 }
      },

      {
        name: "logo",
        type: 'string',
        grid: { xs: 12, sm: 4 }
      },

      {
        name: "header logo",
        type: 'string',
        grid: { xs: 12, sm: 4 }
      },

      {
        name: "facebook",
        type: 'string',
        grid: { xs: 12, sm: 4 }
      },

      {
        name: "twitter",
        type: 'string',
        grid: { xs: 12, sm: 4 }
      },

      {
        name: "linkedin",
        type: 'string',
        grid: { xs: 12, sm: 4 }
      },

      {
        name: "credits",
        type: 'bool',
        hint: "Display a subtle link to the Chaskiq website",
        grid: { xs: 12, sm: 8 }
      },
    ]
  }

  definitionsForLang = () => {
    return [
      
    ]
  }

  handleTabChange = (e, i)=>{
    this.setState({tabValue: i})
  }

  tabsContent = ()=>{
    return <Tabs value={this.state.tabValue} 
              onChange={this.handleTabChange}
              textColor="inherit">
              <Tab textColor="inherit" label="Basic Setup" />
              <Tab textColor="inherit" label="Lang" />
              <Tab textColor="inherit" label="Appearance" />
            </Tabs>
  }

  renderTabcontent = ()=>{

    if(this.state.loading){
      return <p>loading...</p>
    }

    switch (this.state.tabValue){
      case 0:
        return <SettingsForm
                  title={"General app's information"}
                  //currentUser={this.props.currentUser}
                  data={this.state.settings}
                  update={this.update.bind(this)}
                  //fetchApp={this.fetchApp}
                  //classes={this.props.classes}
                  definitions={this.definitionsForSettings}
                  {...this.props}
               />

      case 1:
        return <SettingsForm
                  title={"Lang"}
                  //currentUser={this.props.currentUser}
                  data={this.state.settings}
                  update={this.update.bind(this)}
                  //fetchApp={this.fetchApp}
                  //classes={this.props.classes}
                  definitions={this.definitionsForLang}
                  {...this.props}
                />
      case 2:
        return <SettingsForm
                  title={"Appearance settings"}
                  //currentUser={this.props.currentUser}
                  data={this.state.settings}
                  update={this.update.bind(this)}
                  //fetchApp={this.fetchApp}
                  //classes={this.props.classes}
                  definitions={this.definitionsForAppearance}
                  {...this.props}
                />
      case 3:
        return <p>ddkd</p>
    }
  }


  render() {
    const {classes} = this.props
    return (
       <React.Fragment>

         <ContentHeader 
            title={ 'App Settings' }
            tabsContent={ this.tabsContent() }
          />

          <Content>
            {this.renderTabcontent()}
          </Content>

        
      </React.Fragment>
    );
  }
}

class SettingsForm extends Component{

  formRef: any;

  onSubmitHandler = ()=>{
    const serializedData = serialize(this.formRef, { hash: true, empty: true })
    const data = toSnakeCase(serializedData)
    this.props.update(data)
  }

  render(){

    return (

      <form 
        onSubmit={this.onSubmitHandler.bind(this)}
        ref={form => {
        this.formRef = form;
      }}>

        <input type={"text"} 
          defaultValue={this.props.data.id} 
        />
        
        <Grid container spacing={3}>
          {
            this.props.definitions().map((field) => {

              return <Grid item
                        key={field.name} 
                        xs={field.grid.xs} 
                        sm={field.grid.sm}>
                        <FieldRenderer 
                          namespace={'settings'} 
                          data={field}
                          props={{data: this.props.data }} 
                          errors={ {} }
                        />
                    </Grid>
            })
          }
        </Grid>
      
        <Divider variant="inset"></Divider>

        <Button 
          onClick={this.onSubmitHandler.bind(this)}
          variant="contained" 
          color="primary">
          Save
        </Button>

        <Button appearance="subtle">
          Cancel
        </Button>

      </form>
    )
  } 
}


function mapStateToProps(state) {

  const { auth, app } = state
  const { isAuthenticated } = auth
  //const { sort, filter, collection , meta, loading} = conversations

  return {
    app,
    isAuthenticated
  }
}


export default withRouter(connect(mapStateToProps)(withStyles(styles)(Settings)))
