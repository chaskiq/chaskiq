import React, {Component, createContext, Fragment} from 'react'
import actioncable from "actioncable"
import {
  Route,
  Link
} from 'react-router-dom'
import Moment from 'react-moment';
import PropTypes from 'prop-types';
import styled from 'styled-components';
//import Spinner from '@atlaskit/spinner';
//import EmptyState from '@atlaskit/empty-state'
import UserMap from "../components/map"
import logo from '../images/logo.png';
import ConversationContainer from './ConversationContainer';
import CampaignContainer from './Campaigns'
import AppSettingsContainer from './AppSettings'
import {parseJwt, generateJWT} from '../components/segmentManager/jwt'

import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import AppContent from '../components/segmentManager/container'


import AtTabs from '../components/tabs'
import graphql from "../graphql/client"
import { APP, SEGMENT, APP_USER} from "../graphql/queries"
import { 
  PREDICATES_SEARCH, 
  PREDICATES_CREATE, 
  PREDICATES_UPDATE, 
  PREDICATES_DELETE 
} from '../graphql/mutations'

import Dashboard from './Dashboard'
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button'

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { setApp } from '../actions/app'
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
} from '../actions/app_users'

import {
  getAppUser 
} from '../actions/app_user'

const CableApp = {
  cable: actioncable.createConsumer()
}
// Initialize a context
const Context = createContext()

// This context contains two interesting components
const { Provider, Consumer } = Context


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
      console.info("cambio match")
      this.init()
    }

    if (prevProps.segment.jwt !== this.props.segment.jwt) {
      console.info("cambio jwt")
      this.search()
    }

    if (prevProps.segment.id !== this.props.segment.id) {
      console.info("cambio segmento")
      this.fetchApp( ()=>{
        this.search()
      })
    }
  }

  init = () => {
    this.fetchApp(() => {
      this.search()
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
      setAppUser: this.setAppUser
      //fetchAppSegments: this.fetchAppSegments
    }
  }

  fetchApp = (cb)=>{
    const id = this.props.match.params.appId
    this.props.dispatch(setApp(id, ()=>{
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
          this.updateUser(data)
          console.log(`received ${data}`)
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
    console.log("REDUXIFY THIS!")
    data = JSON.parse(data)
    this.setState({app_users: this.state.app_users.map( (el)=> 
        el.email === data.email ? Object.assign({}, el, data) : el 
      )
    });
  }

  setAppUser = (id)=>{
    this.props.dispatch(getAppUser(id))
  }

  search = (page)=>{
    //this.setState({searching: true})
    // jwt or predicates from segment
    /*console.log(this.props.jwt)
    const jwtData = this.state.jwt ? parseJwt(this.props.jwt).data : this.props.segment.segment.predicates
    const predicates_data = { data: {
                                predicates: jwtData.filter( (o)=> o.comparison )
                              }
                            }
                            
    
    const options = {
      appKey: this.props.app.key,
      search: predicates_data,
      page: page || 1,
      jwt: this.props.jwt,
    }*/

    const options = {
      page: page || 1
    }

    this.props.dispatch(
      searchAppUsers(options, ()=>{
        
        // this.setState({
        //  segment: Object.assign({}, this.props.segment.segment, { predicates: jwtData })
        //})

      })
    )                      
    
    /*graphql(PREDICATES_SEARCH, {
      appKey: this.props.app.key,
      search: predicates_data,
      page: page || 1
    }, {
      success: (data)=>{
        console.log(data)
        const appUsers = data.predicatesSearch.appUsers
        //console.log(jwtData)
        this.setState({
          segment: Object.assign({}, this.state.segment, { predicates: jwtData }),
          app_users: appUsers.collection,
          meta: appUsers.meta,
          searching: false
        })
      },
      error: (error) => {
        debugger
      }
    }) */ 
  }

  fetchAppSegment =(id)=>{


    this.props.dispatch(
      fetchAppSegment(id, this.search )
    )

    /*graphql(SEGMENT, {
      appKey: this.props.app.key,
      id: parseInt(id)
    }, {
      success: (data)=>{
        this.setState({
          segment: data.app.segment,
          jwt: null
        }, this.search)
      },
      error: (error)=>{
        console.log(error);
      }
    })*/
  }

  updateSegment = (data, cb)=>{

   this.props.dispatch(
     updateSegment(this.props.segment.id, cb)
   )

    /*const params = {
      appKey: this.props.app.key,
      id: this.state.segment.id,
      predicates: this.state.segment.predicates
    }
    graphql(PREDICATES_UPDATE, params, {
      success: (data)=>{
        this.setState({
          segment: data.predicatesUpdate.segment,
          jwt: null
        }, () => cb ? cb() : null)
      },
      error: (error)=>{
      }
    })*/
  }

  createSegment = (data, cb)=>{

    const params = {
      name: data.input,
      operation: "create",
    }

    this.props.dispatch(
      createSegment(params, () => {
        const url = `/apps/${this.props.app.key}/segments/${this.props.segment.id}.json`
        this.props.history.push(url)
        cb ? cb() : null
      })
    )

    /*
    graphql(PREDICATES_CREATE, params, {
      success: (data)=>{
        this.setState({
          segment: data.predicatesCreate.segment,
          jwt: null
        }, () => {
        
          const url = `/apps/${this.props.app.key}/segments/${this.state.segment.id}.json`
          this.props.history.push(url)
          cb ? cb() : null
        })

      },
      error: (error)=>{

      }
    })
    */
  }

  deleteSegment = (id, cb)=>{

    this.props.dispatch(deleteSegment(id, ()=>{

      cb ? cb() : null
      const url = `/apps/${this.props.app.key}`
      this.props.history.push(url)
      this.fetchApp()

    }))

    /*
    graphql(PREDICATES_DELETE, {
      appKey: this.props.app.key,
      id: id
    }, {
      success: (data)=>{
        cb ? cb() : null
        const url = `/apps/${this.props.app.key}/segments/1`
        this.props.history.push(url)
        this.fetchApp()
      },
      error: (error)=>{

      }
    })*/
  }

  addPredicate = (data, cb)=>{

    const pending_predicate = {
      attribute: data.name,
      comparison: null,
      type: data.type,
      value: data.value
    }

    /*
    const new_predicates = this.state.segment.predicates.concat(pending_predicate)
    const jwtToken = generateJWT(new_predicates)
    //console.log(parseJwt(jwtToken))
    if(cb)
      cb(jwtToken)
    */

    this.props.dispatch(addPredicate(pending_predicate, (token)=>{
      cb ? cb(token) : null
      //this.setState({jwt: token})
    }))
    
  }

  updatePredicate= (data, cb)=>{

    this.props.dispatch(updatePredicate(data, (token)=>{
      cb ? cb(token) : null
      //this.setState({jwt: token})
    }))

    //const jwtToken = generateJWT(data)
    //console.log(parseJwt(jwtToken))
    //if(cb)
    //  cb(jwtToken)
    //this.setState({jwt: jwtToken})
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

    /*this.setState(
      { segment: {
        id: this.state.segment.id,
        predicates: data,
        jwt: null
      }} , ()=> this.updateSegment({}, this.fetchApp()) )*/
  }

  render(){
    const {classes} = this.props

    if(!this.props.app)
      return <p>loading this mdfk</p>
   
    return <div>

                            {/*<Provider value={{
                              store: {
                                //app: this.props.app,
                                //app_users: this.props.segment.collection,
                                //meta: this.props.segment.meta,
                                //searching: this.props.segment.searching,
                                //segment: this.props.segment.segment,
                                currentUser: this.props.currentUser
                              }, 
                              actions: this.actions() 
                            }}>*/}

      {
        this.props.app && this.props.app.key ?
        <div>
          <Route exact path={`${this.props.match.path}/segments/:segmentID/:Jwt?`}
            render={(props) => {
              return <Content>

                        <AppContent 
                          //{...props}
                          match={props.match}
                          history={props.history}
                          //app={this.props.app}
                          //store={{currentUser: this.props.currentUser }}
                          actions={this.actions()}
                          //segment={this.props.segment}
                          //app_users={this.props.app_users}
                          //meta={this.props.app_users.meta}
                          //searching={this.props.app_users.searching}
                        />
                  
                    </Content>
            }} 
            />

          <Route exact path={`${this.props.match.path}/conversations/:id?`}
            render={(props) => (
                  <ConversationContainer
                    //app={this.props.app}
                    //currentUser={this.props.currentUser}
                    actions={this.actions()}
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

          <Route path={`${this.props.match.path}/settings`}
            render={(props) => (
              <Consumer>
                {({ store, actions }) => (
                  <AppSettingsContainer
                    currentUser={this.props.current_user}
                    store={store}
                    actions={actions}
                    {...props}
                  />
                )}
              </Consumer>
            )} />

          <Route exact path={`/apps/${this.props.app.key}`}
              render={() => (
                <Dashboard/>
            )} 
          />
          <Route exact path={`/apps/${this.props.app.key}/campaings`}
            render={() => (
              <p>
              empty !!
              {/*<EmptyState {...this.emptyprops()} />*/}
              </p>
              
            )}
          />
        </div> : null
      }
 
    </div>
  }
}

function mapStateToProps(state) {

  const { auth, app, segment, app_user, current_user } = state
  const { loading, isAuthenticated } = auth
  return {
    current_user,
    app_user,
    segment,
    app,
    loading,
    isAuthenticated
  }
}

//export default ShowAppContainer

export default withRouter(connect(mapStateToProps)(ShowAppContainer))


