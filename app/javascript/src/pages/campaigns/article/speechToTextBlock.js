
import React from "react"
import axios from "axios"

import {
  EditorBlock,
  EditorState,
  ContentBlock,
  genKey ,
  CharacterMetadata
} from 'draft-js';
import { Map, List } from 'immutable';


import { 
  updateDataOfBlock, 
  addNewBlockAt , 
  resetBlockWithType,
  getDefaultBlockData
} from 'Dante2/package/es/model/index.js'

import styled from '@emotion/styled'

const StartButton = styled.a`
    border-radius: 50%;
    background-color: #ff5e5e;
    width: 50px;
    height: 50px;
    display: block;
    margin: 0 auto;
    cursor: pointer;
    text-align: center;
    box-shadow: ${props => props.recording ? 'inset -1px 1px 0px 0px #270101' : 'inset 0px -1px 0px 0px #270101'};
    svg{
      margin-top: 12px;
      fill: white;
      &:hover{
        fill: #222;
      }
    }

`
const RecorderWrapper = styled.div`
  margin: 0px auto;
  text-align: center;
` 

const RecorderLegend = styled.span`
  color: #797878;
  font-size: 0.789em;
  text-transform: uppercase;
  font-family: futura-pt;
`

const SpeechRecorderWrapper = styled.div`
  background: #ccc;
  padding: 20px;
  background: #fdffd4;
  padding: 21px;
  border: 1px solid #f0f1d9;
`

const DeleteSelf = styled.a`
    position: absolute;
    right: 10px;
    top: 1px;
`

const icon = ()=>{
  return <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'>
            <path fill="#00000070" d='M9.5 14c-1.93 0-3.5-1.57-3.5-3.5v-6c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5v6c0 1.93-1.57 3.5-3.5 3.5zM9.5 2c-1.378 0-2.5 1.122-2.5 2.5v6c0 1.378 1.122 2.5 2.5 2.5s2.5-1.122 2.5-2.5v-6c0-1.378-1.122-2.5-2.5-2.5z'
            />
            <path fill="#00000070" d='M16 10.5c0-0.276-0.224-0.5-0.5-0.5s-0.5 0.224-0.5 0.5c0 3.033-2.467 5.5-5.5 5.5s-5.5-2.467-5.5-5.5c0-0.276-0.224-0.5-0.5-0.5s-0.5 0.224-0.5 0.5c0 3.416 2.649 6.225 6 6.481v2.019h-1.5c-0.276 0-0.5 0.224-0.5 0.5s0.224 0.5 0.5 0.5h4c0.276 0 0.5-0.224 0.5-0.5s-0.224-0.5-0.5-0.5h-1.5v-2.019c3.351-0.256 6-3.065 6-6.481z'
            />
         </svg>
}

export default class SpeechToTextBlock extends React.Component {

  constructor(props) {
    super(props)
    console.log(props)
    this.state = {
      error: "",
      transcript: [],
      recording: false
    }
  }

  componentDidMount(){

    if (!('webkitSpeechRecognition' in window)) {
      alert("no speech recognition")
      //upgrade();
    } else {
      this.recognition = new window.webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onstart = (event)=> { 
        this.setState({
          recording: true
        })
      }

      this.recognition.onresult = (event)=> { 
        let res = []
        for (var i = 0; i < event.results.length; ++i) {
          res.push(event.results[i][0].transcript)
        }
        this.setState({
          transcript: res
        })
      }

      this.recognition.onerror = (event)=> { console.log(event) }
      this.recognition.onend = ()=> { 
         this.setState({
          recording: false
        })
      }
    }
  }

  deleteSelf = (e)=>{
    e.preventDefault()

    this.recognition.stop()

    const { block, blockProps } = this.props
    const { getEditorState, setEditorState } = blockProps
    const data = block.getData()
    const newData = data.merge(this.state)
    return setEditorState(this.resetBlockWithType2(getEditorState(), 'unstyled', {}, ""))
  }

  startButton = (e)=>{
    e.preventDefault()
    if(this.state.recording){
      this.recognition.stop()
    } else{
      this.recognition.start()
    }

  }

  resetRecorder = (e)=>{
    e.preventDefault()
    this.recognition.stop()
    this.setState({
      transcript: []
    })

  }

  convert = (e)=>{
    e.preventDefault()
    const { block, blockProps } = this.props
    const { getEditorState, setEditorState } = blockProps

    const data = block.getData()
    const newData = data.merge(this.state)

    this.recognition.stop()

    return setEditorState(
      this.resetBlockWithType2(getEditorState(), 
        'unstyled', 
        {}, 
        this.state.transcript.map((o)=>o).join(" ")
      ))
  }

  resetBlockWithType2 = (editorState, newType = "unstyled", data={} , txt) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const key = selectionState.getStartKey();
    const blockMap = contentState.getBlockMap();
    const block = blockMap.get(key);

    const text = txt; //block.getText();

    const emptyCharacterMetaDataList = Array(txt.length).fill(CharacterMetadata.create())

    const newBlock = block.merge({
      text: text,
      type: newType,
      data: getDefaultBlockData(newType, data),
      characterList: List(emptyCharacterMetaDataList)
    });

    const newContentState = contentState.merge({
      blockMap: blockMap.set(key, newBlock),
      selectionAfter: selectionState.merge({
        anchorOffset: 0,
        focusOffset: 0,
      }),
    });

    return EditorState.push(editorState, newContentState, 'change-block-type');
  };

  render(){
    return <SpeechRecorderWrapper>


            {
              !this.props.blockProps.getEditor().props.read_only ? 
              <DeleteSelf href="#" 
                className={"graf--media-embed-close"}
                onClick={this.deleteSelf}>
                x
              </DeleteSelf> : null
            }

            <RecorderWrapper>
              <StartButton id="start_button" 
                      className={`${this.state.recording ? 'recordingButton' : ''}`}
                      recording={this.state.recording}
                      onClick={(e)=>{this.startButton(e)}}>
                {icon()}
              </StartButton>

              <RecorderLegend>
                {
                  this.state.recording ? 
                  "stop dictation" :
                  "start dictation"
                }
              </RecorderLegend>

              {
                this.state.transcript.length > 0 ?
                <div className="d-flex justify-content-center">

                  <a onClick={this.convert} 
                    className="btn btn-success mr-1">
                    confirm
                  </a>

                  <a href="#" 
                    onClick={this.resetRecorder} 
                    className="btn btn-link">
                    or cancel
                  </a>
                </div> : null
              }
            </RecorderWrapper>

            {this.state.transcript.map((o)=>o)}

           {/* <EditorBlock { ...this.props }/>*/}

          </SpeechRecorderWrapper>
  }
}

export const SpeechToTextBlockConfig = (options={})=>{
  let config =  {
    title: 'speech to txt',
    type: 'speechToText',
    icon: icon,
    block: SpeechToTextBlock,
    editable: false,
    renderable: true,
    breakOnContinuous: true,
    wrapper_class: "graf graf--figure",
    selected_class: "is-selected is-mediaFocused",
    widget_options: {
      displayOnInlineTooltip: true,
      insertion: "insertion",
      insert_block: "speechToText"
    },
    options: {
    }
  }
  
  return Object.assign(config, options)
}


