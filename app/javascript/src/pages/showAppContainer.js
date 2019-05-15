import React, {Component, createContext, Fragment} from 'react'
import axios from "axios"
import actioncable from "actioncable"
import {
  Route,
  Link
} from 'react-router-dom'
import Moment from 'react-moment';
import PropTypes from 'prop-types';
import Button, { ButtonGroup } from '@atlaskit/button';
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
//import RadioGroup, { AkFieldRadioGroup, AkRadio } from '@atlaskit/field-radio-group';
import Avatar from '@atlaskit/avatar';
import DropdownMenu, {
  DropdownItemGroup,
  DropdownItem,
} from '@atlaskit/dropdown-menu';
import DynamicTable from '@atlaskit/dynamic-table'
/*import Form, { FormHeader,
              FormSection,
              FormFooter,
              Field, 
              FieldGroup, 
              Validator 
            } from '@atlaskit/form';*/
import styled from 'styled-components';
//import InlineDialog from '@atlaskit/inline-dialog';
import Spinner from '@atlaskit/spinner';
//import FieldRadioGroup from '@atlaskit/field-radio-group';
//import Modal from '@atlaskit/modal-dialog';
import EmptyState from '@atlaskit/empty-state'
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


import graphql from "../graphql/client"
import { APP, SEGMENT} from "../graphql/queries"
import { 
  PREDICATES_SEARCH, 
  PREDICATES_CREATE, 
  PREDICATES_UPDATE, 
  PREDICATES_DELETE 
} from '../graphql/mutations'



import skyImage from '../images/sky.png'

const CableApp = {
  cable: actioncable.createConsumer()
}
// Initialize a context
const Context = createContext()

// This context contains two interesting components
const { Provider, Consumer } = Context

const Wrapper = styled.div`
  min-width: 600px;
`;

const createHead = (withWidth: boolean) => {
  return {
    cells: [
      {
        key: 'name',
        content: 'Name',
        isSortable: true,
        width: withWidth ? 25 : undefined,
      },
      {
        key: 'state',
        content: 'state',
        shouldTruncate: true,
        isSortable: true,
        width: withWidth ? 15 : undefined,
      },
      
      {
        key: 'last_visited_at',
        content: 'Las visited at',
        shouldTruncate: true,
        isSortable: true,
        width: withWidth ? 10 : undefined,
      },

      {
        key: 'term',
        content: 'Term',
        shouldTruncate: true,
        isSortable: true,
        width: withWidth ? 10 : undefined,
      },
    ],
  };
};

const NameWrapper = styled.span`
  display: flex;
  align-items: center;
`;

const AvatarWrapper = styled.div`
  margin-right: 8px;
`;

const primaryAction = (
  <Button
    appearance="primary"
    onClick={() => console.log('primary action clicked')}
  >
    Primary action
  </Button>
);

const secondaryAction = (
  <Button onClick={() => console.log('secondary action clicked')}>
    Secondary action
  </Button>
);

const tertiaryAction = (
  <Button
    appearance="subtle-link"
    href="http://www.example.com"
    target="_blank"
  >
    Tertiary action
  </Button>
);

const ActivityIndicator = styled.span`
  position: absolute;
  height: 10px;
  width: 10px;
  background: #1be01b;
  border-radius: 10px;
  top: 1px;
  left: 38px;
`

const dropdown = () => (
    <DropdownMenu
      trigger="Choices"
      triggerType="button"
      shouldFlip={false}
      position="bottom left"
      onOpenChange={e => console.log('dropdown opened', e)}
    >
      <DropdownItemGroup>
        <DropdownItem>Import</DropdownItem>
        <DropdownItem>Export</DropdownItem>
        <DropdownItem>Archive</DropdownItem>
      </DropdownItemGroup>
    </DropdownMenu>
);

class AppUsers extends Component {
  constructor(props){
    super(props)
    this.state = {
      map_view: false
    }
    this.toggleMap = this.toggleMap.bind(this)
    this.toggleList = this.toggleList.bind(this)
  }

  getTableData(){

    const head = createHead(true);

    const app_users = this.props.app_users.map((app_user, index) => {
      return {
        key: `row-${index}-${app_user.email}`,
        cells: [
          {
            //key: createKey(app_user.email),
            content: (
              <NameWrapper>
                <AvatarWrapper>
                  <Avatar
                    name={app_user.email}
                    size="medium"
                    src={`https://api.adorable.io/avatars/24/${encodeURIComponent(
                      app_user.email,
                    )}.png`}
                  />
                </AvatarWrapper>
                <a href="#">{app_user.email}</a>
              </NameWrapper>
            ),
          },
          {
            //key: createKey(app_user.state),
            content: <span style={{position: 'relative'}}>
                      {app_user.state}
                      { app_user.state === "online" ? 
                        <ActivityIndicator/> : null
                      }
                    </span>,
          },
          {
            //key: createKey(app_user.state),
            content: (<Moment fromNow>{app_user.last_visited_at }</Moment>),
          },
          {
            content: (
              <DropdownMenu trigger="More" triggerType="button">
                <DropdownItemGroup>
                  <DropdownItem>{app_user.email}</DropdownItem>
                </DropdownItemGroup>
              </DropdownMenu>
            ),
          },
        ],
      }
    }
    );

    return {head: head, rows: app_users}
  }

  toggleMap = (e)=>{
    this.setState({map_view: false  })
  }

  toggleList = (e)=>{
    this.setState({map_view: true  })
  }

  handleClickOnSelectedFilter = (jwtToken)=>{
    const url = `/apps/${this.props.currentApp.key}/segments/${this.props.store.segment.id}/${jwtToken}`
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
                  const url = `/apps/${this.props.currentApp.key}/segments/${this.props.store.segment.id}`
                  this.props.history.push(url)
                }}
                deleteSegment={this.props.actions.deleteSegment}
              />

            </ButtonGroup>

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

           </div>
  }

  render(){
    const {head, rows} = this.getTableData()
    
    return <Wrapper>

              { this.caption() }

              {
                !this.state.map_view ? 
                  <DynamicTable
                    caption={null}
                    head={head}
                    rows={rows}
                    rowsPerPage={10}
                    defaultPage={1}
                    loadingSpinnerSize="large"
                    isLoading={this.props.searching}
                    isFixedSize
                    defaultSortKey="term"
                    defaultSortOrder="ASC"
                    onSort={() => console.log('onSort')}
                    onSetPage={() => console.log('onSetPage')}
                  /> : <UserMap collection={this.props.app_users}/>
              }
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
    return <div style={{marginTop: '20px'}}>
            { this.props.currentApp.key && this.props.segment.id ? 
              <AppUsers 
                {...this.props}
              /> : null 
            }
          </div>
  }
}

export default class ShowAppContainer extends Component {

  constructor(props){
    super(props)
    this.state = {
      app_users: [], 
      segment: {},
      meta: {},
      searching: false,
      jwt: null,
      currentUser: this.props.currentUser
    }
  }

  emptyprops = ()=> {
    return {
      header: `${this.props.currentApp.name}`,
      description: this.props.currentApp.description || 'no description',
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
    if (prevProps.currentApp && prevProps.currentApp.key !== this.props.currentApp.key){
      this.eventsSubscriber(this.props.currentApp.key)
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
      this.eventsSubscriber(this.props.currentApp.key)
    }
    )
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
      deleteSegment: this.deleteSegment
      //fetchAppSegments: this.fetchAppSegments
    }
  }

  fetchApp = (cb)=>{
    //const t = this
    const id = this.props.match.params.appId
    graphql(APP, {appKey: id}, {
      success: (data)=>{
        this.props.setCurrentApp(data.app, ()=>{
          console.log(this.props)
          setTimeout(() => {
            this.updateNavLinks() 
          }, 1000);
          cb ? cb() : null 
        })
      }, 
      error: (error)=>{
        console.log(error);
      }
    })

    /*
    axios.get(`/apps/${id}.json`)
    .then( (response)=> {

      // TODO: use the props app instead the state app
      this.props.setCurrentApp(response.data.app, ()=>{
        console.log(this.props)
        setTimeout(() => {
          this.updateNavLinks() 
        }, 1000);
        cb ? cb() : null 
      })

      //this.setState({app: response.data.app}, ()=>{ 
      //  
      //  cb ? cb() : null 
      //})
    })
    .catch( (error)=> {
      console.log(error);
    });
    */
  }

  search = ()=>{
    this.setState({searching: true})
    // jwt or predicates from segment
    console.log(this.state.jwt)
    const jwtData = this.state.jwt ? parseJwt(this.state.jwt).data : this.state.segment.predicates
    const predicates_data = { data: {
                                predicates: jwtData.filter( (o)=> o.comparison )
                              }
                            }
                            
    

    graphql(PREDICATES_SEARCH, {
      appKey: this.props.currentApp.key,
      search: predicates_data,
      page: 1
    }, {
      success: (data)=>{
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
    })  
  }

  fetchAppSegment =(id)=>{

    graphql(SEGMENT, {
      appKey: this.props.currentApp.key,
      id: parseInt(id)
    }, {
      success: (data)=>{
        this.setState({
          segment: data.app.segment,
        }, this.search)
      },
      error: (error)=>{
        console.log(error);
      }
    })

    /*
    axios.get(`/apps/${this.props.currentApp.key}/segments/${id}.json`)
    .then( (response)=> {
      
      this.setState({
        segment: response.data.segment,
      }, this.search)
    })
    .catch( (error)=> {
      console.log(error);
    });*/
  }

  updateNavLinks = ()=>{
    const url_for = (o)=> `/apps/${this.props.currentApp.key}/segments/${o.id}`
    const links = this.props.currentApp.segments.map((o)=> [url_for(o), o.name, null] )
    links.push([`/apps/${this.props.currentApp.key}/conversations/`, "conversations", null])
    //this.props.updateNavLinks(this.props.initialNavLinks.concat(links))
    this.props.updateNavLinks(links)
  }

  updateUser = (data)=>{
    data = JSON.parse(data)
    this.setState({app_users: this.state.app_users.map( (el)=> 
        el.email === data.email ? Object.assign({}, el, data) : el 
      )
    });
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

  updateSegment = (data, cb)=>{
    axios.put(`/apps/${this.props.currentApp.key}/segments/${this.state.segment.id}.json`, 
      {
        segment: {
          id: this.state.segment.id,
          predicates: this.state.segment.predicates
        }
      }
    )
    .then( (response)=> {
      this.setState({
        segment: response.data.segment,
        jwt: null
      }, ()=> cb ? cb() : null )
    })
    .catch( (error)=> {
      console.log(error);
    })
  }

  createSegment = (data, cb)=>{
    const params = {
      segment: {
        name: data.input,
        predicates: this.state.segment.predicates
      }
    }

    graphql(PREDICATES_CREATE, params, {
      success: (data)=>{
        debugger
      }
      error: (error)=>{

      }
    })
    axios.post(`/apps/${this.props.currentApp.key}/segments.json`, 
      {
        segment: {
          name: data.input,
          predicates: this.state.segment.predicates
        }
      }
    )
    .then( (response)=> {
      this.setState({
        segment: response.data.segment,
        jwt: null
      }, ()=> {
        cb ? cb() : null
      })
    })
    .catch( (error)=> {
      console.log(error);
    })
  }

  deleteSegment = (id, cb)=>{

    graphql()

    axios.delete(`/apps/${this.props.currentApp.key}/segments/${id}.json`)
    .then( (response)=> {
      cb ? cb() : null 
      const url = `/apps/${this.props.currentApp.key}/segments/1`
      this.props.history.push(url)
      this.fetchApp()
    })
    .catch( (error)=> {
      console.log(error);
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
    console.log(data.action)
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
        predicates: data
      }} , ()=> this.updateSegment({}, this.fetchApp()) )
  }

  render(){
    return <Provider value={{
                              store: {
                                app: this.props.currentApp,
                                app_users: this.state.app_users,
                                segment: this.state.segment,
                                currentUser: this.props.currentUser
                              }, 
                              actions: this.actions() 
                            }}>

      <ContentWrapper>

        {/*
          <PageTitle>
            App: {this.props.currentApp.key}
          </PageTitle>
        */}

        {
          this.props.currentApp && this.props.currentApp.key ?
          <div>

              <Route exact path={`${this.props.match.path}/segments/:segmentID/:Jwt?`}
                render={(props) => {
                  return <Consumer>
                    {({ store, actions }) => (
                      <AppContent {...props}
                        currentApp={this.props.currentApp}
                        store={store}
                        actions={actions}
                        {...this.state}
                      />
                    )}
                  </Consumer>
                }
                } />

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

              <Route exact path={`/apps/${this.props.currentApp.key}`}
                 render={() => (
                  
                   <EmptyState {...this.emptyprops()} />
                )} 
              />

              <Route exact path={`/apps/${this.props.currentApp.key}/campaings`}
                render={() => (
                  <EmptyState {...this.emptyprops()} />
                )}
              />

          </div>
             : null
        }
 
      </ContentWrapper>
    </Provider>
  }
}

