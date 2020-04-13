import React, {Component} from 'react'
import { withRouter, Route, Switch, Link } from 'react-router-dom'
import { connect } from 'react-redux'

import Button from '../../../components/Button'
import TextField from '../../../components/forms/Input'
import List, {
  ListItem, 
  ListItemText,
  ItemListPrimaryContent,
  ItemListSecondaryContent,
} from '../../../components/List'
import ContentHeader from '../../../components/PageHeader'
import {AnchorLink} from '../../../shared/RouterLink'
import FormDialog from '../../../components/FormDialog'
import {setCurrentSection, setCurrentPage} from '../../../actions/navigation'
import ScrollableTabsButtonForce from '../../../components/scrollingTabs'
import langs from '../../../shared/langsOptions'

import graphql from '../../../graphql/client'
import {
  ARTICLE_COLLECTION_CREATE,
  ARTICLE_COLLECTION_EDIT,
  ARTICLE_COLLECTION_DELETE
} from '../../../graphql/mutations'

import {
  ARTICLE_COLLECTIONS,
  ARTICLE_SETTINGS
} from '../../../graphql/queries'

class Collections extends Component {

  state = {
    isOpen: false,
    article_collections: [],
    editCollection: null,
    openConfirm: false,
    languages: [],
    lang: 'en'
  }
  titleRef = null
  descriptionRef = null

  componentDidMount(){
    this.getCollections()
    this.props.dispatch(
      setCurrentSection('HelpCenter')
    )

    this.props.dispatch(
      setCurrentPage('Collections')
    )
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
          article_collections: this.state.article_collections.concat(col),
          isOpen: false
        })
      },
      error: ()=>{
        debugger
      }
    })

  }

  submitEdit = (e)=>{
    graphql(ARTICLE_COLLECTION_EDIT, {
      appKey: this.props.app.key, 
      title: this.titleRef.value, 
      description: this.descriptionRef.value,
      id: this.state.editCollection.id,
      lang: this.state.lang
    }, {
      success: (data)=>{
        const col = data.articleCollectionEdit.collection
        const newArticleCollection = this.state.article_collections.map((o, i)=>{
          if(o.id === col.id){
            return col
          }else{
            return o
          }
        })

        this.setState({
          article_collections: newArticleCollection,
          isOpen: false,
          editCollection: null
        })

      },
      error: ()=>{
        debugger
      }
    })
  }

  handleRemove = (item)=>{
    //confirm
  }

  getCollections = (e)=>{
    graphql(ARTICLE_COLLECTIONS, {
      appKey: this.props.app.key,
      lang: this.state.lang
    }, {
      success: (data)=>{
        this.setState({
          article_collections: data.app.collections,
        })
      }, 
      error: ()=>{

      }
    })
  }

  openEdit = (collection)=>{
    this.setState({
      editCollection: collection,
      isOpen: true
    })
  }

  requestDelete = (item)=>{
    this.setState({
      itemToDelete: item
    })
  }

  submitDelete = ()=>{

    graphql(ARTICLE_COLLECTION_DELETE, {
      appKey: this.props.app.key,
      id: this.state.itemToDelete.id
    }, {
      success: (data)=>{
        const col = data.articleCollectionDelete.collection
        const newCollection = this.state.article_collections.filter(
          (o)=> o.id != col.id
        )

        this.setState({
          openConfirm: false,
          itemToDelete: null,
          article_collections: newCollection
        })

      }
    })

    
  }

  handleLangChange = (o)=>{
    this.setState({
      lang: o
    }, this.getCollections)
  }

  closeItemToDelete = ()=>{
    this.setState({
      itemToDelete: null
    })
  }

  render(){
    const {isOpen, editCollection, itemToDelete} = this.state
    const {classes, app} = this.props
    return <React.Fragment>

          <ContentHeader 
            title={"collections"}
            breadcrumbs={
              [
                {
                  title: 'Help Center',
                  to: `/apps/${app.key}/articles`
                },
                {
                  title: 'Collections',
                  to: `/apps/${app.key}/articles/collections`
                }
              ]
            }
        />

          <div 
          square={true}
          elevation={1}
          >

            <div className="flex flex-row justify-end items-center">
              <Button 
                variant="contained" color="primary"
                onClick={this.displayDialog}>
                new collection
              </Button>
            </div>

            <FormDialog 
                open={isOpen}
                handleClose={this.close}
                //contentText={"lipsum"}
                titleContent={"New Article Collection"}
                formComponent={
                  <form ref="form">

                    <TextField
                      id="collection-title"
                      //label="Name"
                      type={'text'}
                      placeholder={"Type collection's title"}
                      inputProps={{
                          style: {
                            fontSize: "1.4em"
                          }
                        }
                      }
                      //helperText="Full width!"
                      fullWidth
                      ref={ref => { this.titleRef = ref; }}
                      defaultValue={ editCollection ? editCollection.title : null }
                      margin="normal"
                    />


                    <TextField
                      id="collection-description"
                      //label="Description"
                      type={'textarea'}
                      placeholder={"Describe your collection to help it get found"}
                      //helperText="Full width!"
                      fullWidth
                      multiline
                      ref={ref => { this.descriptionRef = ref; }}
                      defaultValue={ editCollection ? editCollection.description : null }
                      margin="normal"
                    />

                  </form>
                }

                dialogButtons={
                  <React.Fragment>
                    <Button onClick={this.close} color="secondary">
                      Cancel
                    </Button>

                    <Button 
                    
                      onClick={ editCollection ? 
                      this.submitEdit.bind(this) :
                      this.submitCreate.bind(this) 
                    } 
                      color="primary">
                      {editCollection ? 'Update' : 'Create'}
                    </Button>

                  </React.Fragment>
                }
            />


            {
              itemToDelete ? 
            
            <FormDialog 
                open={true}
                handleClose={this.closeItemToDelete}
                //contentText={"lipsum"}
                titleContent={"Confirm deletion ?"}
                formComponent={
                  <p>are you ready to delete ?</p>
                }

                dialogButtons={
                  <React.Fragment>
                    <Button onClick={this.closeItemToDelete} 
                      color="secondary">
                      Cancel
                    </Button>

                    <Button onClick={ this.submitDelete } 
                      color="primary">
                      Remove
                    </Button>

                  </React.Fragment>
                }
            /> : null
            }

            <ScrollableTabsButtonForce 
              //tabs={this.props.settings.availableLanguages} 
              tabs={this.props.settings.availableLanguages.map((o)=> langs.find((lang)=> lang.value === o) )} 
              changeHandler={(index)=> this.handleLangChange( this.props.settings.availableLanguages[index])}
            />

            <List 
              //className={classes.root}
              >
  
              {
                this.state.article_collections.map((item)=>{
                  return  <ListItem 
                            key={item.id} 
                            divider={true}>
                            {/*<ListItemAvatar>
                              <Avatar>
                                <ImageIcon />
                              </Avatar>
                            </ListItemAvatar>*/}
                            <ListItemText 
                              primary={
                                <ItemListPrimaryContent>
                                  <Link to={`/apps/${this.props.app.key}/articles/collections/${item.id}`}>
                                    {item.title}
                                  </Link>
                                </ItemListPrimaryContent>
                              } 
                              secondary={
                                <ItemListSecondaryContent>
                                  {item.description}
                                </ItemListSecondaryContent>
                                }
                            />

                            <Button
                              variant="outlined" color="primary" onClick={()=> this.openEdit(item)}>
                              Edit
                            </Button>

                            <Button
                              variant="text" color="primary" onClick={()=> this.requestDelete(item)}>
                              Delete
                            </Button>
                          </ListItem>
                })
              }

            </List>

          </div>
          </React.Fragment>
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
//export default withRouter(connect(mapStateToProps)(Collections))
export default withRouter(connect(mapStateToProps)(Collections))
