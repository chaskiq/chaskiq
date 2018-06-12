import React, {Component, createContext, Fragment} from 'react'
import axios from "axios"
import actioncable from "actioncable"
import {
  Route,
  Link
} from 'react-router-dom'
import TimeAgo from 'react-timeago'
import PropTypes from 'prop-types';
import Button, { ButtonGroup } from '@atlaskit/button';
import ContentWrapper from '../components/ContentWrapper';
import PageTitle from '../components/PageTitle';
import RadioGroup, { AkFieldRadioGroup, AkRadio } from '@atlaskit/field-radio-group';
import Avatar from '@atlaskit/avatar';
import DropdownMenu, {
  DropdownItemGroup,
  DropdownItem,
} from '@atlaskit/dropdown-menu';
import DynamicTable from '@atlaskit/dynamic-table'
import Form, { FormHeader,
              FormSection,
              FormFooter,
              Field, 
              FieldGroup, 
              Validator 
            } from '@atlaskit/form';
import styled from 'styled-components';
import InlineDialog from '@atlaskit/inline-dialog';
import Spinner from '@atlaskit/spinner';
import FieldRadioGroup from '@atlaskit/field-radio-group';
import KJUR from "jsrsasign"
import Modal from '@atlaskit/modal-dialog';
import EmptyState from '@atlaskit/empty-state'
import UserMap from "../components/map"

import ConversationContainer from './ConversationContainer';


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

const Emptyprops = {
  header: 'I am the header',
  description: `Lorem ipsum is a pseudo-Latin text used in web design, 
        typography, layout, and printing in place of English to emphasise 
        design elements over content. It's also called placeholder (or filler) 
        text. It's a convenient tool for mock-ups.`,
  imageUrl: null,
  primaryAction,
  secondaryAction,
  tertiaryAction,
};

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

const parseJwt = (token)=> {
  var isValid = KJUR.jws.JWS.verifyJWT(token, "616161", {alg: ['HS256']});
  if(!isValid)
    return new Error("not a valid jwt, sory")

  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
};

const generateJWT = (data)=>{
  var oHeader = {alg: 'HS256', typ: 'JWT'};
  // Payload
  var oPayload = {};
  var tNow = KJUR.jws.IntDate.get('now');
  var tEnd = KJUR.jws.IntDate.get('now + 1day');
  oPayload.data = data
  // Sign JWT, password=616161
  var sHeader = JSON.stringify(oHeader);
  var sPayload = JSON.stringify(oPayload);
  var sJWT = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, "616161")
  return sJWT
}

class InlineDialogExample extends Component {
  state = {
    dialogOpen: false,
  };

  toggleDialog = (e) => this.setState({ dialogOpen: !this.state.dialogOpen });

  handleClick = (e, o) => {
    this.props.actions.addPredicate(o)
  }

  render() {

    const fields = [
      {name: "last_visited_at", type: "string"},
      {name: "referrer", type: "string"},
      {name: "state", type: "string"},
      {name: "ip", type: "string"},        
      {name: "city", type: "string"},           
      {name: "region", type: "string"},         
      {name: "country", type: "string"},        
      {name: "lat", type: "string"},
      {name: "lng", type: "string"},
      {name: "postal", type: "string"},   
      {name: "web_sessions", type: "string"}, 
      {name: "timezone", type: "string"}, 
      {name: "browser", type: "string"}, 
      {name: "browser_version", type: "string"},
      {name: "os", type: "string"},
      {name: "os_version", type: "string"},      
      {name: "browser_language", type: "string"}, 
      {name: "lang", type: "string"},    
    ]

    const content = (
      <div>
        <h5>Select field</h5>
        <p>oeoe</p>

        <ul style={{ height: '200px', overflow: 'auto'}}>
          {
            fields.map((o)=> <li key={o.name}>
                              <Button onClick={(e)=> this.handleClick.bind(this)(e, o)}>
                                {o.name}
                              </Button>
                             </li>
            )
          }
        </ul>
      </div>
    );

    return (
      <div style={{ minHeight: '120px' }}>
        <InlineDialog 
          content={content} 
          isOpen={this.state.dialogOpen}
          position="bottom left">

          <Button isLoading={false} 
            appearance={'link'}
            onClick={this.toggleDialog}>
            <i className="fas fa-plus"></i>
            {" "}
            Add filter
          </Button>
        </InlineDialog>
      </div>
    );
  }
}

// same as SegmentItemButton
class SegmentItemButton extends Component {
  state = {
    dialogOpen: this.props.open,
    selectedOption: this.props.predicate.comparison
  };

  onRadioChange = (e)=> {
    this.setState({
      selectedOption: e.target.value
    })
  };

  handleSubmit = (e)=> {
    //this.props.predicate.type
    let value = null 
    switch(this.props.predicate.type){
      case "string": {
        value = `${this.refs.relative_input.value}`
        break;
      }
      case "date": {
        value = `${this.refs.relative_input.value} days ago`
        break;
      }
    }
    
    const h = {
      comparison: this.state.selectedOption.replace("relative:", ""),
      value: value
    }

    const response = Object.assign({}, this.props.predicate, h )
    this.props.updatePredicate(response)
  }

  handleDelete = (e) => {
    this.props.deletePredicate(this.props.predicate)
     // /apps/:app_id/segments/:id/delete_predicate
  }

  renderOptions = () => {

    switch(this.props.predicate.type){
      case "string": {
        return this.contentString()
      }

      case "date": {
        return this.contentDate()
      }
    }

  }

  contentString = () => {
    
    const compare = (value)=>{
      return this.props.predicate.comparison === value
    }

    const relative = [
      {label: "is", value: "eq", defaultSelected: false},
      {label: "is not", value: "not_eq", defaultSelected: false},
      {label: "starts with", value: "contains_start", defaultSelected: false},
      {label: "ends with", value: "contains_ends", defaultSelected: false},
      {label: "contains", value: "contains", defaultSelected: false},
      {label: "does not contain", value: "not_contains", defaultSelected: false},
      {label: "is unknown", value: "is_null", defaultSelected: false},
      {label: "has any value", value: "is_not_null", defaultSelected: false},
    ]

    return <div>
              <h5>Update String</h5>
              <p>Select the filter</p>
              <FieldRadioGroup
                items={relative}
                label="Relative:"
                onRadioChange={this.onRadioChange.bind(this)}
              />

              { this.state.selectedOption && 
                (this.state.selectedOption !== "is_null" || 
                  this.state.selectedOption !== "is_not_null") ?
                <div>
                  <input 
                    defaultValue={null} 
                    type="text"
                    ref={"relative_input"}
                  />
                  
                  <hr/>

                  <Button appearance="link" 
                    onClick={this.handleSubmit.bind(this)}>
                    save changes
                  </Button>

                </div> : null
              }

              { !this.props.predicate.comparison ? null : this.deleteButton() }
            
            </div>
  }

  contentDate = () => {
  
    const compare = (value)=>{
      return this.props.predicate.comparison === value
    }

    const relative = [
      {label: "more than", value: "lt", defaultSelected: compare("lt")  },
      {label: "exactly", value: "eq",  defaultSelected: compare("eq")  },
      {label: "less than", value: "gt", defaultSelected: compare("gt")  },
    ]
    const absolute = [
      {name: "after", value: "absolute:gt"},
      {name: "on", value: "absolute:eq"},
      {name: "before", value: "absolute:lt"},
      {name: "is unknown", value: "absolute:eq"},
      {name: "has any value", value: "absolute:not_eq"},
    ]

    return <div>
              <h5>Update date</h5>
              <p>Select the filter</p>
              <FieldRadioGroup
                items={relative}
                label="Relative:"
                onRadioChange={this.onRadioChange.bind(this)}
              />

              { this.state.selectedOption ?
                <div>
                  <input 
                    defaultValue={30} 
                    type="number"
                    ref={"relative_input"}/>
                  <span>days ago</span>
                  <hr/>

                  <Button appearance="link" 
                    onClick={this.handleSubmit.bind(this)}>
                    save changes
                  </Button>

                </div> : null
              }

              { !this.props.predicate.comparison ? null : this.deleteButton() }
            
            </div>

  }

  deleteButton = () => {
    return <Button appearance="link" 
            onClick={this.handleDelete.bind(this)}>
            Delete
           </Button>
  }

  toggleDialog = (e) => this.setState({ dialogOpen: !this.state.dialogOpen });

  render() {
    return (
      <div style={{ minHeight: '120px' }}>
        <InlineDialog content={this.renderOptions()} 
                      isOpen={this.state.dialogOpen}
                      position={"bottom left"}
                      shouldFlipunion={true}>

          {
            !this.props.predicate.comparison ?
        
              <Button isLoading={false} 
                appearance={this.state.dialogOpen ? 'default' : 'danger'}
                onClick={this.toggleDialog}>
                {
                  !this.state.dialogOpen ? 
                  "Missing value!" : 
                  this.props.text
                }
              </Button> : 

              <Button isLoading={false} 
                appearance={this.props.appearance}
                onClick={this.toggleDialog}>
                {this.props.text}
              </Button>
          }

        </InlineDialog>
      </div>
    );
  }
}

class SaveSegmentModal extends Component {
  state: State = { 
    isOpen: false, 
    action: "update",
    loading: false,
    input: null
  };
  open  = () => this.setState({ isOpen: true });
  close = () => this.setState({ isOpen: false });
  
  secondaryAction = ({ target }: Object) => {
    this.props.savePredicates({
      action: this.state.action,
      input: this.refs.input ? this.refs.input.value : null
    }, this.close )
  }

  deleteAction = ({ target }: Object) => {
    this.props.deleteSegment(this.props.segment.id, this.close )
  }

  handleChange = ({target})=> {
    this.setState({
      action: target.value, 
    })
  }
  
  render() {
    const { isOpen, loading } = this.state;
    const actions = [
      { text: 'Close', onClick: this.close },
      { text: 'Save Segment', onClick: this.secondaryAction.bind(this) },
      { text: 'Remove Segment', onClick: this.deleteAction.bind(this) }
    ];

    return (
      <div>

        <Button isLoading={false} 
          appearance={'link'}
          onClick={this.open}>
          <i className="fas fa-chart-pie"></i>
          {" "}
          Save Segment
        </Button>

        <Button isLoading={false} 
          appearance={'link danger'}
          onClick={this.deleteAction.bind(this)}>
          <i className="fas fa-chart-pie"></i>
          {" "}
          remove Segment
        </Button>


        {isOpen && (
          <Modal actions={actions} 
            onClose={this.close} 
            heading={this.props.title}>
            
            {
              !loading ?
                 <div>
                  <FieldRadioGroup
                    items={
                      [
                        {label: `Save changes to the segment ‘${this.props.segment.name}’`, value: "update", defaultSelected: true  },
                        {label: "Create new segment", value: "new" },
                      ]
                    }
                    label="options:"
                    onRadioChange={this.handleChange.bind(this)}
                  />

                  {
                    this.state.action === "new" ?
                    <input name="name" ref="input"/> : null
                  }
                </div> : <Spinner/>
            }

          </Modal>
        )}
      </div>
    );
  }
}

class AppUsers extends Component {
  constructor(props){
    super(props)
    this.state = {
      map_view: false
    }
    this.toggleMap = this.toggleMap.bind(this)
    this.toggleList = this.toggleList.bind(this)
  }

  getTablaData(){

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
            content: app_user.state,
          },
          {
            //key: createKey(app_user.state),
            content: (<TimeAgo date={app_user.last_visited_at }/>),
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

  caption = ()=>{
    return <div>
            <ButtonGroup>
              {
                this.props.actions.getPredicates().map((o, i)=>{
                    return <SegmentItemButton 
                            key={i}
                            predicate={o}
                            open={ !o.comparison }
                            appearance={ o.comparison ? "primary" : "default"} 
                            text={`Match: ${o.attribute} ${o.comparison ? o.comparison : '' } ${o.value ? o.value : ''}`}
                            updatePredicate={this.props.actions.updatePredicate}
                            deletePredicate={this.props.actions.deletePredicate}                          
                           />
                })
              }

              <InlineDialogExample {...this.props}/>

              <SaveSegmentModal 
                title="Save Segment" 
                segment={this.props.store.segment}
                savePredicates={this.props.actions.savePredicates}
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
    const {head, rows} = this.getTablaData()
    
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
    return <div>
            { this.props.app.key && this.props.segment.id ? 
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
      app: {}, 
      app_users: [], 
      segment: {},
      meta: {},
      searching: false,
      jwt: null
    }

    this.fetchApp         = this.fetchApp.bind(this)
    this.eventsSubscriber = this.eventsSubscriber.bind(this)
    this.fetchAppSegment  = this.fetchAppSegment.bind(this)
    this.updatePredicate  = this.updatePredicate.bind(this)
    this.search           = this.search.bind(this)
    this.savePredicates   = this.savePredicates.bind(this)
    this.updateSegment    = this.updateSegment.bind(this)
    this.updateNavLinks   = this.updateNavLinks.bind(this)
    this.getPredicates    = this.getPredicates.bind(this)
    this.addPredicate     = this.addPredicate.bind(this)
    this.deletePredicate  = this.deletePredicate.bind(this)
  }

  componentDidMount() {
    this.fetchApp( ()=> { 
        this.eventsSubscriber(this.state.app.key)
      }
    )
  }

  componentDidUpdate(prevProps, prevState) {
    // only update chart if the data has changed
    if (prevState.jwt !== this.state.jwt) {
        this.search()
    }

    if (prevState.segment.id !== this.state.segment.id) {
      this.fetchApp( ()=>{
        this.search()
      })
    }
  }

  actions(){
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

  fetchApp(cb){
    const t = this
    const id = this.props.match.params.appId
    axios.get(`/apps/${id}.json`)
    .then( (response)=> {
      t.setState({app: response.data.app}, ()=>{ 
        this.updateNavLinks()
        cb ? cb() : null
      })
    })
    .catch( (error)=> {
      console.log(error);
    });
  }

  search(){
    this.setState({searching: true})
    // jwt or predicates from segment
    console.log(this.state.jwt)
    const data = this.state.jwt ? parseJwt(this.state.jwt).data : this.state.segment.predicates
    const predicates_data = { data: {
                                predicates: data.filter( (o)=> o.comparison )
                              }
                            }
                            
    axios.post(`/apps/${this.state.app.key}/search.json`, 
      predicates_data )
    .then( (response)=> {
      console.log(this.state)
      console.log(data)
      this.setState({
        segment: Object.assign({}, this.state.segment, { predicates: data }),
        app_users: response.data.collection,
        meta: response.data.meta, 
        searching: false
      })
    })
    .catch( (error)=> {
      console.log(error);
    });   
  }

  fetchAppSegment(id){
    axios.get(`/apps/${this.state.app.key}/segments/${id}.json`)
    .then( (response)=> {
      
      this.setState({
        segment: response.data.segment,
      }, this.search)
    })
    .catch( (error)=> {
      console.log(error);
    });
  }

  updateNavLinks(){
    const url_for = (o)=> `/apps/${this.state.app.key}/segments/${o.id}`
    const links = this.state.app.segments.map((o)=> [url_for(o), o.name, null] )

    links.push([`/apps/${this.state.app.key}/conversations/`, "conversations", null])
    this.props.updateNavLinks(this.props.initialNavLinks.concat(links))
  }

  updateUser(data){
    data = JSON.parse(data)
    this.setState({app_users: this.state.app_users.map( (el)=> 
        el.email === data.email ? Object.assign({}, el, data) : el 
      )
    });
  }

  eventsSubscriber(id){
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
  }

  updatePredicate(data){
    const new_predicates = this.state.segment.predicates.map((o)=> {
      if(data.attribute === o.attribute){
        return data
      } else {
        return o
      }
    })

    const jwtToken = generateJWT(new_predicates)
    console.log(parseJwt(jwtToken))
    const url = `/apps/${this.state.app.key}/segments/${this.state.segment.id}/${jwtToken}`
    this.props.history.push(url)
    this.setState({jwt: jwtToken})
  }

  getPredicates(){
    return this.state.segment["predicates"] || []
  }

  deletePredicate(data){
    const new_predicates = this.state.segment.predicates.map((o)=> {
      if(data.attribute === o.attribute){
        return null
      } else {
        return o
      }
    }).filter((o)=> o)

    this.setState(
      { segment: {
        id: this.state.segment.id,
        predicates: new_predicates
      }} , ()=> this.updateSegment({}, this.fetchApp()) )
  }

  updateSegment = (data, cb)=>{
    axios.put(`/apps/${this.state.app.key}/segments/${this.state.segment.id}.json`, 
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
    axios.post(`/apps/${this.state.app.key}/segments.json`, 
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
        const url = `/apps/${this.state.app.key}/segments/${this.state.segment.id}`
        this.props.history.push(url)
        //this.fetchAppSegments() ; cb ? cb() : null 
      })
    })
    .catch( (error)=> {
      console.log(error);
    })
  }

  deleteSegment = (id, cb)=>{
    axios.delete(`/apps/${this.state.app.key}/segments/${id}.json`, 
      {}
    )
    .then( (response)=> {
      /*this.setState({
        segment: response.data.segment,
        jwt: null
      }, ()=> {*/
        cb ? cb() : null 
        const url = `/apps/${this.state.app.key}/segments/1`
        this.props.history.push(url)
        this.fetchApp()
      //})
    })
    .catch( (error)=> {
      console.log(error);
    })
  }

  savePredicates(data, cb){
    console.log(data.action)
    if(data.action === "update"){
      this.updateSegment(data, ()=> { cb() ; this.fetchApp() })
    } else if(data.action === "new"){
      this.createSegment(data, ()=> { cb() ; this.fetchApp() })
    }
  }

  addPredicate(data){

    const pending_predicate = {
      attribute: data.name,
      comparison: null,
      type: data.type,
      value: data.value
    }

    const new_predicates = this.state.segment.predicates.concat(pending_predicate)

    const jwtToken = generateJWT(new_predicates)
    console.log(parseJwt(jwtToken))
    const url = `/apps/${this.state.app.key}/segments/${this.state.segment.id}/${jwtToken}`
    this.props.history.push(url)
    this.setState({jwt: jwtToken})

  }

  render(){
    return <Provider value={{
                              store: this.state, 
                              actions: this.actions() 
                            }}>

      <ContentWrapper>

        <PageTitle>
          App: {this.state.app.key}
        </PageTitle>

        <Route exact path={this.props.match.path}
          render={(props) => {
            return <EmptyState {...Emptyprops} />
          }
        }/>

        {
          this.state.app.key ?
            <Route exact path={`${this.props.match.path}/segments/:segmentID/:Jwt?`} 
              render={(props) => {
                return  <Consumer>
                          {({ store, actions }) => (
                            <AppContent {...Object.assign({}, props, store) }
                            store={store} 
                            actions={actions}/>
                          )}
                        </Consumer>
              }
            }/> : null
        }

        <Route exact path={`${this.props.match.path}/conversations/:id?`} 
          render={(props)=>(
            <ConversationContainer
              {...props}
            />
        )} /> 
       
        <Route exact path={this.props.match.path} render={() => (
          <h3>Please select a topic.</h3>
        )}/>
 
      </ContentWrapper>
    </Provider>
  }
}