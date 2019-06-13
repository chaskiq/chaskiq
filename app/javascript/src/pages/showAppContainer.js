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
import {
  InlineFilterDialog, 
  SegmentItemButton,
  SaveSegmentModal
} from '../components/segmentManager'

import AtTabs from '../components/tabs'
import graphql from "../graphql/client"
import { APP, SEGMENT, APP_USER} from "../graphql/queries"
import { 
  PREDICATES_SEARCH, 
  PREDICATES_CREATE, 
  PREDICATES_UPDATE, 
  PREDICATES_DELETE 
} from '../graphql/mutations'
import UserData from '../components/UserData'
import EnhancedTable from '../components/table'
import DataTable from '../components/dataTable'
import ContentHeader from '../components/ContentHeader'
import Content from '../components/Content'
import {appUsersFormat} from '../components/segmentManager/appUsersFormat'
import Dashboard from './Dashboard'
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button'

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { setApp } from '../actions/app'
import {searchAppUsers} from '../actions/app_users'

const CableApp = {
  cable: actioncable.createConsumer()
}
// Initialize a context
const Context = createContext()

// This context contains two interesting components
const { Provider, Consumer } = Context

const Wrapper = styled.div`
  //min-width: 600px;
`;



const ButtonGroup = styled.div`
  display: inline-flex;
  display: -webkit-box;
  button {
    margin-right: 5px !important;
  }
`

class AppUsers extends Component {
  constructor(props){
    super(props)
    this.state = {
      map_view: false,
      rightDrawer: false,
      selectedUser: null,
    }
    this.toggleMap = this.toggleMap.bind(this)
    this.toggleList = this.toggleList.bind(this)
  }

  toggleMap = (e)=>{
    this.setState({map_view: false  })
  }

  toggleList = (e)=>{
    this.setState({map_view: true  })
  }

  handleClickOnSelectedFilter = (jwtToken)=>{
    const url = `/apps/${this.props.app.key}/segments/${this.props.store.segment.id}/${jwtToken}`
    this.props.history.push(url) 
  }

  getTextForPredicate = (o)=>{
    if(o.type === "match"){
      return `Match ${o.value === "and" ? "all" : "any" } criteria`
    }else{
      return `Match: ${o.attribute} ${o.comparison ? o.comparison : '' } ${o.value ? o.value : ''}`
    }
  }

  caption = ()=>{
    return <div>
            <ButtonGroup>
              {
                this.props.actions.getPredicates().map((o, i)=>{
                    return <SegmentItemButton 
                            key={i}
                            index={i}
                            predicate={o}
                            predicates={this.props.actions.getPredicates()}
                            open={ !o.comparison }
                            appearance={ o.comparison ? "primary" : "default"} 
                            text={this.getTextForPredicate(o)}
                            updatePredicate={this.props.actions.updatePredicate}
                            predicateCallback={(jwtToken)=> this.handleClickOnSelectedFilter.bind(this)}
                            deletePredicate={this.props.actions.deletePredicate}                          
                           />
                })
              }

              <InlineFilterDialog {...this.props} 
                handleClick={ this.handleClickOnSelectedFilter.bind(this)}
                addPredicate={this.props.actions.addPredicate}
              />

              <SaveSegmentModal 
                title="Save Segment" 
                segment={this.props.store.segment}
                savePredicates={this.props.actions.savePredicates}
                predicateCallback={()=> {
                  const url = `/apps/${this.props.app.key}/segments/${this.props.store.segment.id}`
                  this.props.history.push(url)
                }}
                deleteSegment={this.props.actions.deleteSegment}
              />

            </ButtonGroup>

            {
              /*
                <hr/>

                <div style={{float: "right"}}>
                  <ButtonGroup>
                    
                    {dropdown()}

                    <Button 
                      isLoading={false} 
                      onClick={this.toggleMap.bind(this)}
                      isSelected={!this.state.map_view}>
                      <i className="fas fa-list"></i>
                      {" "}
                      List
                    </Button>

                    <Button 
                      isSelected={this.state.map_view}
                      isLoading={false} 
                      onClick={this.toggleList.bind(this)}>
                      <i className="fas fa-map"></i>
                      {" "}
                      Map
                    </Button>

                  </ButtonGroup>
                </div>

                <span>Users {this.props.meta['total_count']}</span>
                
                <hr/>              
              */
            }

           </div>
  }

  showUserDrawer = (e)=>{
    this.setState({ rightDrawer: true }, ()=>{
      this.getUserData(e[0])
    });
  }

  toggleDrawer = (side, open) => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    this.setState({rightDrawer: open });
  };

  getUserData = (id)=>{

    graphql(APP_USER, {
        appKey: this.props.app.key, 
        id: id
      }, 
      {
        success: (data)=>{
          this.setState({
            selectedUser: data.app.appUser
          })
      },
      error: ()=>{

      }
    })
  }

  render(){
    
    return <Wrapper>

            {this.caption()}

            <DataTable 
              title={this.props.segment.name}
              columns={appUsersFormat()} 
              meta={this.props.meta}
              data={this.props.app_users}
              search={this.props.actions.search}
              loading={this.props.searching}
              onRowClick={(e)=>{
                this.showUserDrawer(e)
              }}
            />

            <Drawer 
              anchor="right" 
              open={this.state.rightDrawer} 
              onClose={this.toggleDrawer('right', false)}>
              
              {
                this.state.selectedUser ? 
                  <UserData width={ '300px'}
                    appUser={this.state.selectedUser} /> : null
              }

            </Drawer>
    
          </Wrapper>
  }
}

class AppContent extends Component {

  constructor(props){
    super(props)
    this.getSegment = this.getSegment.bind(this)
  }

  getSegment(){
    const segmentID = this.props.match.params.segmentID
    segmentID ? this.props.actions.fetchAppSegment(segmentID) : null    
  }

  componentDidMount(){
    this.getSegment()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.match.params && prevProps.match.params.segmentID !== this.props.match.params.segmentID) {
      this.getSegment()
    }
  }

  render(){
    console.log("AAAAAAA", this.props)
    return <div style={{marginTop: '20px'}}>
            { this.props.app.key && this.props.segment.id ? 
              <AppUsers 
                {...this.props}
              /> : null 
            }
          </div>
  }
}

class ShowAppContainer extends Component {

  constructor(props){
    super(props)
    this.state = {
      //app_users: [], 
      segment: {},
      //meta: {},
      //searching: false,
      jwt: null,
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

    if (prevState.jwt !== this.state.jwt) {
      this.search()
    }

    if (prevState.segment.id !== this.state.segment.id) {
      this.fetchApp( ()=>{
        this.search()
      })
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
      search: this.search
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
    data = JSON.parse(data)
    this.setState({app_users: this.state.app_users.map( (el)=> 
        el.email === data.email ? Object.assign({}, el, data) : el 
      )
    });
  }

  search = (page)=>{
    //this.setState({searching: true})
    // jwt or predicates from segment
    console.log(this.state.jwt)
    const jwtData = this.state.jwt ? parseJwt(this.state.jwt).data : this.state.segment.predicates
    const predicates_data = { data: {
                                predicates: jwtData.filter( (o)=> o.comparison )
                              }
                            }
                            
    
    const options = {
      appKey: this.props.app.key,
      search: predicates_data,
      page: page || 1
    }

    console.log(options)

    this.props.dispatch(
      searchAppUsers(options, ()=>{
        
         this.setState({
          segment: Object.assign({}, this.state.segment, { predicates: jwtData })
        })

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

    graphql(SEGMENT, {
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
    })
  }

  updateSegment = (data, cb)=>{

    const params = {
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
    })
  }

  createSegment = (data, cb)=>{
    const params = {
      appKey: this.props.app.key,
      name: data.input,
      operation: "create",
      predicates: this.state.segment.predicates
    }

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
  }

  deleteSegment = (id, cb)=>{

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
    })
  }

  addPredicate = (data, cb)=>{

    const pending_predicate = {
      attribute: data.name,
      comparison: null,
      type: data.type,
      value: data.value
    }
    const new_predicates = this.state.segment.predicates.concat(pending_predicate)
    const jwtToken = generateJWT(new_predicates)
    //console.log(parseJwt(jwtToken))
    if(cb)
      cb(jwtToken)

    this.setState({jwt: jwtToken})
  }

  updatePredicate= (data, cb)=>{
    const jwtToken = generateJWT(data)
    //console.log(parseJwt(jwtToken))
    if(cb)
      cb(jwtToken)
    this.setState({jwt: jwtToken})
  }

  getPredicates= ()=>{
    return this.state.segment["predicates"] || []
  }

  savePredicates = (data, cb)=>{
    if(data.action === "update"){
      this.updateSegment(data, ()=> { cb() ; this.fetchApp() })
    } else if(data.action === "new"){
      this.createSegment(data, ()=> { 
        cb() ; this.fetchApp() 
      })
    }
  }

  deletePredicate = (data)=>{
    this.setState(
      { segment: {
        id: this.state.segment.id,
        predicates: data,
        jwt: null
      }} , ()=> this.updateSegment({}, this.fetchApp()) )
  }

  render(){
    const {classes} = this.props
    if(!this.props.app)
      return <p>loading this mdfk</p>
   
    return <Provider value={{
                              store: {
                                app: this.props.app,
                                //app_users: this.props.appUsers.collection,
                                //meta: this.props.appUsers.meta,
                                //searching: this.props.appUsers.searching,
                                segment: this.state.segment,
                                currentUser: this.props.currentUser
                              }, 
                              actions: this.actions() 
                            }}>

      {
        this.props.app && this.props.app.key ?
        <div>
          <Route exact path={`${this.props.match.path}/segments/:segmentID/:Jwt?`}
            render={(props) => {
              return <Content>
                      <Consumer>
                          {({ store, actions }) => (
                            <AppContent {...props}
                              app={this.props.app}
                              store={store}
                              actions={actions}
                              app_users={this.props.appUsers.collection}
                              meta={this.props.appUsers.meta}
                              searching={this.props.appUsers.searching}
                              {...this.state}
                            />
                          )}
                      </Consumer>
                    </Content>
            }} 
            />

          <Route exact path={`${this.props.match.path}/conversations/:id?`}
            render={(props) => (
              <Consumer>
                {({ store, actions }) => (
                  <ConversationContainer
                    currentUser={this.props.currentUser}
                    store={store}
                    actions={actions}
                    {...props}
                  />
                )}
              </Consumer>
            )} />


          <Route path={`${this.props.match.path}/messages/:message_type`}
            render={(props) => (
              <Consumer>
                {({ store, actions }) => (
                  <CampaignContainer
                    currentUser={this.props.currentUser}
                    store={store}
                    actions={actions}
                    classes={props.classes}
                    {...props}
                  />
                )}
              </Consumer>
            )} />             

          <Route path={`${this.props.match.path}/settings`}
            render={(props) => (
              <Consumer>
                {({ store, actions }) => (
                  <AppSettingsContainer
                    currentUser={this.props.currentUser}
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
 
    </Provider>
  }
}

function mapStateToProps(state) {

  const { auth, app, appUsers } = state
  const { loading, isAuthenticated } = auth
  return {
    appUsers,
    app,
    loading,
    isAuthenticated
  }
}

export default withRouter(connect(mapStateToProps)(ShowAppContainer))


