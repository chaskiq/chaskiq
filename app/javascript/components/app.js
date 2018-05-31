import React, {Component, createContext, Fragment} from 'react'
import axios from "axios"

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'


const AppState = {
  app: {},
  app_users: []
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
  <div>
    <h2>App</h2>
    
    <ul>
      <li>
        <Link to={`${match.url}/rendering`}>
          Rendering with React
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/components`}>
          Components
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/props-v-state`}>
          Props v. State
        </Link>
      </li>
    </ul>


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

  actions(){
    return {
      fetchApp: this.fetchApp,
      fetchAppUsers: this.fetchAppUsers
    }
  }
 
  render(){
    return <Provider value={{store: this.state, actions: this.actions() }}>
      <ShowApp 
        match={this.props.match} 
      />
    </Provider>
  }
}

const App = () => (
  <Router>
    <div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/apps">App</Link></li>
      </ul>

      <hr/>

      <Route exact path="/" component={Home}/>
      <Route path="/about" component={About}/>
      <Route path="/apps" component={ShowAppContainer}/>
    </div>
  </Router>
)
export default App