import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import {
  List,
  ListItem,
  Divider,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Badge,
  Grid 
} from '@material-ui/core';

import gravatar from "../../shared/gravatar"
import styled from '@emotion/styled'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import Moment from 'react-moment'
const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    //maxWidth: 360,
    padding: '0px',
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: 'inline',
  },

  tinyAvatar: {
    width: '20px',
    height: '20px',
    marginRight: '8px',
  },
  participantAvatar: {
    //margin: 10,
    width: 40,
    height: 40,
  },
  flexContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  textMargin: {
    color: 'rgba(0, 0, 0, 0.54)',
    margin: '0em',
    //marginTop: '0.5em',
    //marginBottom: '.5em'
    color: 'rgba(0, 0, 0, 0.54)',
    margin: '0em',
    fontSize: '14px',
    display: 'inline-block',
    overflow: 'hidden',
    width: '100%',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  avatarMargin: {
    marginRight: '10px',
  },
  time: {
    fontSize: '0.6em',
  },
  displayName: {
    width: 'calc(100% - 9px)',
    fontWeight: 'bold'
  }


  /*badge: {
    top: '50%',
    right: -3,
    // The border color match the background color.
    border: `2px solid ${
      theme.palette.type === 'light' ? theme.palette.grey[200] : theme.palette.grey[900]
    }`,
  },*/


}));

const PrivateNoteIndicator = styled.div`
  width: 5px;
  height: 19px;
  background-color: #feedaf;
  margin-right: 7px;
  border: 1px solid #f1e1a9;
`

const ContentContent = styled(Typography)`
  color: rgba(0, 0, 0, 0.54);
  p{
    margin: 0px;
  }
`


function AlignItemsList(props) {
  const classes = useStyles();
  const participant = props.conversation.mainParticipant

  return (
    <List className={classes.root}>
      <ListItem 
        //alignItems="flex-start" 
        style={{
          flexFlow: 'column',
          paddingTop: '1.5em',
          paddingBottom: '1.5em',
          backgroundColor: props.value === props.object ? 'aliceblue' : 'white'
        }}>

        <Grid 
          container alignItems={"center"}
          wrap="nowrap" 
          justify={"space-between"}>

          
        
          <Grid item item xs={1}>
            <Avatar 
                className={classes.participantAvatar}
                onClick={()=>props.showUserDrawer(participant.id)}
                alt={participant.email} 
                src={gravatar(participant.email)} 
            />
          </Grid>

          <Grid item item xs={7} zeroMinWidth>
              <Typography
                noWrap
                component="span"
                variant="overline"
                display={"block"}
                className={classes.displayName}
                color="textPrimary">
                {participant.displayName || 'Site visitor'}
              </Typography>

              <div className={classes.flexContainer}>
                
                {
                  props.messageUser.id != participant.id ?
                    <Avatar 
                        onClick={()=>props.showUserDrawer(props.messageUser.id)} 
                        className={classes.tinyAvatar}
                        alt={props.messageUser.email} 
                        src={gravatar(props.messageUser.email)} 
                    /> : null 
                }
  
                {
                  props.messageObject.privateNote ? 
                    <PrivateNoteIndicator/> : null
                }
  
                {
                  props.conversation.priority ? 
                    <PriorityHighIcon 
                      color={'primary'}
                    /> : null
                }
  
                <ContentContent 
                  variant={"body2"}
                  noWrap 
                  color={"secondary"}
                  dangerouslySetInnerHTML={
                    { __html: props.message }
                    }
                />

                {/* 
                <ContentContent
                  dangerouslySetInnerHTML={
                  { __html: props.message }
                  }
                />*/}

              </div>

          </Grid>

          <Grid item item xs={2}>
            
            {
              props.messageObject.createdAt &&
              <Typography
                component="span"
                variant="subtitle2"
                className={classes.time}
                color="textSecondary">
                <Moment fromNow ago>
                  {props.messageObject.createdAt}
                </Moment>
              </Typography>
            } 
          </Grid>
        
        </Grid>


      </ListItem>

      <Divider variant="fullWidth" component="li" />
    </List>
  );
}

export default AlignItemsList;