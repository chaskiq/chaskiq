import React, {Component, createContext, Fragment} from 'react'
import axios from "axios"
import actioncable from "actioncable"
import {
  Route,
  Link
} from 'react-router-dom'

export default class ConversationContainer extends Component {

  constructor(props){
    super(props)
    this.state = {
      conversations: []
    }
  }

  componentDidMount(){
    this.getConversations()
  }

  getConversations = (cb)=>{

    axios.get(`/apps/${this.props.match.params.appId}/conversations.json`, {})
      .then( (response)=> {
        this.setState({
          conversations: response.data.collection
        })
        cb ? cb() : null
      })
      .catch( (error)=>{
        console.log(error);
      });
  }


  render(){
    //console.log(this.props.match.path)
    const appId = this.props.match.params.appId
    return <div>
      
      conversations

      <ul>
        {
          this.state.conversations.map((o, i)=>{
            return <li key={o.id}>
                    <a onClick={(e)=> this.props.history.push(`/apps/${appId}/conversations/${o.id}`) }>
                      {o.id} - {o.main_participant.email}
                    </a>
                   </li>
          })
        }
      </ul>


        <Route exact path={`/apps/${appId}/conversations/:id?`} 
          render={(props)=>(
            <ConversationContainerShow
              appId={appId}
              {...props}
            />
        )} /> 


    </div>


  }
}

export class ConversationContainerShow extends Component {

  constructor(props){
    super(props)
    this.state = {
      conversation: {},
      messages: []
    }
  }

  componentDidMount(){
    this.getMessages()
  }

  componentDidUpdate(PrevProps, PrevState){
    console.log(this.props.match.params.id)
    console.log("sksksk", PrevProps)
    if(PrevProps.match && PrevProps.match.params.id !== this.props.match.params.id){
      this.getMessages()
    }
  }

  getMainUser = ()=> {
    // get main user information
  }

  getMessages = ()=>{
    axios.get(`/apps/${this.props.appId}/conversations/${this.props.match.params.id}.json`, {
        email: this.props.email,
      })
      .then( (response)=> {
        this.setState({
          conversation: response.data.conversation,
          messages: response.data.messages
        })
      })
      .catch( (error)=> {
        console.log(error);
      });
  }

  render(){
    return <div>
      {this.state.messages.map((o)=> <p>
          {o.message} {o.user_id}
        </p>)
      }
    </div>
  }
}