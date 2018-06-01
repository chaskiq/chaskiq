import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { BrowserRouter, Route,Switch } from 'react-router-dom'
import App from './App';
import HomePage from '../pages/HomePage';
import SettingsPage from '../pages/SettingsPage';
import ShowAppContainer from '../pages/showAppContainer';

export default class MainRouter extends Component {
  constructor() {
    super();
    this.state = {
      navOpenState: {
        isOpen: true,
        width: 304,
      }
    }
  }

  getChildContext () {
    return {
      navOpenState: this.state.navOpenState,
    };
  }

  appWithPersistentNav = () => (props) => (
    <App
      onNavResize={this.onNavResize}
      {...props}
    />
  )

  onNavResize = (navOpenState) => {
    this.setState({
      navOpenState,
    });
  }

  render() {
    return (
      <BrowserRouter>
        
        {/*<Route render={this.appWithPersistentNav()}>
 
        </Route>*/}

        <App
          onNavResize={this.onNavResize}
          {...this.props}>
          
          <Route exact path="/" component={HomePage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/apps" component={ShowAppContainer}/>
        </App>

        

      </BrowserRouter>
    );
  }
}

class MainApp extends Component {
  render(){
    return <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/settings" component={SettingsPage} />
    </Switch>
  }
}

MainRouter.childContextTypes = {
  navOpenState: PropTypes.object,
}
