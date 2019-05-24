import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HomeIcon from '@material-ui/icons/Home';
import PeopleIcon from '@material-ui/icons/People';
import DnsRoundedIcon from '@material-ui/icons/DnsRounded';
import PermMediaOutlinedIcon from '@material-ui/icons/PhotoSizeSelectActual';
import PublicIcon from '@material-ui/icons/Public';
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';
import SettingsInputComponentIcon from '@material-ui/icons/SettingsInputComponent';
import TimerIcon from '@material-ui/icons/Timer';
import SettingsIcon from '@material-ui/icons/Settings';
import PhonelinkSetupIcon from '@material-ui/icons/PhonelinkSetup';
import Typography from '@material-ui/core/Typography';

import Nav, {
  AkContainerTitle,
  AkCreateDrawer,
  AkNavigationItem,
  AkSearchDrawer,
  AkNavigationItemGroup,
  AkContainerNavigationNested,
} from '@atlaskit/navigation';
import Button from '@atlaskit/button';
import SearchIcon from '@atlaskit/icon/glyph/search';
import CreateIcon from '@atlaskit/icon/glyph/add';
import ArrowleftIcon from '@atlaskit/icon/glyph/arrow-left';
import ArrowLeftIcon from "@atlaskit/icon/glyph/arrow-left";
import ChevronRightIcon from "@atlaskit/icon/glyph/chevron-right";
import DiscoverIcon from "@atlaskit/icon/glyph/discover";
import CommentIcon from '@atlaskit/icon/glyph/comment';
import EmojiFlagsIcon from '@atlaskit/icon/glyph/emoji/flags';
import OfficeBuildingFilledIcon from '@atlaskit/icon/glyph/office-building-filled';
import EditorTableDisplayOptionsIcon from '@atlaskit/icon/glyph/editor/table-display-options';
import CanvasIcon from '@atlaskit/icon/glyph/canvas';
import EmailIcon from '@atlaskit/icon/glyph/email';
import QuestionCircleIcon from '@atlaskit/icon/glyph/question-circle';


const categories = [
  {
    id: 'Develop',
    children: [
      { id: 'Authentication', icon: <PeopleIcon />, active: true },
      { id: 'Database', icon: <DnsRoundedIcon /> },
      { id: 'Storage', icon: <PermMediaOutlinedIcon /> },
      { id: 'Hosting', icon: <PublicIcon /> },
      { id: 'Functions', icon: <SettingsEthernetIcon /> },
      { id: 'ML Kit', icon: <SettingsInputComponentIcon /> },
    ],
  },
  {
    id: 'Quality',
    children: [
      { id: 'Analytics', icon: <SettingsIcon /> },
      { id: 'Performance', icon: <TimerIcon /> },
      { id: 'Test Lab', icon: <PhonelinkSetupIcon /> },
    ],
  },
];

const styles = theme => ({
  categoryHeader: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  categoryHeaderPrimary: {
    color: theme.palette.common.white,
  },
  item: {
    paddingTop: 4,
    paddingBottom: 4,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  itemCategory: {
    backgroundColor: '#232f3e',
    boxShadow: '0 -1px 0 #404854 inset',
    paddingTop: 16,
    paddingBottom: 16,
  },
  firebase: {
    fontSize: 15,
    fontFamily: theme.typography.fontFamily,
    color: theme.palette.common.white,
  },
  itemActionable: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
  },
  itemActiveItem: {
    color: '#4fc3f7',
  },
  itemPrimary: {
    color: 'inherit',
    fontSize: theme.typography.fontSize,
    '&$textDense': {
      fontSize: theme.typography.fontSize,
    },
  },
  textDense: {},
  divider: {
    marginTop: theme.spacing.unit * 2,
  },
});

class Navigator extends React.Component {
  
  constructor(props){
    super(props)
    this.state = {
      //navLinks: this.props.navLinks,
      openDrawer: null,
      showBack: false,
      //isOpen: true,

      stack: this.defaultLinks()
    };
  }

  componentDidUpdate(prevProps){
    /*if (!prevProps || !prevProps.currentApp || !this.props || !this.props.currentApp)
      return */

    console.log("update: ", prevProps.currentApp,  "asa", this.props.currentApp)


    if (!prevProps.currentApp && this.props.currentApp ){
      this.resetNav()
    }

    if (prevProps &&  prevProps.currentApp && prevProps.currentApp.key !== this.props.currentApp.key){
      console.log("sdsd")
      // debugger
      this.resetNav()
    }
  
  }

  handlePlatformClick = ()=>{
    this.context.router.history.push(`/apps/${this.props.currentApp.key}`)
    this.addOnsNestedNav()
  }

  resetNav = () => {
    this.setState({
      stack: this.defaultLinks()
    });
  };

  addOnsNestedNav = () => {
    this.setState({
      showBack: true,
      stack: this.navLinks()
    });
  };

  handleBack = ()=>{
    this.setState({
      showBack: false,
      stack: this.defaultLinks()
      
    }, ()=>{
      this.context.router.history.push(`/apps/${this.props.currentApp.key}/`) 
    })
  }

  handleMessagesClick = () => {
    //this.context.router.history.push(`/apps/${this.props.currentApp.key}/conversations`)
    this.context.router.history.push(`/apps/${this.props.currentApp.key}/campaings`)
    this.messagesNestedNav()
  }

  setActiveLink = (link, cb)=>{
    this.setState({
      stack: this.state.stack.map((o)=> (
        o.name === link.name ? 
        Object.assign({}, o, {active: true}) : 
        Object.assign({}, o, {active: false}) ) )
    }, cb )
  }


  defaultLinks = () => {
    if(!this.props.currentApp)
      return []
  
    return [
      { name: 'Platform', icon: EmailIcon, onClick: this.handlePlatformClick },
      { url: `/apps/${this.props.currentApp.key}/conversations`, name: 'Conversations', icon: EmailIcon},
      { onClick: this.handleMessagesClick ,  name: 'Campaigns', EmailIcon },
      { url: `/apps/${this.props.currentApp.key}/settings`, name: 'Settings', icon: EmailIcon}
    ]
  }

  navLinksForMessages = () => {
    const { classes, navLinks } = this.props;
    const context = this.context
    /*if(!this.props.currentApp)
      return []*/
    const appid = `/apps/${this.props.currentApp.key}`
    const links = [
      {url: `${appid}/messages/campaigns`, name: 'Mailing Campaigns', icon: EmailIcon},
      {url: `${appid}/messages/user_auto_messages`, name: 'In App messages', icon: EditorTableDisplayOptionsIcon},
      {url: `${appid}/messages/tours`, name: 'Guided tours', icon: CanvasIcon},
      {url: `${appid}/messages/visitor_auto`, name: 'visitor auto messages', icon: QuestionCircleIcon}
    ]
    return links
  }

  messagesNestedNav = () => {
    this.setState({
      showBack: true,
      stack: this.navLinksForMessages()
      
    });
  };

  navLinks = ()=>{
    return this.props.navLinks
  }

  render(){
    const { classes, navLinks, currentApp, currentUser, ...other } = this.props;
    const context = this.context
    console.log("DDD", this.props.currentApp)

    return (

      <Drawer variant="permanent" {...other}>
        <List disablePadding>


          <ListItem className={classNames(classes.firebase, classes.item, classes.itemCategory)}>
            HERMES
          </ListItem>


          <ListItem
            onClick={() => (context.router.history.push("/apps"))}
            className={classNames(classes.item, classes.itemCategory)}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText
              classes={{
                primary: classes.itemPrimary,
              }}
            >
              Project Overview
          </ListItemText>
          </ListItem>

          {
            this.state.showBack ? 
              <ListItem className={classes.categoryHeader} 
              onClick={this.handleBack}>
                <ListItemText
                  classes={{
                    primary: classes.categoryHeaderPrimary,
                  }}
                >
                  {'<- back'}
              </ListItemText>
              </ListItem> : 
                  this.props.currentApp ? 

                  <ListItem className={classes.categoryHeader} onClick={this.handleBack}>
                    <ListItemText
                      classes={{
                        primary: classes.categoryHeaderPrimary,
                      }}
                    >
                      {this.props.currentApp.name}
                  </ListItemText>
                  </ListItem>  : null
              
          }

          {
            this.state.stack && this.props.currentApp ? this.state.stack.map((o, childId) => (
                  
                <ListItem
                    button
                    dense
                    key={childId}
                    selected={o.active}
                    onClick={(e) => {
                      e.preventDefault()
                      this.setActiveLink(o, ()=>{
                        o.url ? context.router.history.push(o.url) : o.onClick()
                      })
                      
                    }}
                    className={classNames(
                      classes.item,
                      classes.itemActionable,
                      //active && classes.itemActiveItem,
                    )}
                  >
                    <ListItemIcon>{o.icon || EmailIcon}</ListItemIcon>
                    <ListItemText
                      classes={{
                        primary: classes.itemPrimary,
                        textDense: classes.textDense,
                      }}
                    >
                      {o.name}
                    </ListItemText>
                  </ListItem>

                ))

            : null
          }
    

            {/*
              this.props.currentApp ?
                <AkContainerNavigationNested
                  stack={this.state.stack}
                /> : null
              */
            }


            {/*
              navLinks.map((o, childId) => (
                <ListItem
                  button
                  dense
                  key={childId}
                  onClick={(e) => {
                    e.preventDefault()
                    context.router.history.push(o[0])
                  }}
                  className={classNames(
                    classes.item,
                    classes.itemActionable,
                    //active && classes.itemActiveItem,
                  )}
                >
                  <ListItemIcon>icon</ListItemIcon>
                  <ListItemText
                    classes={{
                      primary: classes.itemPrimary,
                      textDense: classes.textDense,
                    }}
                  >
                    {o[1]}
                  </ListItemText>
                </ListItem>

              ))
                  */ }

            <Divider className={classes.divider} />
         
        </List>
      </Drawer>
    );
  }
}


Navigator.contextTypes = {
  navOpenState: PropTypes.object,
  router: PropTypes.object,
};

Navigator.propTypes = {
  classes: PropTypes.object.isRequired,
  navLinks: PropTypes.array.isRequired,
  currentApp: PropTypes.object,
  currentUser: PropTypes.object
};

export default withStyles(styles)(Navigator);
