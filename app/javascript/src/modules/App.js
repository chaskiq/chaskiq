import React from 'react';
import PropTypes from 'prop-types';
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Hidden from '@material-ui/core/Hidden';
import Navigator from '../components/Navigator';
import Content from '../components/Content';
import Header from '../components/Header';
//import '@atlaskit/css-reset';



class Paperbase extends React.Component {
  state = {
    mobileOpen: false,
  };

  static contextTypes = {
    navOpenState: PropTypes.object,
    router: PropTypes.object,
    currentApp: PropTypes.object
  };

  static propTypes = {
    navOpenState: PropTypes.object,
    onNavResize: PropTypes.func,
  };


  handleDrawerToggle = () => {
    this.setState(state => ({ mobileOpen: !state.mobileOpen }));
  };

  render() {
    const { classes } = this.props;
    const { children } = this.props;
    const drawerWidth = 256;

    const childrenWithProps = React.Children.map(children, child =>
      React.cloneElement(child, { navLinks: this.props.navLinks }));
    console.log("SSSS", this.props.currentUser)
    return (
        <div className={classes.root}>
          <CssBaseline />
          <nav className={classes.drawer}>
            <Hidden smUp implementation="js">
              <Navigator
                PaperProps={{ style: { width: drawerWidth } }}
                variant="temporary"
                navLinks={this.props.navLinks}
                open={this.state.mobileOpen}
                onClose={this.handleDrawerToggle}
                navOpenState={this.context.navOpenState}
                onNavResize={this.props.onNavResize}
                currentUser={this.props.currentUser}
                currentApp={this.props.currentApp}

              />
            </Hidden>
            <Hidden xsDown implementation="css">
              <Navigator 
                PaperProps={{ style: { width: drawerWidth } }}
                navLinks={this.props.navLinks}
                currentUser={this.props.currentUser}
                currentApp={this.props.currentApp}
             />
            </Hidden>
          </nav>
          <div className={classes.appContent}>
            <Header onDrawerToggle={this.handleDrawerToggle} />
            <main className={classes.mainContent}>
              <Content>{childrenWithProps}</Content>
            </main>
          </div>
        </div>
      
    );
  }
}

Paperbase.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default Paperbase;