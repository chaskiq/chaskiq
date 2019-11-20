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
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd'
import PermIdentityIcon from '@material-ui/icons/PermIdentity'
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

import QuestionAnswerOutlined from '@material-ui/icons/QuestionAnswerOutlined'
import FlagOutlined from '@material-ui/icons/FlagOutlined'
import BookOutlined from '@material-ui/icons/BookOutlined'
import SettingsOutlined from '@material-ui/icons/SettingsOutlined'
import DomainOutlined from '@material-ui/icons/DomainOutlined'
import DeviceHubOutlined from '@material-ui/icons/DeviceHubOutlined'

import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';


import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import ListMenu from './ListMenu'
import Typography from '@material-ui/core/Typography';


const styles = theme => ({
  categoryHeader: {
    //paddingTop: 16,
    //paddingBottom: 16,
  },
  categoryHeaderPrimary: {
    color: theme.palette.common.main,
  },
  logo: {
    background: `url(${theme.palette.primary.logo})`,
    width: '100%',
    height: '57px',
    backgroundSize: '100%',
    backgroundRepeat: 'no-repeat'
  },
  item: {
    paddingTop: 4,
    paddingBottom: 4,
    //color: 'rgba(255, 255, 255, 0.7)',
    //color: theme.palette.primary.contrastText,
  },
  itemCategory: {
    //backgroundColor: '#232f3e',
    //boxShadow: '0 -1px 0 #404854 inset',
    boxShadow: `0 -1px 0 ${theme.palette.primary.borders} inset`,
    paddingTop: 16,
    paddingBottom: 16,
  },
  chaskiq: {
    fontSize: 24,
    fontFamily: theme.typography.fontFamily,
    //color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.background.default
  },
  itemActionable: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
  },
  itemActiveItem: {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.background.default
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

    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 0,
      borderBottom: '1px solid rgba(0, 0, 0, .125)',
      borderTop: '1px solid rgba(0, 0, 0, .125)',
    },

    //border: '1px solid rgba(0, 0, 0, .125)',
    //boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    //'&:before': {
    //  display: 'none',
    //},
  },
  expanded: {},
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
  root: {
    padding: 0,
  },
  expanded: {
    padding: 0,
  },
})(MuiExpansionPanelSummary);


const Fab = withStyles({
  root: {
    boxShadow: '0px 0px 0px',
  }
})(MuiFab);

function Navigator(props, context) {
  const { 
    classes, 
    navigation,
    app, 
    match,
    location,
    visitApp,
    apps,
    onClose,
    ...other 
  } = props;

  const {current_page, current_section} = navigation

  const appid = `/apps/${app.key}`

  const [expanded, setExpanded] = useState(current_section);

  let routerListener = null

  useEffect( () => { 
    setExpanded(current_section) 
  }, [ current_section ] );

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  function isActivePage(page){
    return current_page === page
  }

  const categories = [

    {
      id: 'Platform',
      icon: <DomainOutlined style={{ fontSize: 30 }}/>,
      children: app.segments.map((o)=>(
        { id: o.name , 
          icon:  null, 
          url: `/apps/${app.key}/segments/${o.id}`,
          active: isActivePage(`segment-${o.id}`)
        }
      ))
    },
    {
      id: 'Conversations',
      icon: <QuestionAnswerOutlined style={{ fontSize: 30 }}/>,
      children: [
        { id: 'Conversations', icon:  <SmsIcon/>, url: `/apps/${app.key}/conversations`, active: isActivePage("Conversations") },
        { id: 'Assigment Rules', icon:  <ShuffleIcon/>, url: `/apps/${app.key}/conversations/assignment_rules`, active: isActivePage("Assigment Rules") },
      ],
    },
    {
      id: 'Campaigns',
      icon: <FlagOutlined style={{ fontSize: 30 }}/>,
      children: [
        /*{ id: 'Analytics', icon: <SettingsIcon /> },
        { id: 'Performance', icon: <TimerIcon /> },
        { id: 'Test Lab', icon: <PhonelinkSetupIcon /> },*/
        { id: 'campaigns', label: 'Mailing Campaigns', icon: <EmailIcon/>, url: `${appid}/messages/campaigns`, active: isActivePage("campaigns")  },
        { id: 'user_auto_messages', label: 'In App messages', icon: <MessageIcon/>, url: `${appid}/messages/user_auto_messages`, active: isActivePage("user_auto_messages")},
        { id: 'tours', label: 'Guided tours',  icon: <FilterFramesIcon/>, url: `${appid}/messages/tours`, active: isActivePage("tours")},
      ],
    },

    {
      id: 'Routing Bots',
      icon: <DeviceHubOutlined style={{ fontSize: 30 }}/>,
      children: [
        { id: 'For Leads', icon: <AssignmentIndIcon/>, url: `${appid}/bots/leads`, active: isActivePage("botleads")},
        { id: 'For Users', icon: <PermIdentityIcon/>, url: `${appid}/bots/users`, active: isActivePage("botusers")},
        { id: 'Settings', icon: <SettingsIcon/>, url: `${appid}/bots/settings`, active: isActivePage("botSettings")}
      ],
    },

    {
      label: 'Help Center',
      id: 'HelpCenter',
      icon: <BookOutlined style={{ fontSize: 30 }}/>,
      children: [
        { id: 'Articles', icon: <BookIcon/>, url: `/apps/${app.key}/articles`, active: isActivePage("articles")},
        { id: 'Collections', icon: <FolderIcon/>, url: `/apps/${app.key}/articles/collections`, active: isActivePage("collections")},
        { id: 'Settings', icon: <SettingsIcon/>, url: `/apps/${app.key}/articles/settings`, active: isActivePage("settings")},
      ],
    },

    {
      id: 'Settings',
      icon: <SettingsOutlined style={{ fontSize: 30 }}/>,
      children: [
        { id: 'App Settings', icon:  <SettingsIcon/>, url: `/apps/${app.key}/settings`, active: isActivePage("app_settings") },
        { id: 'Team', icon: <SupervisedUserCircleIcon />, url: `/apps/${app.key}/team`, active: isActivePage("team") },
        //{ id: 'Authentication', icon: <ShuffleIcon />, active: isActivePage("user_auto_messages")},
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
      categories.map(({ id, label, icon, children }) => {
        return <ExpansionPanel 
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
                  {label || id}
                </ListItemText>
              </ListItem>
          </ExpansionPanelSummary>

          <ExpansionPanelDetails className={classes.expansionPanelDetails}>
            {children.map(({ id: childId, label, icon, active, url, onClick }) => (
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
                    {label || childId}
                  </ListItemText>
                </ListItem>
              ))}
              <Divider className={classes.divider} />
      
          </ExpansionPanelDetails>

        </ExpansionPanel>
      })
    )
  }

  function renderListHeader(){
    return <React.Fragment>
              <ListItem className={clsx(classes.chaskiq, classes.item, classes.itemCategory)}>
                <div className={classes.logo} />
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
                                    variant="round"
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
    navigation,
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
    navigation,
  }
}

export default withRouter(connect(mapStateToProps)(withStyles(styles)(Navigator)))
//export default withStyles(styles)(withRouter(connect(mapStateToProps)( Navigator )))


