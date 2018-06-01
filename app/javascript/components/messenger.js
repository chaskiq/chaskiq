import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import actioncable from "actioncable"
import axios from "axios"


const App = {
  cable: actioncable.createConsumer()
}

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
          referrer: window.location,
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