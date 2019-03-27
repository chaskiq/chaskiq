// First, import `draftToMarkdown`
import { draftToMarkdown, markdownToDraft } from 'markdown-draft-js';
import React from 'react'
import ReactDOM from 'react-dom'

import styled from "@emotion/styled"

import {
  EditorState
} from "draft-js"

import {
  addNewBlock,
  resetBlockWithType,
  getCurrentBlock
} from 'Dante2/package/es/model/index.js'

import {
  getVisibleSelectionRect,
  convertFromRaw
} from 'draft-js'

import { getSelectionRect,
  getSelection,
  getSelectedBlockNode,
  getRelativeParent } from "Dante2/package/es/utils/selection.js"

import {add} from "../icons.js"

const MarkdownWrapper = styled.textarea`
    height: 200px;
    background: aliceblue;
    padding: 20px;
    width: 100%;
    clear:both;
`

export default class DanteMarkdownTooltip extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      position: { top: 0, left: 0 },
      show: false,
      scaled: false,
      scaledWidth: "0px",
      markdownText: "",
      focus: null
    }
    this.initialPosition = 0
  }

  componentDidMount(){
    this.convertMarkdown()
  }

  componentWillReceiveProps(newProps) {
    this.convertMarkdown()
  }

  display =(b)=> {
    if (b) {
      return this.show()
    } else {
      return this.hide()
    }
  }

  show = ()=> {
    return this.setState({
      show: true })
  }

  hide = ()=> {
    return this.setState({
      show: false })
  }

  setPosition =(coords)=> {
    return this.setState({
      position: coords })
  }

  relocate = ()=>{

    const { editorState } = this.props
    const currentBlock = getCurrentBlock(this.props.editorState)
    const blockType = currentBlock.getType()
    const block = currentBlock

    if (!editorState.getSelection().isCollapsed()){
      return
    }
  }

  convertMarkdown = ()=>{
    const raw_as_json = this.props.editor.emitSerializedOutput()
    const md = markdownString(raw_as_json)
    if(this.state.markdownText != md && !this.state.focus){
      console.log("no es!")
      this.setState( { markdownText: md } )      
    }

  }

  handleMarkdown = (e)=>{
    e.preventDefault()
    this.convertMarkdown()
  }

  handleChange = (e)=>{
    const markdown = markdownToDraft(
      this.refs.input.value, {
      //remarkablePreset: 'commonmark',
      //remarkableOptions: {
      //  html: true
      //}
    });

    const editorState = EditorState.createWithContent(
      convertFromRaw(markdown), this.props.decorator);
    
    this.setState({
      markdownText: e.target.value
    }, ()=> this.props.editor.onChange(editorState) )

  }

  render(){
    return (
      <div>
        
       <button onClick={this.handleMarkdown}>
         show markdown
       </button>

       <MarkdownWrapper 
         ref="input"
         onFocus={()=> this.setState({focus:true} )}
         onBlur={()=> this.setState({focus:false} )}
         onChange={this.handleChange}
         value={this.state.markdownText}>
       </MarkdownWrapper>

      </div>
    )
  }
}

export const DanteMarkdownConfig = (options={})=>{
  let config = {
    ref: 'markdown_tooltip',
    component: DanteMarkdownTooltip
  }
  return Object.assign(config, options)
}

const markdownString = (rawObject) =>{
  return draftToMarkdown(rawObject, {
 
     preserveNewlines: true,

     styleItems: {

      'code-block': {
        open: (block)=> {
          return '```' + (block.data.syntax || '') + '\n';
        },

        close: ()=> {
          return '\n```';
        }
      },

      'embed': {
        open: (block)=>{
          if(block.data.embed_data.toJS)
            return block.data.embed_data.toJS().media.html
          return block.data.embed_data.media.html
        },
        close: ()=>{
          return '\n'
        }
      },

      'video': {
        open: (block)=>{
          if(block.data.embed_data.toJS)
            return block.data.embed_data.toJS().media.html
          return block.data.embed_data.media.html
        },
        close: ()=>{
          return '\n'
        }
      },

      'divider': {
        open: ()=> {
          return '---';
        },

        close: ()=> {
          return '\n';
        }
      },

      image: {
        open:  (entity) => {

          let h = entity.data.aspect_ratio.height
          let w = entity.data.aspect_ratio.width
          let r = entity.data.aspect_ratio.ratio

          return `![${entity.text}](${entity.data.url}`
        },

         close:  (entity) => {
          return ')\n';
        }
      }

    }
  });
}