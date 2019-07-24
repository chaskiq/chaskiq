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
      } from '@material-ui/core';

import {getFileMetadata, directUpload} from '../../shared/fileUploader'

//import {Link} from 'react-router-dom'

import graphql from '../../graphql/client'

import {
  CREATE_DIRECT_UPLOAD,
  ARTICLE_BLOB_ATTACH,
} from '../../graphql/mutations'

import { withStyles } from '@material-ui/core/styles';

//import Loader from './loader'
import _ from "lodash"

import GestureIcon from '@material-ui/icons/Gesture'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import {setCurrentPage} from '../../actions/navigation'


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
  };

  titleRef = null
  descriptionRef = null
  switch_ref = null

  componentDidMount(){
    this.props.dispatch(
      setCurrentPage('Help Center')
    )
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


  render() {
    const {classes} = this.props
    return (
       <React.Fragment>

       <Paper 
         square={true}
         elevation={1}
         className={classes.paper}>
        oaoaoaoa
       </Paper>

        
      </React.Fragment>
    );
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
