import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter, Route } from 'react-router-dom'
import { connect } from 'react-redux'
import Avatar from '@material-ui/core/Avatar' 
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Paper from '@material-ui/core/Paper'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import ContentHeader from '../../components/ContentHeader'
import ArticleEditor from './editor'

import graphql from '../../graphql/client'

import {
  CREATE_ARTICLE, 
  EDIT_ARTICLE,
  ARTICLE_BLOB_ATTACH,
  TOGGLE_ARTICLE,
  ARTICLE_ASSIGN_AUTHOR,
  ARTICLE_COLLECTION_CHANGE,
} from '../../graphql/mutations'

import {
  ARTICLE,
  AGENTS,
  ARTICLE_COLLECTIONS
} from '../../graphql/queries'

import { withStyles } from '@material-ui/core/styles';

import SuggestSelect from '../../shared/suggestSelect'

import {AnchorLink} from '../../shared/RouterLink'
import SelectMenu from '../../components/selectMenu'
import GestureIcon from '@material-ui/icons/Gesture'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import {setCurrentSection, setCurrentPage} from '../../actions/navigation'
import ScrollableTabsButtonForce from '../../components/scrollingTabs'
import langs from '../../shared/langsOptions'

import {errorMessage, successMessage} from '../../actions/status_messages'
import styled from '@emotion/styled'

const options = [
  {
    title: 'Published',
    description: 'shows article on the help center',
    icon: <CheckCircleIcon/>,
    id: 'published',
    state: 'published'
  },
  {
    title: 'Draft',
    description: 'hides the article on the help center',
    icon: <GestureIcon/>,
    id: 'draft',
    state: 'draft'
  },
];

const styles = theme => ({
  addUser: {
    marginRight: theme.spacing(1),
  },
  paper: {
    /*margin: '9em',
    padding: '1em',
    marginTop: '1.5em',
    paddingBottom: '6em'*/
    //margin: theme.spacing(2)
  }
});

const ArticleAuthorControls = styled.div`
  display: flex; 
  align-items: center;
  margin-top: 2em;
  margin-bottom: 2em;
  @media (min-width: 320px) and (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
`


class ArticlesNew extends Component {

  state = {
    currentContent: null,
    content: null,
    article: {},
    changed: false,
    loading: true,
    agents: [],
    collections: [],
    lang: "en"
  };

  titleRef = null
  descriptionRef = null
  switch_ref = null

  componentDidMount(){
    if(this.props.match.params.id != "new"){
      this.getArticle(this.props.match.params.id)      
    } else {
      this.setState({
        loading: false
      })
    }

    this.getAgents()
    this.getCollections()

    this.props.dispatch(
      setCurrentSection('HelpCenter')
    )

    this.props.dispatch(setCurrentPage("Articles"))
  }

  componentDidUpdate(prevProps, prevState){
    // maybe do this ony with content and submit 
    //checkbox and agent directly and independently from content
    if(prevState.content != this.state.content){
      this.registerChange()
    }

  }

  registerChange = ()=>{
    this.setState({
      changesAvailable: true
    })
  }

  getCollections = ()=>{
    graphql(ARTICLE_COLLECTIONS, {
      appKey: this.props.app.key
    }, {
      success: (data)=>{
        this.setState({
          collections: data.app.collections
        })
      },
    })
  }

  getArticle = (id)=>{
    graphql(ARTICLE, {
      appKey: this.props.app.key, 
      id: id,
      lang: this.state.lang
    }, {
      success: (data)=>{
        this.setState({
          article: data.app.article, 
          loading: false
        })
      },
      error: ()=>{
        debugger
      }
    })
  }

  updateUrlFromNew = ()=>{
    this.props.history.push(`/apps/${this.props.app.key}/articles/${this.state.article.id}`)
  }

  getAgents = ()=>{
    graphql(AGENTS, {
      appKey: this.props.app.key
    }, {
      success: (data)=>{
        this.setState({
          agents: data.app.agents
        })
      },
      error: ()=>{

      }
    })
  }

  createArticle = ()=>{
    graphql(CREATE_ARTICLE, {
      appKey: this.props.app.key,
      title: this.titleRef.value,
      content: this.state.content
    }, {
      success: (data)=>{
        const article = data.createArticle.article
        this.setState({
          article: article,
          changesAvailable: false
        }, ()=>{
          this.updateUrlFromNew()
          this.updatedMessage()
        })
      },
      error: ()=>{
        this.errorMessage()
      }
    })
  }

  editArticle = ()=>{
  
    graphql(EDIT_ARTICLE, {
      appKey: this.props.app.key,
      title: this.titleRef.value,
      description: this.descriptionRef.value,
      id: this.state.article.id,
      content: this.state.content,
      lang: this.state.lang
    }, {
      success: (data)=>{
        const article = data.editArticle.article
        this.setState({
          article: article,
          changesAvailable: false
        }, ()=>{
          this.updatedMessage()
        })
      },
      error: (e)=>{
        this.errorMessage()
      }
    })
  }

  updatedMessage = ()=> {this.props.dispatch(successMessage("article updated"))}
  errorMessage = ()=> {this.props.dispatch(successMessage("article error on save"))}

  submitChanges = ()=>{
    console.log(this.state.article)
    this.setState({
      changesAvailable: false
    }, ()=>{
      if(this.state.article.id){
        this.editArticle()
      } else {
        this.createArticle()
      }
    })
  }

  toggleButton = (clickHandler)=>{
    const stateColor = this.state.article.state === "published" ? "primary" : "secondary"
    return <ButtonGroup variant="outlined" color={stateColor}>
              <Button onClick={clickHandler}>
               { 
                 this.state.article.state === "published" ? 
                   <CheckCircleIcon/> : <GestureIcon/> 
                }
                {this.state.article.state}
              </Button>
              <Button
                color="primary"
                variant="contained"
                size="small"
                //aria-owns={open ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
                onClick={clickHandler}
              >
                <ArrowDropDownIcon />
              </Button>
           </ButtonGroup>
  }

  togglePublishState = (state)=>{
    graphql(TOGGLE_ARTICLE,{
      appKey: this.props.app.key,
      id: this.state.article.id,
      state: state
    }, {
      success: (data)=>{
        this.setState({article: data.toggleArticle.article}, ()=>{
          this.updatedMessage()
        })
      }, 
      error: ()=>{
        this.errorMessage()
      }
    })
  }

  handleAuthorchange = (email)=>{
    graphql(ARTICLE_ASSIGN_AUTHOR, {
      appKey: this.props.app.key,
      authorId: email,
      id: this.state.article.id 
    }, {
      success: (data)=>{
        this.setState({
          article: data.assignAuthor.article
        }, ()=>{
          this.updatedMessage()
        })
      },
      error: ()=>{
        this.errorMessage()
      }
    })
  }

  handleCollectionChange = (collectionId)=>{
    graphql(ARTICLE_COLLECTION_CHANGE, {
      appKey: this.props.app.key,
      collectionId: collectionId,
      id: this.state.article.id
    }, {
      success: (data)=>{
        this.setState({
          article: data.changeCollectionArticle.article
        }, ()=>{
          this.updatedMessage()
        })
      },
      error: ()=>{
        this.errorMessage()
      }
    })
  }

  updateState = (data)=>{
    this.setState(data)
  }

  uploadHandler = ({serviceUrl, signedBlobId, imageBlock})=>{
 
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
  }

  handleLangChange = (lang)=>{
    this.setState({
      lang: lang,
      loading: true
    }, ()=>this.getArticle(this.state.article.id))
  }

  handleInputChange = (e)=>{
    this.registerChange()
  }


  render() {
    const {classes, app} = this.props
    return (

      <React.Fragment>

        <ContentHeader 
          //title={ 'Help Center Settings' }
          breadcrumbs={
            [
            <AnchorLink className={classes.link} 
              color="inherit" to={`/apps/${app.key}/articles`}>
              Help Center
            </AnchorLink>,
            <Typography color="inherit">{this.state.article.title}</Typography>
            ]
          }
        />

        <Grid container justify={"center"} spacing={4}>
          <Grid item xs={12} sm={10}>

          <Paper 
            square={true}
            elevation={1}
            className={classes.paper}
            >
            <Box m={2}>
            
              <Box mb={2}>
                  <ScrollableTabsButtonForce 
                    //tabs={this.props.settings.availableLanguages} 
                    tabs={this.props.settings.availableLanguages.map((o)=> langs.find((lang)=> lang.value === o) )} 
                    changeHandler={(index)=> this.handleLangChange(this.props.settings.availableLanguages[index])}
                  />
                </Box>
            
              {
                !this.state.loading ? 

                <React.Fragment>
                  

                  <div style={{
                    display: 'flex',
                    justifyItems: 'self-end',
                    justifyContent: 'space-between'
                  }}>

                    <Button
                      variant="contained"
                      onClick={this.submitChanges}
                      disabled={!this.state.changesAvailable}
                      color={'primary'}>
                      Save
                    </Button>

                    <SelectMenu options={options} 
                      handleClick={(e)=> this.togglePublishState(e.state) } 
                      toggleButton={this.toggleButton}
                      selected={this.state.article.state}
                    />
                    
                    {/*<FormControlLabel
                      control={
                        <Switch
                          defaultChecked={this.state.article.state === "published" }
                          //onChange={this.handleHiddenChange}
                          value="hidden"
                          color="primary"
                          inputRef={(ref)=> this.switch_ref = ref }
                        />
                      }
                      label={this.state.article.state}
                    />*/}

                  </div>

                  <TextField
                    id="article-title"
                    //label="Name"
                    placeholder={"Type articles's title"}
                    inputProps={{
                        style: {
                          fontSize: "2.4em"
                        }
                      }
                    }
                    //helperText="Full width!"
                    fullWidth
                    inputRef={ref => { this.titleRef = ref; }}
                    defaultValue={this.state.article.title}
                    margin="normal"
                    onChange={this.handleInputChange}
                  />


                  <TextField
                    id="article-description"
                    //label="Description"
                    placeholder={"Describe your article to help it get found"}
                    //helperText="Full width!"
                    fullWidth
                    multiline
                    inputRef={ref => { this.descriptionRef = ref; }}
                    defaultValue={this.state.article.description}
                    margin="normal"
                    onChange={this.handleInputChange}
                  />

                </React.Fragment>

                : null 
              }


              {
                !this.state.loading && this.state.article.author ? 
                <ArticleAuthorControls>

                  {
                    this.state.agents.length > 0 ?
                      <div style={{ 
                        width: '300px',
                        display: 'flex', 
                        alignItems: 'center'
                      }}>

                      <Avatar 
                        src={ this.state.article.author.avatarUrl}
                      />
                        
                        <strong style={{
                          marginLeft: '9px', 
                          marginRight: '9px',
                          width: '110px'  
                        }}>
                          written by
                        </strong>

                        <SuggestSelect 
                          name={"author"}
                          placeholder={"select author"}
                          data={this.state.agents.map((o)=> ({ 
                              label: o.name || o.email, 
                              value: o.email 
                            }) 
                          )}
                          handleSingleChange={this.handleAuthorchange }
                          defaultData={this.state.article.author.email}
                        />
                      </div> : null 
                  }

                  <div style={{ 
                    width: '200px', 
                    display: 'flex', 
                    alignItems: 'center'
                  }}>

                    <strong style={{marginLeft: '9px', marginRight: '9px'}}>
                      In
                    </strong>

                    <SuggestSelect 
                      name={"collection"}
                      placeholder={"select collection"}
                      data={this.state.collections.map((o)=> ({ 
                          label: o.title, 
                          value: o.id 
                        }) 
                      )}
                      handleSingleChange={ this.handleCollectionChange }

                      defaultData={
                        this.state.article.collection ? 
                        this.state.article.collection.id : null
                      }
                    />
                  </div>


                </ArticleAuthorControls>: null
              }


              <Box mb={2} p={2} style={{background: "#fff"}}>

                {
                  !this.state.loading &&
                
                  <ArticleEditor 
                    article={this.state.article} 
                    data={this.props.data} 
                    app={this.props.app}
                    updateState={this.updateState}
                    loading={false}
                    uploadHandler={this.uploadHandler}
                  />
                }
              </Box>

            </Box>

          </Paper>

          </Grid>
          
        </Grid>

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


export default withRouter(connect(mapStateToProps)(withStyles(styles)(ArticlesNew)))
