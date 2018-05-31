import React, {Component, createContext, Fragment} from 'react'
import axios from "axios"
import actioncable from "actioncable"

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'


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


const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
)

const About = () => (
  <div>
    <h2>About</h2>
  </div>
)

class AppUsers extends Component {
  constructor(props){
    super(props)
  }

  componentDidMount(){
    this.props.actions.fetchAppUsers()
  }

  render(){
    return <div>
              {
                this.props.app_users.map((o,i)=>{
                  return <li>
                            {o.email} 
                            | 
                            {o.state}
                          </li>
                })
              }
           </div>
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
            <h3>{this.props.app.key}</h3>

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

    <div class="box sidebar">

      <h2>App</h2>
      
      <ul>
        <li>
          <Link to={`${match.url}/koqUPJs8-l-ts_Pi0sacTw`}>
            My app
          </Link>
        </li>
      </ul>

    </div>
    <div class="box sidebar2">Sidebar 2</div>
    <div class="box content">

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

    </div>

  </Fragment>

)

class ShowAppContainer extends Component {

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
      <ShowApp 
        match={this.props.match} 
      />
    </Provider>
  }
}

// not used for now
const Header = () => (
  <Fragment>
    <div className="header py-4">
      <div className="container">
        <div className="d-flex">
          <a className="header-brand" href="<%= root_url %>">
            Chaskiq
            {/*<img src="./demo/brand/tabler.svg" class="header-brand-img" alt="tabler logo">*/}
          </a>
          <div className="d-flex order-lg-2 ml-auto">
            
            <div className="dropdown">
              <a href="#" className="nav-link pr-0 leading-none" data-toggle="dropdown">
                <span className="avatar" style={{backgroundImage: 'url("")'}} />
                <span className="ml-2 d-none d-lg-block">
                  <span className="text-default">
                    email here
                  </span>
                  <small className="text-muted d-block mt-1">Administrator</small>
                </span>
              </a>
              <div className="dropdown-menu dropdown-menu-right dropdown-menu-arrow">
                <a className="dropdown-item" href="#">
                  <i className="dropdown-icon fe fe-log-out" />
                  Sign out
                </a>
              </div>
            </div>
            
          </div>
          <a href="#" className="header-toggler d-lg-none ml-3 ml-lg-0" data-toggle="collapse" data-target="#headerMenuCollapse">
            <span className="header-toggler-icon" />
          </a>
        </div>
      </div>
    </div>
    <div className="header collapse d-lg-flex p-0" id="headerMenuCollapse">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg order-lg-first">
            <ul className="nav nav-tabs border-0 flex-column flex-lg-row">
              
              <li className="nav-item">
                <Link to="/" className="nav-link">Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/about" className="nav-link">About</Link>
              </li>
              <li className="nav-item">
                <Link to="/apps" className="nav-link">App</Link>
              </li>

            </ul>
          </div>
        </div>
      </div>
    </div>
  </Fragment>
)

const App = () => (
  <Fragment>
    <Router>
      <div class="wrapper">
        <div class="header">
          {/*<Header/>*/}
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/apps">App</Link></li>
          </ul>
        </div>
        <Route exact path="/" component={Home}/>
        <Route path="/about" component={About}/>
        <Route path="/apps" component={ShowAppContainer}/>

        <div class="box footer">Footer</div>
      </div>
    </Router>
  </Fragment>
)

export default App