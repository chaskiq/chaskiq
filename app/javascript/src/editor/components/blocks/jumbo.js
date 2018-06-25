import React from 'react'
import ReactDOM from 'react-dom'
import { Map, List, OrderedSet } from 'immutable';

import { updateCharacterListOfBlock } from '../../model/index.js'

import { EditorBlock, CharacterMetadata } from 'draft-js'

export default class Jumbo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      enabled: false,
      data: this.props.blockProps.data.toJS()
    }
    this.placeholderRender = this.placeholderRender.bind(this)
  }

  componentDidMount() {

    var a = CharacterMetadata
    var o = OrderedSet

    setTimeout(()=>{
      const editorState = this.props.blockProps.getEditorState()
      const text = "Hello worldsjsjs"
      const { getEditorState, setEditorState } = this.props.blockProps
      const characterList = List([  
                               new a({entity: null, "style":OrderedSet(["CUSTOM_FONT_SIZE_52px"]) }),
                               new a({entity: null, "style":OrderedSet(["CUSTOM_FONT_SIZE_52px"]) }),
                               new a({entity: null, "style":OrderedSet(["CUSTOM_FONT_SIZE_52px"]) }),
                               new a({entity: null, "style":OrderedSet(["CUSTOM_FONT_SIZE_52px"]) }),
                               new a({entity: null, "style":OrderedSet(["CUSTOM_FONT_SIZE_52px"]) }),
                               new a({entity: null, "style":OrderedSet(["CUSTOM_FONT_SIZE_52px"]) }),
                               new a({entity: null, "style":OrderedSet(["CUSTOM_FONT_SIZE_52px"]) }),
                               new a({entity: null, "style":OrderedSet(["CUSTOM_FONT_SIZE_20px"]) }),
                               new a({entity: null, "style":OrderedSet(["CUSTOM_FONT_SIZE_20px"]) }),
                               new a({entity: null, "style":OrderedSet(["CUSTOM_FONT_SIZE_20px"]) }),
                               new a({entity: null, "style":OrderedSet(["CUSTOM_FONT_SIZE_20px"]) }),
                               new a({entity: null, "style":OrderedSet(["CUSTOM_FONT_SIZE_20px"]) }),
                               new a({entity: null, "style":OrderedSet(["CUSTOM_FONT_SIZE_20px"]) }),
                               new a({entity: null, "style":OrderedSet(["CUSTOM_FONT_SIZE_20px"]) }),
                            ])
      // setEditorState( updateCharacterListOfBlock(editorState, this.props.block, text) )
      setEditorState( updateCharacterListOfBlock(editorState, this.props.block, text, characterList) )      
      
    })
  }

  placeholderRender(){
    if (this.props.block.text.length === 0 ) {
      return  (
        <div className="public-DraftEditorPlaceholder-root">
          <div className="public-DraftEditorPlaceholder-inner">
            {"write something" }
          </div>
        </div>
      )
    }
  }

  render() {
    return (
      <div className="jumbotron">
        {this.placeholderRender()}
        <EditorBlock {...Object.assign({}, this.props, {
          "editable": true })
        } />
      </div>
    )
  }
}