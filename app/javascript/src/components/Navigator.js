import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import MuiFab from '@material-ui/core/Fab';
import Drawer from '@material-ui/core/Drawer';
import Tooltip from '@material-ui/core/Tooltip';
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
import ExpandMore from '@material-ui/icons/ExpandMore';
import PhonelinkSetupIcon from '@material-ui/icons/PhonelinkSetup';
import EmailIcon from '@material-ui/icons/Email';
import BookIcon from '@material-ui/icons/Book';
import FlipToFrontIcon from '@material-ui/icons/FlipToFront'
import SmsIcon from '@material-ui/icons/Sms';
import ShuffleIcon from '@material-ui/icons/Shuffle'
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle'
import MessageIcon from '@material-ui/icons/Message'
import FilterFramesIcon from '@material-ui/icons/FilterFrames'
import FolderIcon from '@material-ui/icons/Folder'

import {
  QuestionAnswerOutlined,
  FlagOutlined,
  BookOutlined,
  SettingsOutlined,
  DomainOutlined,
  DeviceHubOutlined
} from '@material-ui/icons'

import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';


import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import ListMenu from './ListMenu'
import { Typography } from '@material-ui/core';


const styles = theme => ({
  categoryHeader: {
    //paddingTop: 16,
    //paddingBottom: 16,
  },
  categoryHeaderPrimary: {
    color: theme.palette.common.main,
  },
  item: {
    paddingTop: 4,
    paddingBottom: 4,
    //color: 'rgba(255, 255, 255, 0.7)',
    color: '#000'
  },
  itemCategory: {
    //backgroundColor: '#232f3e',
    //boxShadow: '0 -1px 0 #404854 inset',
    boxShadow: '0 -1px 0 #ececec inset',
    paddingTop: 16,
    paddingBottom: 16,
  },
  firebase: {
    fontSize: 40,
    fontFamily: theme.typography.fontFamily,
    color: theme.palette.common.black,
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
    marginTop: theme.spacing(2),
    backgroundColor: 'rgba(58, 56, 56, 0.08)',
  },
  expansionPanelSummary: {
    //display: 'inherit',
    //padding: '0px'
  },
   expansionPanelDetails: {
    display: 'inherit',
    padding: '0px'
  }
});

const ExpansionPanel = withStyles({
  root: {
    //border: '1px solid rgba(0, 0, 0, .125)',
    //boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    //'&:before': {
    //  display: 'none',
    //},
    '&$expanded': {
      //margin: 'auto',
    },
  },
  expanded: {},
})(MuiExpansionPanel);

const Fab = withStyles({
  root: {
    boxShadow: '0px 0px 0px',
  }
})(MuiFab);

function Navigator(props, context) {
  const { 
    classes, 
    current_page, 
    app, 
    match,
    location,
    visitApp,
    apps,
    onClose,
    ...other 
  } = props;

  const appid = `/apps/${app.key}`

  const [expanded, setExpanded] = useState(current_page);

  let routerListener = null

  useEffect( () => { 
    setExpanded(current_page) 
  }, [ current_page ] );

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const categories = [

    {
      id: 'Platform',
      icon: <DomainOutlined style={{ fontSize: 30 }}/>,
      children: app.segments.map((o)=>(
        { id: o.name , 
          icon:  null, 
          url: `/apps/${app.key}/segments/${o.id}`
        }
      ))
    },
    {
      id: 'Conversations',
      icon: <QuestionAnswerOutlined style={{ fontSize: 30 }}/>,
      children: [
        { id: 'Conversations', icon:  <SmsIcon/>, url: `/apps/${app.key}/conversations`},
        { id: 'Assigment Rules', icon:  <ShuffleIcon/>, url: `/apps/${app.key}/conversations/assignment_rules`},
      ],
    },
    {
      id: 'Campaigns',
      icon: <FlagOutlined style={{ fontSize: 30 }}/>,
      children: [
        /*{ id: 'Analytics', icon: <SettingsIcon /> },
        { id: 'Performance', icon: <TimerIcon /> },
        { id: 'Test Lab', icon: <PhonelinkSetupIcon /> },*/
        { id: 'Mailing Campaigns', icon: <EmailIcon/>, url: `${appid}/messages/campaigns`},
        { id: 'In App messages', icon: <MessageIcon/>, url: `${appid}/messages/user_auto_messages`},
        { id: 'Guided tours', icon: <FilterFramesIcon/>, url: `${appid}/messages/tours`,},
      ],
    },

    {
      id: 'Bot',
      icon: <DeviceHubOutlined style={{ fontSize: 30 }}/>,
      children: [
        /*{ id: 'Analytics', icon: <SettingsIcon /> },
        { id: 'Performance', icon: <TimerIcon /> },
        { id: 'Test Lab', icon: <PhonelinkSetupIcon /> },*/
        { id: 'For Leads', icon: <EmailIcon/>, url: `${appid}/bots/leads`},
        { id: 'For Users', icon: <MessageIcon/>, url: `${appid}/bots/users`},
        { id: 'Settings', icon: <FlipToFrontIcon/>, url: `${appid}/bots/settings`}
      ],
    },

    {
      id: 'Help Center',
      icon: <BookOutlined style={{ fontSize: 30 }}/>,
      children: [
        { id: 'Articles', icon: <BookIcon/>, url: `/apps/${app.key}/articles`},
        { id: 'Collections', icon: <FolderIcon/>, url: `/apps/${app.key}/articles/collections`},
        { id: 'Settings', icon: <SettingsIcon/>, url: `/apps/${app.key}/articles/settings`},
      ],
    },

    {
      id: 'Settings',
      icon: <SettingsOutlined style={{ fontSize: 30 }}/>,
      children: [
        { id: 'App Settings', icon:  <SettingsIcon/>, url: `/apps/${app.key}/settings`, },
        { id: 'Team', icon: <SupervisedUserCircleIcon />, url: `/apps/${app.key}/team`, active: false },
        { id: 'Authentication', icon: <ShuffleIcon />, active: true },
      ],
    },
    /*
    {
      id: 'Develop',
      icon: <PeopleIcon style={{ fontSize: 30 }}/>,
      children: [
        { id: 'Api', icon: <DnsRoundedIcon /> },
        { id: 'Storage', icon: <PermMediaOutlinedIcon /> },
        { id: 'Hosting', icon: <PublicIcon /> },
        { id: 'Functions', icon: <SettingsEthernetIcon /> },
        { id: 'ML Kit', icon: <SettingsInputComponentIcon /> },
      ],
    },*/
  ];

  function renderItemList(){
    return (
      categories.map(({ id, icon, children }) => (
        <ExpansionPanel 
          key={id}
          expanded={expanded === id} 
          onChange={handleChange(id)}>


          <ExpansionPanelSummary 
            aria-controls="panel1d-content" 
            id="panel1d-header"
            className={classes.expansionPanelSummary}>
              <ListItem className={classes.categoryHeader}>
                {
                  icon ? 
                    <ListItemIcon>{icon}</ListItemIcon> : 
                  null 
                }
                <ListItemText
                  classes={{
                    primary: classes.categoryHeaderPrimary,
                  }}
                >
                  {id}
                </ListItemText>
              </ListItem>
          </ExpansionPanelSummary>

          <ExpansionPanelDetails  className={classes.expansionPanelDetails}>
            {children.map(({ id: childId, icon, active, url, onClick }) => (
                <ListItem
                  button
                  dense
                  key={childId}
                  className={clsx(
                    classes.item,
                    classes.itemActionable,
                    active && classes.itemActiveItem,
                  )}
                  onClick={(e) => {
                    e.preventDefault()
                    //this.setActiveLink(o, ()=>{
                      url ? context.router.history.push(url) : onClick()
                    //})
                  }}
                >
                  {icon ? <ListItemIcon>{icon}</ListItemIcon> : null }
                  <ListItemText
                    classes={{
                      primary: classes.itemPrimary,
                      dense: classes.textDense,
                    }}
                  >
                    {childId}
                  </ListItemText>
                </ListItem>
              ))}
              <Divider className={classes.divider} />
      
          </ExpansionPanelDetails>

        </ExpansionPanel>
      ))
    )
  }

  function renderListHeader(){
    return <React.Fragment>
              <ListItem className={clsx(classes.firebase, classes.item, classes.itemCategory)}>
                CHASKIQ
              </ListItem>
              <ListItem 
                className={clsx(classes.item, classes.itemCategory)}
                >
                <ListItemIcon>
                  <HomeIcon onClick={(e) => {
                    e.preventDefault()
                    context.router.history.push(`/apps/${app.key}`)
                  }} />
                </ListItemIcon>
                <ListItemText
                  classes={{
                    primary: classes.itemPrimary,
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    context.router.history.push(`/apps/${app.key}`)
                  }}
                >
                  Project Overview
                </ListItemText>

                <ListItemIcon>
                  
                    <ListMenu 
                      handleClick={visitApp} 
                      options={apps}
                      button={  <Tooltip 
                                  title="Switch project" 
                                  placement="bottom">
                                  <Fab 
                                    variant="inherit"
                                    size="small">
                                    <ExpandMore />
                                  </Fab>
                                </Tooltip>
                              }
                    />
                  
                </ListItemIcon>
              </ListItem>


              
            </React.Fragment>
  }

  return (
    <Drawer 
      PaperProps={props.PaperProps}
      variant={props.variant}
      open={props.open}
      onClose={props.onClose}
      >
      <List disablePadding>
        
        {renderListHeader()}
        {renderItemList()}

      </List>
    </Drawer>
  );
}

Navigator.contextTypes = {
  router: PropTypes.object,
};


Navigator.propTypes = {
  open: PropTypes.bool,
  classes: PropTypes.object.isRequired,
  app: PropTypes.object,
  currentUser: PropTypes.object
};

//export default withStyles(styles)(Navigator);

function mapStateToProps(state, ownProps) {

  const { 
    auth, 
    app, 
    segment, 
    app_users,
    current_user, 
    current_page 
  } = state
  const { loading, isAuthenticated } = auth

  return {
    /*current_user,
    segment,
    app_users,
    app,
    loading,
    isAuthenticated,*/
    app,
    current_page,
  }
}

export default withRouter(connect(mapStateToProps)(withStyles(styles)(Navigator)))
//export default withStyles(styles)(withRouter(connect(mapStateToProps)( Navigator )))


