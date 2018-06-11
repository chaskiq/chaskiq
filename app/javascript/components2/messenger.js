import React, {Component, Fragment} from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import actioncable from "actioncable"
import axios from "axios"
import styled from 'styled-components';
import Avatar from '@atlaskit/avatar';
import Button from '@atlaskit/button';

//import Editor from './editor.js'
import UnicornEditor from './editor3.js'
//import Editor2 from './editor2.js'
//import {Editor} from '@atlaskit/editor-core';


// https://stackoverflow.com/questions/12114356/how-to-get-the-request-timezone
const App = {
  cable: actioncable.createConsumer()
}

const Container = styled.div`
  /* -ms- properties are necessary until MS supports the latest version of the grid spec */
  /* stylelint-disable value-no-vendor-prefix, declaration-block-no-duplicate-properties */
  display: -ms-grid;
  display: grid;
  -ms-grid-columns: auto 1fr;
  /* stylelint-enable */
  grid-template:
    'avatar-area editor-area'
    / auto 1fr;
  padding-top: 16px;
  position: relative;

  &:first-child,
  &:first-of-type {
    padding-top: 0;
  }
`;

const AvatarSection = styled.div`
  /* stylelint-disable value-no-vendor-prefix */
  -ms-grid-row: 1;
  -ms-grid-column: 1;
  /* stylelint-enable */
  grid-area: avatar-area;
  margin-right: 8px;
`;

const EditorSection = styled.div`
  /* stylelint-disable value-no-vendor-prefix */
  -ms-grid-row: 1;
  -ms-grid-column: 2;
  /* stylelint-enable */
  grid-area: editor-area;
`;

const EditorWrapper = styled.div`
  width: 340px;
  position: fixed;
  right: 14px;
  bottom: 0px;
`

const EditorActions = styled.div`
  box-sizing: border-box;
  -webkit-box-pack: end;
  justify-content: flex-end;
  -webkit-box-align: center;
  align-items: center;
  display: flex;
  padding: 12px 1px;
`

class Messenger extends Component {

  constructor(props){
    super(props)
    this.eventsSubscriber = this.eventsSubscriber.bind(this)
    this.ping = this.ping.bind(this)
  }

  componentDidMount(){
    this.ping(()=> this.eventsSubscriber() )
  }

  eventsSubscriber(){
    App.events = App.cable.subscriptions.create({
      channel: "PresenceChannel",
      app: this.props.app_id,
      email: this.props.email,
      properties: this.props.properties
    },
    {
        connected: ()=> {
          console.log("connected to presence")
        },
        disconnected: ()=> {
          console.log("disconnected from presence")
        },
        received: (data)=> {
          console.log(`received ${data}`)
        },
        notify: ()=>{
          console.log(`notify!!`)
        },
        handleMessage: (message)=>{
          console.log(`handle message`)
        } 
      });

  }

  ping(cb){
    axios.post(`/api/v1/apps/${this.props.app_id}/ping`, {
        user_data: {
          referrer: window.location.path,
          email: this.props.email,
          properties: this.props.properties
        }
      })
      .then(function (response) {
        console.log("subscribe to events")
        cb()
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  insertComment(comment, cb){

    debugger

  }

  componentDidMount(){
    //console.log(Editor)
    //Editor("#editor")
  }


  render(){
    return <EditorWrapper>
                <Container>
                  <AvatarSection>
                    <Avatar
                      name={this.props.email}
                      size="medium"
                      src={`https://api.adorable.io/avatars/24/${encodeURIComponent(
                        this.props.email,
                      )}.png`}
                    />
                  </AvatarSection>
                  
                  <EditorSection>
                    Hello {this.props.name}!
                    {this.props.app_id}
                    
                    <UnicornEditor 
                      insertComment={this.insertComment}
                    />
                  
                  </EditorSection>
                </Container>
              
           </EditorWrapper>
  }
}

export default class Hermessenger {

  constructor(props){
    this.props = props
  }

  render(){
    //document.addEventListener('DOMContentLoaded', () => {
      ReactDOM.render(
        <Messenger {...this.props} />,
        document.getElementById("root")
      )
      
    //})
  }


} 