import React, {Component, createContext, Fragment} from 'react'
import axios from "axios"
import actioncable from "actioncable"


import { Layout, Button } from 'antd';
const { Header, Footer, Sider, Content } = Layout;

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
            <Button type="primary">Button</Button>
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

  <Layout>

    <Sider>

      <h2>App</h2>
      
      <ul>
        <li>
          <Link to={`${match.url}/koqUPJs8-l-ts_Pi0sacTw`}>
            My app
          </Link>
        </li>
      </ul>

    </Sider>

    
    <Content>

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

    </Content>

  </Layout>

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

const App = () => (
  <Fragment>
    <Router>
      <Layout>
        <Sider>
          
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/apps">App</Link></li>
          </ul>

        </Sider>
        <Layout>
          <Header>Header</Header>
          <Content>
            
            <Route exact path="/" component={Home}/>
            <Route path="/about" component={About}/>
            <Route path="/apps" component={ShowAppContainer}/>


          </Content>
          <Footer>Footer</Footer>
        </Layout>
      </Layout>

      {
        /*

      <div className="wrapper">
        <div className="header">
          
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/apps">App</Link></li>
          </ul>
        </div>
        <Route exact path="/" component={Home}/>
        <Route path="/about" component={About}/>
        <Route path="/apps" component={ShowAppContainer}/>

        <div className="box footer">Footer</div>
      </div>

        */        
      }


    </Router>
  </Fragment>
)

export default App