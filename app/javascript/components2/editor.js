
import React from 'react'
import { Editor } from 'slate-react'
import { Value } from 'slate'
import Plain from 'slate-plain-serializer'
import Html from 'slate-html-serializer'
import styled from "styled-components"

const EditorContainer = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    min-height: 56px;
    max-height: 200px;
    border-top: 1px solid #e6e6e6;
`;

const EditorActions = styled.div`
  box-sizing: border-box;
  -webkit-box-pack: end;
  justify-content: flex-end;
  -webkit-box-align: center;
  align-items: center;
  display: flex;
  padding: 12px 1px;
`

const EditorWrapper = styled.div`
  /*height: 100px;
  display: flex;*/
  width: 80vw;
`

const Input = styled.div`
  padding: 18px 100px 20px 16px;
  /* width: 100%; */
  height: 100%;
  font-family: "Helvetica Neue","Apple Color Emoji",Helvetica,Arial,sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.33;
  background-color: #fff;
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: left;
}
`

const rules = [
  {
    deserialize(el, next) {
      if (el.tagName.toLowerCase() == 'p') {
        return {
          object: 'block',
          type: 'paragraph',
          data: {
            className: el.getAttribute('class'),
          },
          nodes: next(el.childNodes),
        }
      }
    },
    // Add a serializing function property to our rule...
    serialize(obj, children) {
      if (obj.object == 'block' && obj.type == 'paragraph') {
        return <p className={obj.data.get('className')}>{children}</p>
      }
    },
  },
]

const html = new Html({ rules })

const initialValue = Value.fromJSON({
  "document": {
    "nodes": [
      {
        "object": "block",
        "type": "paragraph",
        "nodes": [
          {
            "object": "text",
            "leaves": [
              {
                "text": ""
              }
            ]
          }
        ]
      }
    ]
  }
})

// Define our app...
export default class App extends React.Component {
  // Set the initial value when the app is first constructed.


  constructor(props){
    super(props)
    this.editor = null
    this.state = {
      value: initialValue
    }
  }

  onKeyDown = (event, editor, next) => {
    // Return with no changes if the keypress is not '&'

    if (event.key !== 'Enter')
      return next()

    this.sendContent(event, editor, next)

    /*if (event.key !== '&') return next()
   // Prevent the ampersand character from being inserted.
   event.preventDefault()
   // Change the value by inserting 'and' at the cursor's position.
   editor.insertText('and')*/
  }


  sendContent = (event, editor, next) => {
    console.log(Html)
    const content = html.serialize(this.state.value)

    this.props.insertComment(content, () => {
      this.setState({ value: initialValue })
    })
  }

  // On change, update the app's React state with the new editor value.
  onChange = ({ value }) => {
    console.log(value)
    this.setState({ value })
  }

  handleFocus = () => {

  }

  // Render the editor.
  render() {
    return <EditorWrapper onClick={this.handleFocus}>
      <EditorContainer>
        <Input>
          <Editor
            ref={(comp)=> this.editor = comp}
            value={this.state.value}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            placeholder={'type something...'}
          />
        </Input>
        
      </EditorContainer>
    </EditorWrapper>
  }
} 