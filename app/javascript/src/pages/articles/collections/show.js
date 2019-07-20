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
  ARTICLE_COLLECTION_DELETE,
  ARTICLE_SECTION_CREATE,
  ARTICLE_SECTION_DELETE
} from '../../../graphql/mutations'

import {
  ARTICLE_COLLECTIONS,
  ARTICLE_COLLECTION,
  ARTICLE_COLLECTION_WITH_SECTIONS
} from '../../../graphql/queries'

import Dnd from './dnd'



class CollectionDetail extends Component {

  state = {
    isOpen: false,
    collection: null
  }
  titleRef = null
  descriptionRef = null


  componentDidMount(){
    this.getCollection()
  }

  getCollection = ()=>{
    graphql(ARTICLE_COLLECTION_WITH_SECTIONS, {
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

  close = ()=> this.setState({isOpen: false})

  openNewDialog = ()=>{
    this.setState({
      isOpen: true
    })
  }

  handleDataUpdate = (data)=>{
    this.setState({
      collection: Object.assign({}, this.state.collection, {sections: data})
    })
  }

  renderCollection = ()=>{
    const {collection} = this.state
    return <div>

            {
              collection ?
              <div>
                <h2>{collection.title}</h2>
                <p>{collection.description}</p>

                <button onClick={this.openNewDialog}>
                  new section
                </button>

                <Dnd sections={collection.sections}
                     handleDataUpdate={ this.handleDataUpdate }
                     deleteSection={this.deleteSection}
                />
              </div> : null 
            }
           </div>
  }

  deleteSection = (section)=>{
    graphql(ARTICLE_SECTION_DELETE, {
      appKey: this.props.app.key,
      id: section.id
    }, {
      success: (data)=>{
        const section = data.articleSectionDelete.section
        const newSections = this.state.collection.sections.filter((o)=> o.id != section.id )

        this.setState({
          collection: Object.assign({}, 
            this.state.collection, 
            {sections: newSections}
          )
        })
      },
      error: ()=>{

      }
    })
  }

  submitCreate = ()=>{
    const {collection} = this.state
    graphql(ARTICLE_SECTION_CREATE, {
      appKey: this.props.app.key,
      collectionId: collection.id,
      title: this.titleRef.value,
      //description: this.descriptionRef
    }, 
    {
      success: (data)=>{
        const section = data.articleSectionCreate.section
        const sections = this.state.collection.sections.concat(section) 

        this.setState({
          collection: Object.assign({}, this.state.collection, {sections: sections}),
          isOpen: false
        })
      },
      error: ()=>{

      }
    }
    )
  }

  renderDialog = ()=>{
    const {isOpen} = this.state
    return <FormDialog 
              open={isOpen}
              //contentText={"lipsum"}
              titleContent={"New Section"}
              formComponent={
                <form ref="form">

                  <TextField
                    id="collection-title"
                    //label="Name"
                    placeholder={"Type sections's title"}
                    inputProps={{
                        style: {
                          fontSize: "1.4em"
                        }
                      }
                    }
                    //helperText="Full width!"
                    fullWidth
                    inputRef={ref => { this.titleRef = ref; }}
                    //defaultValue={ editCollection ? editCollection.title : null }
                    margin="normal"
                  />


                  <TextField
                    id="collection-description"
                    //label="Description"
                    placeholder={"Describe your collection to help it get found"}
                    //helperText="Full width!"
                    fullWidth
                    multiline
                    inputRef={ref => { this.descriptionRef = ref; }}
                    //defaultValue={ editCollection ? editCollection.description : null }
                    margin="normal"
                  />



                </form>
              }

              dialogButtons={
                <React.Fragment>
                  <Button onClick={this.close} color="primary">
                    Cancel
                  </Button>

                  <Button onClick={ //editCollection ? 
                    //this.submitEdit.bind(this) :
                    this.submitCreate.bind(this) 
                  } 
                    zcolor="primary">
                    submit
                    {/*editCollection ? 'update' : 'create'*/}
                  </Button>

                </React.Fragment>
              }
          />
  }

  render(){
    
    return <Paper 
         square={true}
         elevation={1}
         //className={classes.paper}
         >

          { 
            this.renderDialog()
          }

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
