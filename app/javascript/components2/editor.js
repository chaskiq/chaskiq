import React, {Component, Fragment} from 'react'
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema, DOMParser} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
import {addListNodes} from "prosemirror-schema-list"
import {exampleSetup} from "prosemirror-example-setup"
import style from "prosemirror-view/style/prosemirror.css"
import Button from '@atlaskit/button';
import styled from 'styled-components';

const EditorActions = styled.div`
  box-sizing: border-box;
  -webkit-box-pack: end;
  justify-content: flex-end;
  -webkit-box-align: center;
  align-items: center;
  display: flex;
  padding: 12px 1px;
`

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks
})



class Editor extends Component {
  constructor(props){
    super(props)
    this.editor = undefined
  }

  componentDidMount(){
    this.initEditor("#editor")
  }

  initEditor = (selector) => {
    const json = '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"oijoijoipokpok"}]}]}'
    this.editor = new EditorView(document.querySelector(selector), {
        state: EditorState.create({
          doc: DOMParser.fromSchema(mySchema).parse(json),
          plugins: exampleSetup({schema: mySchema})
        })
      })
  }

  handleClick = (e)=>{
    JSON.stringify(this.editor.state.doc)
  }

  render (){
    return <Fragment>
            <div id="editor"/>
            <EditorActions>
                <Button onClick={this.handleClick.bind(this)} appearance={"primary"}>
                  Submit
                </Button>
            </EditorActions>
  
          </Fragment>
  }
}
    


export default Editor

