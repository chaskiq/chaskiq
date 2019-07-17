import React, {Component} from 'react'
import { withRouter, Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import {
  Paper,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText
} from '@material-ui/core'

import FormDialog from '../../../components/FormDialog'


import graphql from '../../../graphql/client'
import {
  ARTICLE_COLLECTION_CREATE,
  ARTICLE_COLLECTION_EDIT,
  ARTICLE_COLLECTION_DELETE
} from '../../../graphql/mutations'

import {
  ARTICLE_COLLECTIONS
} from '../../../graphql/queries'



class Collections extends Component {

  state = {
    isOpen: false,
    article_collections: []
  }
  titleRef = null
  descriptionRef = null

  componentDidMount(){
    this.getCollections()
  }

  submitAssignment = ()=>{

  }


  close = ()=>{
    this.setState({isOpen: false})
  }

  displayDialog = (e)=>{
    this.setState({isOpen: true})
  }

  submitCreate = (e)=>{
    graphql(ARTICLE_COLLECTION_CREATE, {
      appKey: this.props.app.key, 
      title: this.titleRef.value, 
      description: this.descriptionRef.value
    }, {
      success: (data)=>{
        const col = data.articleCollectionCreate.collection
        this.setState({
          article_collections: this.state.article_collections.concat(col)
        })
      },
      error: ()=>{
        debugger
      }
    })

  }

  getCollections = (e)=>{
    graphql(ARTICLE_COLLECTIONS, {
      appKey: this.props.app.key,
    }, {
      success: (data)=>{
        this.setState({
          article_collections: data.app.collections
        })
      }, 
      error: ()=>{

      }
    })
  }

  render(){
    const {isOpen} = this.state
    return <Paper 
         square={true}
         elevation={1}
         //className={classes.paper}
         >

           <Button 
             onClick={this.displayDialog}>
             new collection
           </Button>

           <FormDialog 
              open={isOpen}
              //contentText={"lipsum"}
              titleContent={"New Article Collection"}
              formComponent={
                <form ref="form">

                  <TextField
                    id="collection-title"
                    //label="Name"
                    placeholder={"Type collection's title"}
                    inputProps={{
                        style: {
                          fontSize: "1.4em"
                        }
                      }
                    }
                    //helperText="Full width!"
                    fullWidth
                    inputRef={ref => { this.titleRef = ref; }}
                    //defaultValue={this.state.article.title}
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
                    //defaultValue={this.state.article.description}
                    margin="normal"
                  />



                </form>
              }

              dialogButtons={
                <React.Fragment>
                  <Button onClick={this.close} color="primary">
                    Cancel
                  </Button>

                  <Button onClick={this.submitCreate.bind(this) } 
                    zcolor="primary">
                    {this.state.currentRule ? 'update' : 'create'}
                  </Button>

                </React.Fragment>
              }
          />


          <List 
            //className={classes.root}
            >
 
            {
              this.state.article_collections.map((item)=>{
                return  <ListItem key={item.id}>
                          {/*<ListItemAvatar>
                            <Avatar>
                              <ImageIcon />
                            </Avatar>
                          </ListItemAvatar>*/}
                          <ListItemText primary={item.title} 
                            secondary={item.description}
                          />
                          <Button>Edit</Button>
                          <Button>Delete</Button>
                        </ListItem>
              })
            }

          </List>

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
export default withRouter(connect(mapStateToProps)(Collections))
