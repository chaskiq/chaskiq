import React, {Component, createContext, Fragment} from 'react'
import actioncable from "actioncable"
import {
  Route,
  Link
} from 'react-router-dom'
import logo from '../images/logo.png';
import ConversationContainer from './ConversationContainer';
import CampaignContainer from './Campaigns'
import AppSettingsContainer from './AppSettings'
import Content from '../components/Content'
import AppContent from '../components/segmentManager/container'
import Snackbar from '../components/snackbar'
import Dashboard from './Dashboard'
import Articles from './Articles'
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button'
import LoadingView from '../components/loadingView'
import { withRouter, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import { 
  setApp, 
  updateApp
} from '../actions/app'

import {
  fetchAppSegment, 
  updateSegment,
  createSegment,
  deleteSegment,
  addPredicate,
  updatePredicate,
  deletePredicate
} from '../actions/segments'

import {
  searchAppUsers,
  updateAppUserPresence
} from '../actions/app_users'

import {
  getAppUser 
} from '../actions/app_user'

import {
  updateConversationItem,
  appendConversation
} from '../actions/conversations'

import ProfileView from '../pages/ProfileView'
import AgentProfileView from '../pages/AgentProfileView'
import Team from '../pages/TeamPage'
import BotContainer from './BotsContainer'
import Integrations from '../pages/Integrations'

import {
  camelizeKeys
} from '../actions/conversation'

const CableApp = {
  cable: actioncable.createConsumer() //(window.ws_cable_url)
}
// Initialize a context
const Context = createContext()

// This context contains two interesting components
const { Provider, Consumer } = Context

import {toggleDrawer} from '../actions/drawer'
import UserData from '../components/UserData'

import {appendMessage } from '../actions/conversation'


class ShowAppContainer extends Component {

  constructor(props){
    super(props)
    this.state = {
      //app_users: [], 
      //segment: {},
      //meta: {},
      //searching: false,
      //jwt: null,
      currentUser: this.props.currentUser
    }
  }

  emptyprops = ()=> {
    return {
      header: `${this.props.app.name}`,
      description: this.props.app.description || 'no description',
      imageUrl: logo, //,
      primaryAction,
      //secondaryAction,
      //tertiaryAction,
    }
  }

  componentDidMount() {
    this.init()
  }

  componentDidUpdate(prevProps, prevState) {
    // only update chart if the data has changed
    if (prevProps.app && prevProps.app.key !== this.props.app.key){
      this.eventsSubscriber(this.props.app.key)
    }

    if(prevProps.match.url !== this.props.match.url){
      this.init()
    }
  }

  init = () => {
    this.fetchApp(() => {
      this.eventsSubscriber(this.props.app.key)
    })
  }

  actions =()=>{
    return {
      fetchApp: this.fetchApp,
      eventsSubscriber: this.eventsSubscriber,
      fetchAppSegment: this.fetchAppSegment,
      getPredicates: this.getPredicates,
      updateSegment: this.updateSegment,
      updatePredicate: this.updatePredicate,
      savePredicates: this.savePredicates,
      addPredicate:   this.addPredicate,
      deletePredicate: this.deletePredicate,
      deleteSegment: this.deleteSegment,
      search: this.search,
      setAppUser: this.setAppUser,
      showUserDrawer: this.showUserDrawer
      //fetchAppSegments: this.fetchAppSegments
    }
  }

  fetchApp = (cb)=>{
    const id = this.props.match.params.appId
    this.props.dispatch(setApp(id, {
      success: ()=>{
        cb ? cb() : null 
      }
    }))
  }

  eventsSubscriber = (id)=>{
    // unsubscribe cable ust in case
    if(CableApp.events)
      CableApp.events.unsubscribe()

    CableApp.events = CableApp.cable.subscriptions.create({
      channel: "EventsChannel",
      app: id
    },
    {
        connected: ()=> {
          console.log("connected to events")
        },
        disconnected: ()=> {
          console.log("disconnected from events")
        },
        received: (data)=> {
          //console.log(`received`, data)
          switch(data.type){
            case "conversation_part":
              return this.props.dispatch(appendConversation(camelizeKeys(data.data)))
            case "presence":
              return this.updateUser(camelizeKeys(data.data))
            default:
              return null
          }
          
        },
        notify: ()=>{
          console.log(`notify!!`)
        },
        handleMessage: (message)=>{
          console.log(`handle message`)
        } 
      });

    window.cable = CableApp
  }

  updateUser = (data)=>{
    this.props.dispatch(updateAppUserPresence(data))
  }

  setAppUser = (id)=>{
    this.props.dispatch(getAppUser(id))
  }

  search = (page)=>{
    const options = {
      page: page || 1,

    }

    this.props.dispatch(
      searchAppUsers(options, ()=>{
        
        // this.setState({
        //  segment: Object.assign({}, this.props.segment.segment, { predicates: jwtData })
        //})

      })
    )                      
  }

  fetchAppSegment =(id)=>{
    this.props.dispatch(
      fetchAppSegment(id, 
        this.search 
      )
    )
  }

  updateSegment = (data, cb)=>{
   this.props.dispatch(
     updateSegment(this.props.segment.id, cb)
   )
  }

  createSegment = (data, cb)=>{

    const params = {
      name: data.input
    }

    this.props.dispatch(
      createSegment(params, () => {
        const url = `/apps/${this.props.app.key}/segments/${this.props.segment.id}.json`
        this.props.history.push(url)
        cb ? cb() : null
      })
    )
  }

  deleteSegment = (id, cb)=>{

    this.props.dispatch(deleteSegment(id, ()=>{

      cb ? cb() : null
      const url = `/apps/${this.props.app.key}`
      this.props.history.push(url)
      this.fetchApp()

    }))
  }

  addPredicate = (data, cb)=>{

    const pending_predicate = {
      attribute: data.name,
      comparison: null,
      type: data.type,
      value: data.value
    }
    this.props.dispatch(addPredicate(pending_predicate, (token)=>{
      //const url = `/apps/${this.props.app.key}/segments/${this.props.segment.id}?jwt`
      cb ? cb(token) : null
      //this.setState({jwt: token})
    }))

  }

  updatePredicate= (data, cb)=>{

    this.props.dispatch(updatePredicate(data, (token)=>{
      cb ? cb(token) : null
      //this.setState({jwt: token})
    }))
  }

  getPredicates= ()=>{
    return this.props.segment["predicates"] || []
  }

  savePredicates = (data, cb)=>{
    if(data.action === "update"){
      this.updateSegment(data, ()=> { 
        cb() 
        this.fetchApp() 
      })
    } else if(data.action === "new"){
      this.createSegment(data, ()=> { 
        cb() ; this.fetchApp() 
      })
    }
  }

  deletePredicate = (data)=>{

    this.props.dispatch(
      deletePredicate(data, 
        ()=> this.updateSegment({}, this.fetchApp()) 
      )
    )
  }

  showUserDrawer = (o)=>{
    this.props.dispatch(
      toggleDrawer({ rightDrawer: true }, ()=>{
        this.setAppUser(o)
      })
    )
  }

  hideUserDrawer = ()=>{
    this.props.dispatch(
      toggleDrawer({ rightDrawer: false }, ()=>{
      })
    )
  }

  toggleDrawer = (side, open) => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    this.props.dispatch(toggleDrawer({rightDrawer: open }))
  };

  render(){
    const {classes} = this.props

    if(!this.props.app)
      return <LoadingView/>
   
    return <div>
      
      <Snackbar/>

      <Drawer
        anchor="right" 
        open={this.props.drawer.rightDrawer} 
        onClose={this.toggleDrawer('rightDrawer', false)}>
        
        {
          this.props.app_user ? 
            <UserData 
              width={ '300px'}
              app={this.props.app}
              appUser={this.props.app_user} 
            /> 
            : null
        }

      </Drawer>

      {
        this.props.app && this.props.app.key ?
        <div>
        <Switch>
          <Route exact path={`${this.props.match.path}/segments/:segmentID/:Jwt?`}
            render={(props) => {
              return <Content>
                        <AppContent 
                          match={props.match}
                          history={props.history}
                          actions={this.actions()}
                        />
                  
                    </Content>
            }} 
            />

          <Route exact path={`${this.props.match.path}/conversations/:id?`}
            render={(props) => (
                  <ConversationContainer
                    actions={this.actions()}
                    events={CableApp.events}
                    {...props}
                  />
            )} 
          />

          <Route path={`${this.props.match.path}/messages/:message_type`}
            render={(props) => (
                  <CampaignContainer
                    currentUser={this.props.current_user}
                    actions={this.actions()}
                    classes={props.classes}
                    {...props}
                  />
            )} /> 
            
           <Route path={`${this.props.match.path}/bots`}
              render={(props) => (
                  <BotContainer
                    history={props.history}
                    currentUser={this.props.current_user}
                    classes={props.classes}
                    actions={this.actions()}
                    {...props}
                  />
            )} /> 

          <Route path={`${this.props.match.path}/settings`}
            render={(props) => (
              <AppSettingsContainer
                app={this.props.app}
                updateApp={updateApp}
                dispatch={this.props.dispatch}
                currentUser={this.props.current_user}
                {...props}
              />
            )}
          />

          <Route exact path={`${this.props.match.path}/users/:id`}
            render={(props) => (
              <ProfileView
                {...props}
              />
            )}
          />

          <Route exact path={`${this.props.match.path}/agents/:id`}
            render={(props) => (
              <AgentProfileView
                {...props}
              />
            )}
          />

          <Route path={`/apps/${this.props.app.key}/articles`}
            render={(props) => {
              return <Articles 
                        match={props.match}
                        history={props.history}
                      />
            }} 
          />

          <Route exact path={`/apps/${this.props.app.key}/campaings`}
            render={() => (
              <p>
              empty !!
              {/*<EmptyState {...this.emptyprops()} />*/}
              </p>
              
            )}
          />

          <Route exact path={`${this.props.match.path}/team`}
            render={(props) => {
              return <Team 
                        match={props.match}
                        history={props.history}
                        actions={this.actions()}
                      />
            }} 
          />

          <Route exact path={`${this.props.match.path}/integrations`}
          render={(props) => {
            return <Integrations 
                      match={props.match}
                      history={props.history}
                      actions={this.actions()}
                    />
            }} 
          />

          

          <Route exact path={`/apps/${this.props.app.key}`}
              render={(props) => (

                <Dashboard {...this.props} {...props}/>
            )} 
          />
         </Switch>

        </div> : null
      }
 
    </div>
  }
}

function mapStateToProps(state) {

  const { auth, app, segment, app_user, current_user, drawer } = state
  const { loading, isAuthenticated } = auth
  return {
    current_user,
    app_user,
    segment,
    app,
    loading,
    isAuthenticated,
    drawer
  }
}

//export default ShowAppContainer

export default withRouter(connect(mapStateToProps)(ShowAppContainer))


