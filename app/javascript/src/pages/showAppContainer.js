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

const AppState = {
  app: {},
  app_users: []
}

const CableApp = {
  cable: actioncable.createConsumer()
}
// Initialize a context
const Context = createContext()

// This context contains two interesting components
const { Provider, Consumer } = Context

function createKey(input) {
  return input ? input.replace(/^(the|a|an)/, '').replace(/\s/g, '') : input;
}

function getRandomString() {
  return `${lorem[Math.floor(Math.random() * lorem.length)]}`;
}

const caption = 'List of Users';

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

class AppUsers extends Component {
  constructor(props){
    super(props)
  }

  componentDidMount(){
    this.props.actions.fetchAppUsers()
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
                <a href="https://atlassian.design">{app_user.email}</a>
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

  caption = ()=>{
    return <div>
            <span>aaaa</span>

            <ButtonGroup>
              
              <Button onClick={this.context.addFlag}>
                Match all filters
              </Button>

            
              <Button isLoading={false} appearance={'link'}>
                <i class="fas fa-plus"></i>
                {" "}
                Add filter
              </Button>

              <Button isLoading={false} appearance={'link'}>
                <i class="fas fa-chart-pie"></i>
                {" "}
                Save Segment
              </Button>

            </ButtonGroup>

           </div>
  }


  render(){
    const {head, rows} = this.getTablaData()
    
    return <Wrapper>
                  <DynamicTable
                  caption={this.caption()}
                  head={head}
                  rows={rows}
                  rowsPerPage={10}
                  defaultPage={1}
                  loadingSpinnerSize="large"
                  isLoading={this.props.app_users.length == 0}
                  isFixedSize
                  defaultSortKey="term"
                  defaultSortOrder="ASC"
                  onSort={() => console.log('onSort')}
                  onSetPage={() => console.log('onSetPage')}
                  />
                </Wrapper>
  }
}

class Topic extends Component {

  constructor(props){
    super(props)
  }

  componentDidMount(){
    const id = this.props.match.params.topicId
    this.props.actions.fetchApp(id)
    this.props.actions.eventsSubscriber(id)
  }

  render(){
    return <div>
            { this.props.app.key ? 
              <AppUsers 
                {...this.props}
              /> : null 
            }
          </div>
  }
}

const ShowApp = ({ match }) => (
  <Fragment>
    <Route path={`${match.path}/:topicId`} render={(props) => (

      <Consumer>
        {({ store, actions }) => (
          <Topic {...Object.assign({}, props, store) }
          store={store} 
          actions={actions}/>
        )}
      </Consumer>

    )}/>

    <Route exact path={match.path} render={() => (
      <h3>Please select a topic.</h3>
    )}/>
  </Fragment>
)

const dropdown = () => (
    <DropdownMenu
      trigger="Choices"
      triggerType="button"
      shouldFlip={false}
      position="right middle"
      onOpenChange={e => console.log('dropdown opened', e)}
    >
      <DropdownItemGroup>
        <DropdownItem>Sydney</DropdownItem>
        <DropdownItem>Melbourne</DropdownItem>
      </DropdownItemGroup>
    </DropdownMenu>
);

const dropdown2 = () => (
    <DropdownMenu
      trigger="Choices"
      triggerType="button"
      shouldFlip={false}
      position="right middle"
      onOpenChange={e => console.log('dropdown opened', e)}
    >
      <DropdownItemGroup>
        <DropdownItem>Sydney</DropdownItem>
        <DropdownItem>Melbourne</DropdownItem>
      </DropdownItemGroup>
    </DropdownMenu>
);

const content = (
  <div>
    <h5>Title</h5>
    <p>Cheesecake gingerbread cupcake soufflé.</p>

    <p>
      Macaroon cupcake powder dragée liquorice fruitcake cookie sesame snaps
      cake.
    </p>
  </div>
);

class InlineDialogExample extends Component {
  state = {
    dialogOpen: true,
  };

  toggleDialog = () => this.setState({ dialogOpen: !this.state.dialogOpen });

  render() {
    return (
      <div style={{ minHeight: '120px' }}>
        <InlineDialog content={content} isOpen={this.state.dialogOpen}>
          <Button onClick={this.toggleDialog}>Toggle Dialog</Button>
        </InlineDialog>
      </div>
    );
  }
}

export default class ShowAppContainer extends Component {

  constructor(props){
    super(props)
    this.state = {
      app: {}, 
      app_users: [], 
    }

    this.fetchApp = this.fetchApp.bind(this)
    this.fetchAppUsers = this.fetchAppUsers.bind(this)
    this.eventsSubscriber = this.eventsSubscriber.bind(this)
  }

  fetchApp(id){
    const t = this
    axios.get(`/apps/${id}.json`)
    .then( (response)=> {
      t.setState({app: response.data.app} )
    })
    .catch( (error)=> {
      console.log(error);
    });
  }

  fetchAppUsers(){
    axios.get(`/apps/${this.state.app.key}/app_users.json`)
    .then( (response)=> {
      this.setState({app_users: response.data.collection} )
    })
    .catch( (error)=> {
      console.log(error);
    });
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

  actions(){
    return {
      fetchApp: this.fetchApp,
      fetchAppUsers: this.fetchAppUsers,
      eventsSubscriber: this.eventsSubscriber
    }
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

        <ButtonGroup>
          <Button
            appearance="primary"
            onClick={this.context.showModal}
            onClose={() => { }}
          >Match All users</Button>
          <Button onClick={this.context.addFlag}>
            Match all filters
          </Button>

          <InlineDialogExample/>

          {dropdown()}

          <Button isLoading={false} appearance={'link'}>
            <i class="fas fa-plus"></i>
            {" "}
            Add filter
          </Button>

          <Button isLoading={false} appearance={'link'}>
            <i class="fas fa-chart-pie"></i>
            {" "}
            Save Segment
          </Button>

        </ButtonGroup>

        <hr/>

        <ShowApp 
          match={this.props.match} 
        />

      </ContentWrapper>


    </Provider>
  }
}