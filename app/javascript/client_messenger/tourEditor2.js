
import React from 'react'
import styled from "styled-components"

const EditorContainer = styled.div`
    //position: absolute;
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
  //width: 80vw;
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

// Define our app...
export default class App extends React.Component {
  // Set the initial value when the app is first constructed.


  constructor(props){
    super(props)
  }

  // Render the editor.
  render() {
    return <EditorWrapper onClick={this.handleFocus}>
      <EditorContainer>
        <Input>
          <textarea/>
        </Input>
        
      </EditorContainer>
    </EditorWrapper>
  }
} 