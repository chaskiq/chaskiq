import React, {Component} from 'react'
import { withRouter, Route, Switch } from 'react-router-dom'
import { connect } from 'react-redux'

import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import ContentHeader from '../../../components/ContentHeader'
import {AnchorLink} from '../../../shared/RouterLink'

import FormDialog from '../../../components/FormDialog'
import {setCurrentSection, setCurrentPage} from '../../../actions/navigation'
import { withStyles } from '@material-ui/core/styles';

import ScrollableTabsButtonForce from '../../../components/scrollingTabs'
import langs from '../../../shared/langsOptions'


import graphql from '../../../graphql/client'
import {
  ARTICLE_COLLECTION_CREATE,
  ARTICLE_COLLECTION_EDIT,
  ARTICLE_COLLECTION_DELETE,
  ARTICLE_SECTION_CREATE,
  ARTICLE_SECTION_DELETE,
  REORDER_ARTICLE,
  ADD_ARTICLES_TO_COLLECTION,
  ARTICLE_SECTION_EDIT,
} from '../../../graphql/mutations'

import {
  ARTICLE_COLLECTIONS,
  ARTICLE_COLLECTION,
  ARTICLE_COLLECTION_WITH_SECTIONS,
  ARTICLES_UNCATEGORIZED
} from '../../../graphql/queries'

import Dnd from './dnd'


const styles = theme => ({
  addUser: {
    marginRight: theme.spacing(1),
  },
  paper: {
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(0),
    },
    [theme.breakpoints.up('md')]: {
      margin: theme.spacing(4),
    },
    //margin: '9em',
    padding: '1em',
    marginTop: '1.5em',
    paddingBottom: '6em'
  }
});

class CollectionDetail extends Component {

  state = {
    isOpen: false,
    addArticlesDialog: false,
    collection: null,
    lang: "en",
    languages: ["es", "en"],
    editSection: null
  }

  titleRef = null
  descriptionRef = null

  componentDidMount(){
    this.getCollection()
    this.props.dispatch(
      setCurrentSection('HelpCenter')
    )

    this.props.dispatch(
      setCurrentPage('Collections')
    )
  }

  getCollection = ()=>{
    graphql(ARTICLE_COLLECTION_WITH_SECTIONS, {
      appKey: this.props.app.key, 
      id: this.props.match.params.id,
      lang: this.state.lang
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

  allCollections = ()=>{
    const {collection} = this.state
    const baseSection = {
      id: "base",
      title: "base section",
      articles: collection.baseArticles,
    }
    
    // just concat base section if it's not present
    if(collection.sections.find((o)=> o.id === "base")){
      return collection.sections
    }else{
      return [baseSection].concat(collection.sections)  
    }
    
  }

  saveOperation = (options)=>{
    const params = Object.assign({}, options, {appKey: this.props.app.key})
    graphql(REORDER_ARTICLE, params , {
      success: (data)=>{
        
      },
      error: ()=>{
        
      }
    })
  }

  addArticlesToSection = (section)=>{
    this.setState({
      addArticlesDialog: true
    })
  }

  requestUpdate = (section)=>{
    this.setState({
      isOpen: true,
      editSection: section
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

                <Button variant="contained" 
                  color={'primary'}
                  onClick={this.openNewDialog}>
                  new section
                </Button>

                <Dnd sections={this.allCollections()}
                     handleDataUpdate={ this.handleDataUpdate }
                     deleteSection={this.deleteSection}
                     collectionId={collection.id}
                     saveOperation={this.saveOperation}
                     requestUpdate={this.requestUpdate}
                     addArticlesToSection={this.addArticlesToSection}
                />
              </div> : null 
            }
           </div>
  }

  deleteSection = (section)=>{
    graphql(ARTICLE_SECTION_DELETE, {
      appKey: this.props.app.key,
      id: `${section.id}`
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
      lang: this.state.lang
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

  submitEdit = ()=>{
    const {collection} = this.state
    graphql(ARTICLE_SECTION_EDIT, {
      appKey: this.props.app.key,
      collectionId: collection.id,
      title: this.titleRef.value,
      id: parseInt(this.state.editSection.id),
      lang: this.state.lang
      //description: this.descriptionRef
    }, 
    {
      success: (data)=>{
        const section = data.articleSectionEdit.section
        const sections = this.state.collection.sections.map((o)=> {
          if(o.id === section.id){
            return Object.assign({}, o, section)
          } else {
            return o
          }
        }) 
    
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
    const {isOpen, editSection} = this.state
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
                    defaultValue={ editSection ? editSection.title : null }
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
                    defaultValue={ editSection ? editSection.description : null }
                    margin="normal"
                  />



                </form>
              }

              dialogButtons={
                <React.Fragment>
                  <Button onClick={this.close} color="secondary">
                    Cancel
                  </Button>

                  <Button onClick={ editSection ? 
                    this.submitEdit.bind(this) :
                    this.submitCreate.bind(this) 
                  } 
                    color="primary">
                    Submit
                    {/*editCollection ? 'update' : 'create'*/}
                  </Button>

                </React.Fragment>
              }
          />
  }

  addArticlesHandlerSubmit = (items)=>{
    graphql(ADD_ARTICLES_TO_COLLECTION, {
      articlesId: items,
      appKey: this.props.app.key,
      collectionId: this.state.collection.id
    }, {
      success: (data)=>{
        const collection = data.addArticlesToCollection.collection
        if(collection){
          this.getCollection()
        }
      },
      error: ()=>{

      }
    })
  }

  renderAddToSectionDialog = ()=>{
    return <AddArticleDialog  
      app={this.props.app}
      handleSubmit={this.addArticlesHandlerSubmit} 
      isOpen={this.state.addArticlesDialog}
    />
  }

  // TODO refactor
  handleLangChange = (o)=>{
    this.setState({
      lang: o
    }, this.getCollection)
  }
  
  render(){
    const {classes, app} = this.props

    return <React.Fragment>
    
          <ContentHeader 
            breadcrumbs={
              [
              <AnchorLink className={classes.link} 
                color="inherit" to={`/apps/${app.key}/articles`}>
                Help Center
              </AnchorLink>,
              <AnchorLink className={classes.link} 
                color="inherit" to={`/apps/${app.key}/articles/collections`}>
                Collections
              </AnchorLink>
              ]
            }
          />
    
          <Paper 
            square={true}
            elevation={1}
            className={classes.paper}
            >

              <ScrollableTabsButtonForce 
                //tabs={this.props.settings.availableLanguages} 
                tabs={this.props.settings.availableLanguages.map((o)=> langs.find((lang)=> lang.value === o) )} 
                changeHandler={(index)=> this.handleLangChange( this.props.settings.availableLanguages[index] )}
              />

              { 
                this.renderDialog()
              }

              { this.state.addArticlesDialog ?
                this.renderAddToSectionDialog() : null
              }

              {
                this.state.loading ? 
                <CircularProgress/> : 
                this.renderCollection()
              }

          </Paper>
         </React.Fragment>
      }
}

class AddArticleDialog extends Component {

  state = {
    articles: [],
    isOpen: true
  }

  componentDidMount(){
    graphql(ARTICLES_UNCATEGORIZED,{
      appKey: this.props.app.key,
      page: 1,
      per: 50,
    }, {
      success: (data)=>{
        this.setState({
          articles: data.app.articlesUncategorized.collection
        })
      },
      error: ()=>{

      }
    })
  }

  close  = ()=> this.setState({isOpen: false})
  open  = ()=> this.setState({isOpen: true})

  getValues = ()=>{
    var chk_arr =  document.getElementsByName("article[]");
    var chklength = chk_arr.length;             
    var arr = []
    for(let k=0;k< chklength;k++)
    {
        if(chk_arr[k].checked) arr.push(chk_arr[k].value)
    }
    return arr
  }

  render(){
    const {isOpen} = this.state
    return <FormDialog 
              open={isOpen}
              //contentText={"lipsum"}
              titleContent={"Add Articles"}
              formComponent={
                <List>
                  {
                    this.state.articles.map((o)=>(
                      <ListItem>

                        <Checkbox
                          //checked={state.checkedA}
                          //onChange={handleChange('checkedA')}
                          value={o.id}
                          inputProps={{
                            'name': 'article[]',
                          }}
                        />

                      <ListItemText
                          primary={o.title}
                          secondary={
                            <Typography noWrap>
                              {o.state}
                            </Typography>
                          }
                        />
                      
                      </ListItem>
                    ))
                  }
                </List>
              }

              dialogButtons={
                <React.Fragment>
                  <Button onClick={this.close} color="secondary">
                    Cancel
                  </Button>

                  <Button onClick={ ()=> this.props.handleSubmit(this.getValues()) } 
                    color="primary">
                    Submit
                  </Button>

                </React.Fragment>
              }
          />
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
//export default withRouter(connect(mapStateToProps)(CollectionDetail))
export default withRouter(connect(mapStateToProps)(withStyles(styles)(CollectionDetail)))
