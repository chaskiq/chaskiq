import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { withRouter, Route } from 'react-router-dom'
import { connect } from 'react-redux'

import ContentHeader from '../../components/ContentHeader'
import Content from '../../components/Content'
import {
        Tab ,
        Tabs ,
        Avatar ,
        Typography,
        Button,
        TextField,
        Paper,
        Checkbox,
        FormControlLabel,
        Switch,
        ButtonGroup
      } from '@material-ui/core';

import gravatar from '../../shared/gravatar'

import MainSection from '../../components/MainSection';
import ContentWrapper from '../../components/ContentWrapper';

import ArticleEditor from './editor'

import {getFileMetadata, directUpload} from '../../shared/fileUploader'

//import {Link} from 'react-router-dom'

import graphql from '../../graphql/client'

import {
  CREATE_ARTICLE, 
  EDIT_ARTICLE,
  CREATE_DIRECT_UPLOAD,
  ARTICLE_BLOB_ATTACH,
  TOGGLE_ARTICLE,
  ARTICLE_ASSIGN_AUTHOR,
  ARTICLE_COLLECTION_CHANGE
} from '../../graphql/mutations'

import {
  ARTICLE,
  AGENTS,
  ARTICLE_COLLECTIONS
} from '../../graphql/queries'

import { withStyles } from '@material-ui/core/styles';


//import Loader from './loader'
import _ from "lodash"

import SuggestSelect from '../../shared/suggestSelect'

import SelectMenu from '../../components/selectMenu'
import GestureIcon from '@material-ui/icons/Gesture'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'

import styled from 'styled-components'
import {setCurrentPage} from '../../actions/navigation'
import ScrollableTabsButtonForce from '../../components/scrollingTabs'



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
    margin: '9em',
    padding: '1em',
    marginTop: '1.5em',
    paddingBottom: '6em'
  }
});


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
      setCurrentPage('Help Center')
    )
  }

  componentDidUpdate(prevProps, prevState){
    // maybe do this ony with content and submit 
    //checkbox and agent directly and independently from content
    if(prevState.content != this.state.content){
      this.setState({
        changesAvailable: true
      })
    }

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
        }, this.updateUrlFromNew)
      },
      error: ()=>{

      }
    })
  }

  editArticle = ()=>{
    graphql(EDIT_ARTICLE, {
      appKey: this.props.app.key,
      title: this.titleRef.value,
      id: this.state.article.id,
      content: this.state.content,
      lang: this.state
    }, {
      success: (data)=>{
        const article = data.createArticle.article
        this.setState({
          article: article,
          changesAvailable: false
        })
      },
      error: ()=>{

      }
    })
  }

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
    return <ButtonGroup variant="contained" color="secondary">
              <Button onClick={clickHandler}>
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
        this.setState({article: data.toggleArticle.article})
      }, 
      error: ()=>{
        debugger
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
        })
      },
      error: ()=>{

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
        })
      },
      error: ()=>{}
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

  handleLangChange = (lang)=>{
    this.setState({
      lang: lang,
      loading: true
    }, ()=>this.getArticle(this.state.article.id))
  }


  render() {
    const {classes} = this.props
    return (
       <React.Fragment>

       <Paper 
         square={true}
         elevation={1}
         className={classes.paper}>

       
        {
          !this.state.loading ? 

          <React.Fragment>

              <ScrollableTabsButtonForce 
              tabs={this.props.settings.availableLanguages} 
              changeHandler={(index)=> this.handleLangChange(this.props.settings.availableLanguages[index])}
            />

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
            />


            <TextField
              id="article-title"
              //label="Description"
              placeholder={"Describe your article to help it get found"}
              //helperText="Full width!"
              fullWidth
              multiline
              inputRef={ref => { this.descriptionRef = ref; }}
              defaultValue={this.state.article.description}
              margin="normal"
            />

          </React.Fragment>

           : null 
        }


        {
          !this.state.loading && this.state.article.author ? 
          <div style={{
            display: 'flex', 
            alignItems: 'center',
            marginTop: '2em',
            marginBottom: '2em'
          }}>
            
            <Avatar 
              src={gravatar( this.state.article.author.email )}
            />

            <strong style={{marginLeft: '9px', marginRight: '9px'}}>
              written by
            </strong>

            <div style={{ width: '300px'}}>
              <SuggestSelect 
                name={"author"}
                placeholder={"select author"}
                data={this.state.agents.map((o)=> ({ 
                    label: o.email, 
                    value: o.email 
                  }) 
                )}
                handleSingleChange={this.handleAuthorchange }
                defaultData={this.state.article.author.email}
              />
            </div>


            <strong style={{marginLeft: '9px', marginRight: '9px'}}>
              In
            </strong>

            <div style={{ width: '200px'}}>
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
                  this.state.article.collection.title ?  
                  this.state.article.collection.title : '--missing translations --'
                  : ""
                }
              />
            </div>


          </div>: null
        }

        <ArticleEditor 
           article={this.state.article} 
           data={this.props.data} 
           app={this.props.app}
           updateState={this.updateState}
           loading={this.state.loading}
           uploadHandler={this.uploadHandler}
        />

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


export default withRouter(connect(mapStateToProps)(withStyles(styles)(ArticlesNew)))
