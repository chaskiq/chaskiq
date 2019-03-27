import React, {Component} from "react"

import DemoApp from '../../editor'
import _ from "lodash"
import axios from 'axios'
import styled from 'styled-components'
import {convertToHTML} from 'draft-convert'
import Lozenge from '@atlaskit/lozenge';
import Button from '@atlaskit/button';

const EditorContainer = styled.div`
  //overflow: auto;
  //height: 60vh;
  width: 100%;

  padding: 57px;
  background: #f9f8f8;
`

const ButtonsContainer = styled.div`
  display: flex;
  direction: column;
  align-items: center;
  justify-content: space-between;
  width: 32%;
  float: right;
  margin: 4px 4px;
`

const ButtonsRow = styled.div`
  width: 100%;
  clear: both;
  margin: 0px;
`

const styleString = (obj)=>{
  return Object.keys(obj).map((o)=> { 
    return `${_.snakeCase(o).replace("_", "-")}: ${obj[o]} `
  }).join("; ")
}

const blockWithLineBreak = (block) =>{
  return block.getText().split('\n').join("<br/>")
}

const save_handler = (context, content, cb)=>{
  
  const exportedStyles = context.editor.styleExporter(context.editor.getEditorState())

  let convertOptions = {

    styleToHTML: (style) => {
      if (style === 'BOLD') {
        return <b/>;
      }
      if (style === 'ITALIC') {
        return <i/>;
      }
      if (style.includes("CUSTOM")){
        const s = exportedStyles[style].style
        return <span style={s} />
      }
    },
    blockToHTML: (block, oo) => {
     
      if (block.type === "unstyled"){
        return <p class="graf graf--p"/>
      }
      if (block.type === "header-one"){
        return <h1 class="graf graf--h2"/>
      }
      if (block.type === "header-two"){
        return <h2 class="graf graf--h3"/>
      }
      if (block.type === "header-three"){
        return <h3 class="graf graf--h4"/>
      }
      if (block.type === "blockquote"){
        return <blockquote class="graf graf--blockquote"/>
      }
      if (block.type === "button" || block.type === "unsubscribe_button"){
        const {href, buttonStyle, containerStyle, label} = block.data
        return {start: `<div style="width: 100%; margin: 18px 0px 47px 0px">
                        <div 
                          style="${styleString(containerStyle)}">
                          <a href="${href}"
                            className="btn"
                            ref="btn"
                            style="${styleString(buttonStyle)}">`,
                end: `</a>
                  </div>
                </div>`}
      }
      if (block.type === "card"){
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
      if (block.type === "jumbo"){
        return {
          start: `<div class="graf graf--jumbo">
                  <div class="jumbotron">
                    <h1>` ,
          end: `</h1>
                  </div>
                </div>`
        }
      }
      if (block.type === "image"){
        const {width, height, ratio} = block.data.aspect_ratio
        const {url } = block.data
        return {
          start: `<figure class="graf graf--figure">
                  <div>
                    <div class="aspectRatioPlaceholder is-locked" style="max-width: 1000px; max-height: 723.558px;">
                      <div class="aspect-ratio-fill" 
                          style="padding-bottom: ${ratio}%;">
                      </div>

                      <img src="${url}" 
                        height=${height} 
                        width=${width} 
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
      if (block.type === "column"){
        return <div class={`graf graf--column ${block.data.className}`}/>
      }
      if (block.type === "footer"){
        
        return {
                start:`<div class="graf graf--figure"><div ><hr/><p>`,
                end: `</p></div></div>`
              }
      }

      if(block.type === "embed"){
        if(!block.data.embed_data)
          return

        let data = null

        // due to a bug in empbed component
        if(typeof(block.data.embed_data.toJS) === "function"){
          data = block.data.embed_data.toJS()  
        } else {
          data = block.data.embed_data
        }
        
        if( data ){
          return <div class="graf graf--mixtapeEmbed">
                  <span>
                    <a target="_blank" class="js-mixtapeImage mixtapeImage" 
                      href={block.data.provisory_text} 
                      style={{backgroundImage: `url(${data.images[0].url})` }}>
                    </a>
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
        } else{
          <p/>
        }
      }
      if ("atomic"){
        return <p/>
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

  console.log(html3)
  if(cb)
    cb(html3, plain, serialized)
}

export default class CampaignEditor extends Component {

  constructor(props){
    super(props)

    this.state = {
      data: {},
      status: "",
      statusButton: "inprogress"
    }

    this.save_url = this.props.url //window.location.pathname
  }

  save_handler = (html, plain, serialized)=>{
    
    this.setState({
      status: "saving...",
      statusButton: "success"
    })

    axios.put(`${this.save_url}.json`, {
      campaign: {
        html_content: html,
        serialized_content: serialized
      }
    })
    .then((response)=>{
      console.log(response)
      this.setState({data: response.data, status: "saved"})
    }).catch((err)=>{
      console.log(err)
    })
  }

  successStoreHandler = (response)=>{
    var data = response.data
  }

  emptyContent = ()=>{
    return {"entityMap":{},"blocks":[{"key":"761n6","text":"Write something","type":"header-one","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"f1qmb","text":"","type":"unstyled","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}},{"key":"efvk7","text":"Dante2 Inc.\nSantiago, Chile\nYou Received this email because you signed up on our website or made purchase from us.","type":"footer","depth":0,"inlineStyleRanges":[{"offset":0,"length":114,"style":"CUSTOM_FONT_SIZE_13px"},{"offset":0,"length":114,"style":"CUSTOM_COLOR_#8d8181"}],"entityRanges":[],"data":{}},{"key":"7gh7t","text":"Unsubscribe","type":"unsubscribe_button","depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{"enabled":false,"fill":"fill","displayPopOver":true,"data":{},"href":"http://mailerlite.com/some_unsubscribe_link_here","border":"default","forceUpload":false,"containerStyle":{"textAlign":"left","margin":"0px 13px 0px 0px"},"label":"click me","float":"left","buttonStyle":{"color":"#fff","backgroundColor":"#3498db","padding":"6px 12px","display":"inline-block","fontFamily":"Helvetica","fontSize":13,"float":"none","border":"1px solid #3498db"}}}]}
  }

  defaultContent = ()=>{
    try {
      return JSON.parse(this.props.data.serialized_content) || this.emptyContent()
    } catch (error) {
      return this.emptyContent()
    }
  }

  handleSend = (e)=>{
    axios.get(`${this.save_url}/deliver.json`)
    .then((response)=>{
      console.log(response)
    }).catch((err)=>{
      console.log(err)
    })
  }

  render(){
    return <EditorContainer>

            <ButtonsRow>
              <ButtonsContainer>
                <Lozenge appearance={this.state.statusButton} isBold>
                  {this.state.status}
                </Lozenge>

                <Button appearance="default" onClick={(e)=> {
                    window.open(`${window.location.pathname}/preview`,'_blank');
                  }  
                }>
                  Preview
                </Button>

                <Button appearance="default" onClick={(e)=> {console.log('test')}}>
                  Test
                </Button>

                <Button appearance="primary" onClick={this.handleSend}>
                  Send
                </Button>
              </ButtonsContainer>
            </ButtonsRow>

            <hr style={{clear: "both", border: '1px solid #ebecf0'}}/>

            <div id="campaign-editor">
              <div style={{
                  background: 'white', 
                  padding: '34px'
                }}>
                <DemoApp
                  content={this.defaultContent()}
                  config={
                    {
                      api_key: "86c28a410a104c8bb58848733c82f840",
                      debug: true,
                      oembed_uri: "/oembed?url=",
                      read_only: false,
                      upload_url: `${window.location.pathname}/attachments.json`,
                      //renderDraggables: window.parent.window.renderDraggables,
                      data_storage: {
                        save_handler: (context, content)=>{ 
                          save_handler(context, content, this.save_handler) 
                        },
                        url: `${window.location}`,
                        method: "PUT",
                        success_handler: this.successStoreHandler,
                      }
                    }
                  }
                />
              </div>
            </div>
           </EditorContainer>
  }
}
