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
import CircularProgress from '@material-ui/core/CircularProgress';


import MainSection from '../../components/MainSection';
import ContentWrapper from '../../components/ContentWrapper';

//import {Link} from 'react-router-dom'

import graphql from '../../graphql/client'
import {
  CREATE_ARTICLE, 
  EDIT_ARTICLE,
  CREATE_DIRECT_UPLOAD,
  ARTICLE_BLOB_ATTACH,
  TOGGLE_ARTICLE,
  ARTICLE_ASSIGN_AUTHOR
} from '../../graphql/mutations'

import {getFileMetadata, directUpload} from '../../shared/fileUploader'

import {
  ARTICLE,
  AGENTS
} from '../../graphql/queries'

import { withStyles } from '@material-ui/core/styles';

import { convertToHTML } from 'draft-convert'

import {
  CompositeDecorator,
  EditorState,
  convertToRaw,
  convertFromRaw,
  createEditorState,
  getVisibleSelectionRect,
  SelectionState
} from 'draft-js'
import MultiDecorator from 'draft-js-multidecorators'

import Dante from "Dante2"
import DanteEditor from 'Dante2/package/es/components/core/editor.js'

import { DanteImagePopoverConfig } from 'Dante2/package/es/components/popovers/image.js'
import { DanteAnchorPopoverConfig } from 'Dante2/package/es/components/popovers/link.js'
import { DanteInlineTooltipConfig } from 'Dante2/package/es/components/popovers/addButton.js' //'Dante2/package/es/components/popovers/addButton.js'
import { DanteTooltipConfig } from 'Dante2/package/es/components/popovers/toolTip.js' //'Dante2/package/es/components/popovers/toolTip.js'
import { ImageBlockConfig } from '../campaigns/article/image.js'
import { EmbedBlockConfig } from 'Dante2/package/es/components/blocks/embed.js'
import { VideoBlockConfig } from 'Dante2/package/es/components/blocks/video.js'
import { PlaceholderBlockConfig } from 'Dante2/package/es/components/blocks/placeholder.js'
import { VideoRecorderBlockConfig } from 'Dante2/package/es/components/blocks/videoRecorder'
import { CodeBlockConfig } from 'Dante2/package/es/components/blocks/code'
import { DividerBlockConfig } from "Dante2/package/es/components/blocks/divider";
import { ButtonBlockConfig } from "../../editor/components/blocks/button";

import Prism from 'prismjs';
import { PrismDraftDecorator } from 'Dante2/package/es/components/decorators/prism'

import { GiphyBlockConfig } from '../campaigns/article/giphyBlock'
import { SpeechToTextBlockConfig } from '../campaigns/article/speechToTextBlock'
//import { DanteMarkdownConfig } from './article/markdown'
import Link from 'Dante2/package/es/components/decorators/link'
import findEntities from 'Dante2/package/es/utils/find_entities'

//import Loader from './loader'
import _ from "lodash"


import {ThemeProvider} from 'styled-components'
import EditorStyles from 'Dante2/package/es/styled/base'

//import EditorContainer from '../../components/conversation/editorStyles'
import theme from '../../components/conversation/theme'

import SuggestSelect from '../../shared/suggestSelect'

import SelectMenu from '../../components/selectMenu'
import GestureIcon from '@material-ui/icons/Gesture'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'

import styled from 'styled-components'
import {setCurrentPage} from '../../actions/navigation'

const EditorStylesExtend = styled(EditorStyles)`

  line-height: 2em;
  font-size: 1.2em; 

  .graf--p{
    line-height: 2em;
    font-size: 1.2em; 
  }

  .dante-menu{
    z-index: 2000;
  }

  blockquote {
    margin-left: 20px;
  }
`

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

const defaultProps = {
  content: null,
  read_only: false,
  spellcheck: false,
  title_placeholder: "Title",
  body_placeholder: "Write your story",

  default_wrappers: [
    { className: 'graf--p', block: 'unstyled' },
    { className: 'graf--h2', block: 'header-one' },
    { className: 'graf--h3', block: 'header-two' },
    { className: 'graf--h4', block: 'header-three' },
    { className: 'graf--blockquote', block: 'blockquote' },
    { className: 'graf--insertunorderedlist', block: 'unordered-list-item' },
    { className: 'graf--insertorderedlist', block: 'ordered-list-item' },
    { className: 'graf--code', block: 'code-block' },
    { className: 'graf--bold', block: 'BOLD' },
    { className: 'graf--italic', block: 'ITALIC' },
    { className: 'graf--divider', block: 'divider' }
  ],

  continuousBlocks: [
    "unstyled",
    "blockquote",
    "ordered-list",
    "unordered-list",
    "unordered-list-item",
    "ordered-list-item",
    "code-block"
  ],

  key_commands: {
      "alt-shift": [{ key: 65, cmd: 'add-new-block' }],
      "alt-cmd": [{ key: 49, cmd: 'toggle_block:header-one' },
                  { key: 50, cmd: 'toggle_block:header-two' },
                  { key: 53, cmd: 'toggle_block:blockquote' }],
      "cmd": [{ key: 66, cmd: 'toggle_inline:BOLD' },
              { key: 73, cmd: 'toggle_inline:ITALIC' },
              { key: 75, cmd: 'insert:link' },
              { key: 13, cmd: 'toggle_block:divider' }
      ]
  },

  character_convert_mapping: {
    '> ': "blockquote",
    '*.': "unordered-list-item",
    '* ': "unordered-list-item",
    '- ': "unordered-list-item",
    '1.': "ordered-list-item",
    '# ': 'header-one',
    '##': 'header-two',
    '==': "unstyled",
    '` ': "code-block"
  },

}

class ArticlesNew extends Component {

  state = {
    currentContent: null,
    content: null,
    article: {},
    changed: false,
    loading: true,
    agents: []
  };

  titleRef = null
  descriptionRef = null
  switch_ref = null

  componentDidMount(){
    if(this.props.match.params.id != "new"){
      this.getArticle(parseInt(this.props.match.params.id))      
    } else {
      this.setState({
        loading: false
      })
    }

    this.getAgents()

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

  getArticle = (id)=>{
    graphql(ARTICLE, {
      appKey: this.props.app.key, 
      id: id
    }, {
      success: (data)=>{
        this.setState({
          article: data.app.article, 
          loading: false
        })
      },
      error: ()=>{

      }
    })
  }

  emptyContent = () => {
    return { 
      "entityMap": {},
      "blocks": [
        { "key": "f1qmb", "text": "", "type": "unstyled", "depth": 0, "inlineStyleRanges": [], "entityRanges": [], "data": {} }, 
      ] 
    }
  }

  defaultContent = () => {
    try {
      return JSON.parse(this.state.article.content.serialized_content) || this.emptyContent()
    } catch (error) {
      return this.emptyContent()
    }
  }

  tooltipsConfig = () => {

    const inlineMenu = {
      selectionElements: [
        "unstyled",
        "blockquote",
        "ordered-list",
        "unordered-list",
        "unordered-list-item",
        "ordered-list-item",
        "code-block",
        'header-one',
        'header-two',
        'header-three',
        'header-four',
        'footer',
        'column',
        'jumbo',
        'button'
      ],
    }

    const menuConfig = Object.assign({}, DanteTooltipConfig(), inlineMenu)

    return [
      DanteImagePopoverConfig(),
      DanteAnchorPopoverConfig(),
      DanteInlineTooltipConfig(),
      menuConfig,
      //DanteMarkdownConfig()
    ]
  }

  decorators = (context) => {
    return (context) => {
      return new MultiDecorator([
        PrismDraftDecorator({
          prism: Prism,
          defaultSyntax: 'javascript'
        }),
        new CompositeDecorator(
          [{
            strategy: findEntities.bind(null, 'LINK', context),
            component: Link
          }]
        ),
        //generateDecorator("hello")

      ])
    }
  }

  generateDecorator = (highlightTerm) => {
    const regex = new RegExp(highlightTerm, 'g');
    return new CompositeDecorator([{
      strategy: (contentBlock, callback) => {
        console.info("processing entity!", this.state.incomingSelectionPosition.length)
        if (this.state.incomingSelectionPosition.length > 0) {

          findSelectedBlockFromRemote(
            this.state.incomingSelectionPosition,
            contentBlock,
            callback
          )
        }
        /*if (highlightTerm !== '') {
          findWithRegex(regex, contentBlock, callback);
        }*/
      },
      component: this.searchHighlight,
    }])
  };

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

  widgetsConfig = () => {
    return [CodeBlockConfig(),
    ImageBlockConfig({
      options: {
        upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
        upload_handler: this.uploadHandler,
        image_caption_placeholder: "type a caption (optional)"
      }
    }),
    DividerBlockConfig(),
    EmbedBlockConfig({
      breakOnContinuous: true,
      editable: true,
      options: {
        placeholder: "put an external links",
        endpoint: `/oembed?url=`
      }
    }),
    VideoBlockConfig({
      breakOnContinuous: true,
      options: {
        placeholder: "put embed link ie: youtube, vimeo, spotify, codepen, gist, etc..",
        endpoint: `/oembed?url=`,
        caption: 'optional caption'
      }
    }),
    PlaceholderBlockConfig(),
    VideoRecorderBlockConfig({
      options: {
        seconds_to_record: 20000,
        upload_url: `/attachments.json?id=${this.props.data.id}&app_id=${this.props.app.key}`,
      }
    }),
    GiphyBlockConfig(),
    SpeechToTextBlockConfig(),
    ButtonBlockConfig()
    ]
  
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

  saveHandler = (context, content, cb) => {

    const exportedStyles = context.editor.styleExporter(context.editor.getEditorState())

    let convertOptions = {

      styleToHTML: (style) => {
        if (style === 'BOLD') {
          return <b />;
        }
        if (style === 'ITALIC') {
          return <i />;
        }
        if (style.includes("CUSTOM")) {
          const s = exportedStyles[style].style
          return <span style={s} />
        }
      },
      blockToHTML: (block, oo) => {

        if (block.type === "unstyled") {
          return <p className="graf graf--p" />
        }
        if (block.type === "header-one") {
          return <h1 className="graf graf--h2" />
        }
        if (block.type === "header-two") {
          return <h2 className="graf graf--h3" />
        }
        if (block.type === "header-three") {
          return <h3 className="graf graf--h4" />
        }
        if (block.type === "blockquote") {
          return <blockquote className="graf graf--blockquote" />
        }
        if (block.type === "button" || block.type === "unsubscribe_button") {
          const { href, buttonStyle, containerStyle, label } = block.data
          const containerS = containerStyle ? styleString(containerStyle.toJS ? containerStyle.toJS() : containerStyle) : ''
          const buttonS = containerStyle ? styleString(buttonStyle.toJS ? buttonStyle.toJS() : buttonStyle) : ''
          return {
            start: `<div style="width: 100%; margin: 18px 0px 47px 0px">
                        <div 
                          style="${containerS}">
                          <a href="${href}"
                            className="btn"
                            target="_blank"
                            ref="btn"
                            style="${buttonS}">`,
            end: `</a>
                  </div>
                </div>`}
        }
        if (block.type === "card") {
          return {
            start: `<div class="graf graf--figure">
                  <div style="width: 100%; height: 100px; margin: 18px 0px 47px">
                    <div class="signature">
                      <div>
                        <a href="#" contenteditable="false">
                          <img src="${block.data.image}">
                          <div></div>
                        </a>
                      </div>
                      <div class="text" 
                        style="color: rgb(153, 153, 153);
                              font-size: 12px; 
                              font-weight: bold">`,
            end: `</div>
                    </div>
                  <div class="dante-clearfix"/>
                </div>
              </div>`
          }
        }
        if (block.type === "jumbo") {
          return {
            start: `<div class="graf graf--jumbo">
                  <div class="jumbotron">
                    <h1>` ,
            end: `</h1>
                  </div>
                </div>`
          }
        }
        if (block.type === "image") {
          const { width, height, ratio } = block.data.aspect_ratio.toJS ? block.data.aspect_ratio.toJS() : block.data.aspect_ratio
          const { url } = block.data
          
          return {
            start: `<figure class="graf graf--figure">
                  <div>
                    <div class="aspectRatioPlaceholder is-locked" style="max-width: 1000px; max-height: ${height}px;">
                      <div class="aspect-ratio-fill" 
                          style="padding-bottom: ${ratio}%;">
                      </div>

                      <img src="${url}" 
                        class="graf-image" 
                        contenteditable="false"
                      >
                    <div>
                  </div>

                  </div>
                  <figcaption class="imageCaption">
                    <span>
                      <span data-text="true">`,
            end: `</span>
                    </span>
                  </figcaption>
                  </div>
                </figure>`
          }
        }
        if (block.type === "column") {
          return <div class={`graf graf--column ${block.data.className}`} />
        }
        if (block.type === "footer") {

          return {
            start: `<div class="graf graf--figure"><div ><hr/><p>`,
            end: `</p></div></div>`
          }
        }

        if (block.type === "embed") {
          if (!block.data.embed_data)
            return

          let data = null

          // due to a bug in empbed component
          if (typeof (block.data.embed_data.toJS) === "function") {
            data = block.data.embed_data.toJS()
          } else {
            data = block.data.embed_data
          }

          if (data) {
            return <div class="graf graf--mixtapeEmbed">
              <span>
                {
                  data.images[0].url ?
                    <a target="_blank" class="js-mixtapeImage mixtapeImage"
                      href={block.data.provisory_text}
                      style={{ backgroundImage: `url(${data.images[0].url})` }}>
                    </a> : null 
                }
                <a class="markup--anchor markup--mixtapeEmbed-anchor"
                  target="_blank"
                  href={block.data.provisory_text}>
                  <strong class="markup--strong markup--mixtapeEmbed-strong">
                    {data.title}
                  </strong>
                  <em class="markup--em markup--mixtapeEmbed-em">
                    {data.description}
                  </em>
                </a>
                {data.provider_url}
              </span>
            </div>
          } else {
            <p />
          }
        }

        if (block.type === "video"){
          
          if (!block.data.embed_data)
            return

          let data = null

          // due to a bug in empbed component
          if (typeof (block.data.embed_data.toJS) === "function") {
            data = block.data.embed_data.toJS()
          } else {
            data = block.data.embed_data
          }

          return {
            start: `<figure class="graf--figure graf--iframe graf--first" tabindex="0">
                      <div class="iframeContainer">
                        ${data.html}
                      </div>
                      <figcaption class="imageCaption">
                        <div class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
                          <span>
                          <span>
                          ${block.data.provisory_text}
                          </span>
                          </span>
                        </div>
                      </figcaption>
                    `,
            end: `</figure>`
          }
        }

        if (block.type === "recorded-video") {

          return (<figure className="graf--figure graf--iframe graf--first" tabindex="0">
                      <div className="iframeContainer">
                        <video 
                          autoplay={false} 
                          style={{width:"100%" }}
                          controls={true} 
                          src={block.data.url}>
                        </video>
                      </div>
                      <figcaption className="imageCaption">
                        <div className="public-DraftStyleDefault-block public-DraftStyleDefault-ltr">
                          <span>
                          {block.text}
                          </span>
                        </div>
                      </figcaption>
                   
            </figure> )
        }
        

        if ("atomic") {
          return <p />
        }

        if (block.type === 'PARAGRAPH') {
          return <p />;
        }
      },
      entityToHTML: (entity, originalText) => {
        if (entity.type === 'LINK') {
          return <a href={entity.data.url}>{originalText}</a>;
        }
        return originalText;
      }
    }

    let html3 = convertToHTML(convertOptions)(context.editorState().getCurrentContent())

    const serialized = JSON.stringify(content)
    const plain = context.getTextFromEditor(content)

    if(this.props.data.serialized_content === serialized)
      return

    this.setState({
      status: "saving...",
      statusButton: "success"
    })

    this.setState({
      content: {
        html: html3,
        serialized: serialized
      }
    })

    if (cb)
      cb(html3, plain, serialized)
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
      id: parseInt(this.state.article.id),
      content: this.state.content
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

  decodeEditorContent = (raw_as_json) => {
    const new_content = convertFromRaw(raw_as_json)
    return EditorState.createWithContent(new_content)
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
      id: parseInt(this.state.article.id),
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
          </div>: null
        }

         <ThemeProvider theme={theme}>
           <EditorStylesExtend campaign={true}>


             {
               !this.state.loading ?
             
                <DanteEditor
                  {...defaultProps}
                  debug={false}
                  data_storage={
                    {
                      url: "/",
                      save_handler: this.saveHandler
                    }
                  }
                  onChange={(e) => {
                    this.dante_editor = e
                    const newContent = convertToRaw(e.state.editorState.getCurrentContent()) //e.state.editorState.getCurrentContent().toJS()
                    this.menuResizeFunc = getVisibleSelectionRect
                    const selectionState = e.state.editorState.getSelection();

                    this.setState({
                      currentContent: newContent,
                      selectionPosition: selectionState.toJSON() //this.menuResizeFunc(window),
                    })

                  }}
                  content={this.defaultContent()}
                  tooltips={this.tooltipsConfig()}
                  widgets={this.widgetsConfig()}
                  decorators={(context) => {
                    return new MultiDecorator([
                      //this.generateDecorator("hello"),
                      PrismDraftDecorator({ prism: Prism }),
                      new CompositeDecorator(
                        [{
                          strategy: findEntities.bind(null, 'LINK', context),
                          component: Link
                        }]
                      )

                    ])
                  }
                  }
                /> : <CircularProgress/>
            }

           </EditorStylesExtend>
         </ThemeProvider>

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
