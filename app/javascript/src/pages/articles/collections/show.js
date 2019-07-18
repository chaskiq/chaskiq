import React, {Component} from 'react'
import { withRouter, Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import {
  Paper,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@material-ui/core'

import FormDialog from '../../../components/FormDialog'


import graphql from '../../../graphql/client'
import {
  ARTICLE_COLLECTION_CREATE,
  ARTICLE_COLLECTION_EDIT,
  ARTICLE_COLLECTION_DELETE
} from '../../../graphql/mutations'

import {
  ARTICLE_COLLECTIONS,
  ARTICLE_COLLECTION
} from '../../../graphql/queries'

import Dnd from './dnd'



class CollectionDetail extends Component {

  state = {
    isOpen: false,
    collection: {}
  }
  titleRef = null
  descriptionRef = null


  componentDidMount(){
    this.getCollection()
  }

  getCollection = ()=>{
    graphql(ARTICLE_COLLECTION, {
      appKey: this.props.app.key, 
      id: this.props.match.params.id
    }, {
      success: (data)=>{
        this.setState({
          collection: data.app.collection, 
          loading: false
        })
      },
      error: ()=>{

      }
    })
  }

  renderCollection = ()=>{
    const {collection} = this.state
    return <div>
            <h2>{collection.title}</h2>
            <p>{collection.description}</p>

            <Dnd/>
           </div>
  }

  render(){
    const {isOpen} = this.state
    return <Paper 
         square={true}
         elevation={1}
         //className={classes.paper}
         >

          {
            this.state.loading ? 
            <CircularProgress/> : 
            this.renderCollection()
          }

         </Paper>

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


//export default withRouter(connect(mapStateToProps)(withStyles(styles)(ArticlesNew)))
export default withRouter(connect(mapStateToProps)(CollectionDetail))
