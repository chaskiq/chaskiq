import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
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
import EmailIcon from '@material-ui/icons/Email';
import BookIcon from '@material-ui/icons/Book';
import FlipToFrontIcon from '@material-ui/icons/FlipToFront'
import SmsIcon from '@material-ui/icons/Sms';
import ShuffleIcon from '@material-ui/icons/Shuffle'

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';


import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'


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

function Navigator(props, context) {
  const { classes, ...other } = props;

  const appid = `/apps/${props.app.key}`

  const [expanded, setExpanded] = useState(props.current_page);

  useEffect( () => { 
    setExpanded(props.current_page) 
  }, [ props.current_page ] );

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const categories = [

    {
      id: 'Platform',
      icon: <PeopleIcon style={{ fontSize: 30 }}/>,
      children: props.app.segments.map((o)=>(
        { id: o.name , 
          icon:  null, 
          url: `/apps/${props.app.key}/segments/${o.id}`
        }
      ))
    },
    {
      id: 'Conversations',
      children: [
        { id: 'Conversations', icon:  <SmsIcon/>, url: `/apps/${props.app.key}/conversations`},
        { id: 'Assigment Rules', icon:  <ShuffleIcon/>, url: `/apps/${props.app.key}/conversations/assignment_rules`},
      ],
    },
    {
      id: 'Campaigns',
      children: [
        /*{ id: 'Analytics', icon: <SettingsIcon /> },
        { id: 'Performance', icon: <TimerIcon /> },
        { id: 'Test Lab', icon: <PhonelinkSetupIcon /> },*/
        { id: 'Mailing Campaigns', icon: <EmailIcon/>, url: `${appid}/messages/campaigns`},
        { id: 'In App messages', icon: <FlipToFrontIcon/>, url: `${appid}/messages/user_auto_messages`},
        { id: 'Guided tours', icon: <FlipToFrontIcon/>, url: `${appid}/messages/tours`,},
        { id: 'visitor auto messages', icon: <FlipToFrontIcon/>, url: `${appid}/messages/visitor_auto`}
      ],
    },

    {
      id: 'App\'s Knowledgebase',
      children: [
        /*{ id: 'Analytics', icon: <SettingsIcon /> },
        { id: 'Performance', icon: <TimerIcon /> },
        { id: 'Test Lab', icon: <PhonelinkSetupIcon /> },*/
        { id: 'Articles', icon: <BookIcon/>, url: `${appid}/messages/campaigns`},
      ],
    },

    {
      id: 'Settings',
      children: [
        { id: 'App Settings', icon:  <SettingsIcon/>, url: `/apps/${props.app.key}/settings`, },
        { id: 'Authentication', icon: <ShuffleIcon />, active: true },
      ],
    },
    {
      id: 'Develop',
      children: [
        { id: 'Api', icon: <DnsRoundedIcon /> },
        { id: 'Storage', icon: <PermMediaOutlinedIcon /> },
        { id: 'Hosting', icon: <PublicIcon /> },
        { id: 'Functions', icon: <SettingsEthernetIcon /> },
        { id: 'ML Kit', icon: <SettingsInputComponentIcon /> },
      ],
    },
  ];

  return (
    <Drawer variant="permanent" {...other}>
      <List disablePadding>
        <ListItem className={clsx(classes.firebase, classes.item, classes.itemCategory)}>
          CHASKIQ
        </ListItem>
        <ListItem className={clsx(classes.item, classes.itemCategory)}>
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

        {categories.map(({ id, icon, children }) => (

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
        ))}
      </List>
    </Drawer>
  );
}


Navigator.contextTypes = {
  navOpenState: PropTypes.object,
  router: PropTypes.object,
};

Navigator.propTypes = {
  classes: PropTypes.object.isRequired,
  navLinks: PropTypes.array.isRequired,
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
    current_user,
    segment,
    app_users,
    app,
    loading,
    isAuthenticated,
    current_page,
  }
}

export default withStyles(styles)(withRouter(connect(mapStateToProps)( Navigator )))


