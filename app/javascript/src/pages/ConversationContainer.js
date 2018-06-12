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


        <Route exact path={`/apps/${appId}/conversations/:id`} 
          render={(props)=>(
            <ConversationContainerShow
              appId={appId}
              {...props}
            />
        )} /> 


    </div>


  }
}

class ConversationContainerShow extends Component {

  constructor(props){
    super(props)
    this.state = {
      conversation: {},
      messages: [],
      app_user: {}
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

  getMainUser = (id)=> {
    axios.get(`/apps/${this.props.appId}/app_users/${id}.json`)
      .then( (response)=> {
        this.setState({
          app_user: response.data.app_user
        })
      })
      .catch( (error)=> {
        console.log(error);
      });
  }

  getMessages = ()=>{
    axios.get(`/apps/${this.props.appId}/conversations/${this.props.match.params.id}.json`, {
        email: this.props.email,
      })
      .then( (response)=> {
        this.setState({
          conversation: response.data.conversation,
          messages: response.data.messages
        }, ()=>{ 
          this.getMainUser(this.state.conversation.main_participant.id) 
        } )
      })
      .catch( (error)=> {
        console.log(error);
      });
  }

  render(){
    return <div>
          {
            this.state.messages.map( (o)=> {
              return <p>
                      {o.message} {o.user_id}
                     </p>
            })
          }

          <p>{this.state.app_user.email}</p>
          <p>{this.state.app_user.state}</p>
    </div>
  }
}