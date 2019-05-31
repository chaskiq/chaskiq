import React from 'react';
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

import BookIcon from '@material-ui/icons/Book';

import SmsIcon from '@material-ui/icons/Sms';

// TODO: icons to change
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

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';

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

  const appid = `/apps/${props.currentApp.key}`

  const [expanded, setExpanded] = React.useState('Platform');

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const categories = [

    {
      id: 'Platform',
      icon: <PeopleIcon style={{ fontSize: 30 }}/>,
      children: props.currentApp.segments.map((o)=>(
        { id: o.name , 
          icon:  null, 
          url: `/apps/${props.currentApp.key}/segments/${o.id}`
        }
      ))
    },
    {
      id: 'Conversations',
      children: [
        { id: 'Conversations', icon:  <SmsIcon/>, url: `/apps/${props.currentApp.key}/conversations`},
      ],
    },
    {
      id: 'Campaigns',
      children: [
        /*{ id: 'Analytics', icon: <SettingsIcon /> },
        { id: 'Performance', icon: <TimerIcon /> },
        { id: 'Test Lab', icon: <PhonelinkSetupIcon /> },*/
        { id: 'Mailing Campaigns', icon: <EmailIcon/>, url: `${appid}/messages/campaigns`},
        { id: 'In App messages', icon: <EditorTableDisplayOptionsIcon/>, url: `${appid}/messages/user_auto_messages`},
        { id: 'Guided tours', icon: <CanvasIcon/>, url: `${appid}/messages/tours`,},
        { id: 'visitor auto messages', icon: <QuestionCircleIcon/>, url: `${appid}/messages/visitor_auto`}
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
        { id: 'App Settings', icon:  <SettingsIcon/>, url: `/apps/${props.currentApp.key}/settings`, },
        { id: 'Authentication', icon: <PeopleIcon />, active: true },
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
          HERMES
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
                  {icon ? <ListItemIcon>{icon}</ListItemIcon> : null }
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
  currentApp: PropTypes.object,
  currentUser: PropTypes.object
};

export default withStyles(styles)(Navigator);

