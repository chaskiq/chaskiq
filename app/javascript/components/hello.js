import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

import actioncable from "actioncable"

const App = {
  cable: actioncable.createConsumer()
}

class Messenger extends Component {

  constructor(props){
    super(props)
    this.eventsSubscriber()
  }

  eventsSubscriber(){
    App.events = App.cable.subscriptions.create({
      channel: "PresenceChannel",
      app: this.props.app_id,
      email: "miguel@prey.com"
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

  render(){
    return <div>
              Hello {this.props.name}!
              {this.props.app_id}
           </div>
  }
}

export default class Hermessenger {

  constructor(props){
    this.props = props
  }

  render(){
    document.addEventListener('DOMContentLoaded', () => {
      ReactDOM.render(
        <Messenger {...this.props} />,
        document.body.appendChild(document.createElement('div')),
      )
    })
  }
} 