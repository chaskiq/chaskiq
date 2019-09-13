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
    fontSize: '0.7em',
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

const ContentContent = styled.div`

  color: rgba(0, 0, 0, 0.54);
  width: 100%;
  margin: 0em;
  display: inline-block;
  overflow: hidden;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
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
          justify={"space-between"}>
        
          <Grid item className={classes.avatarMargin}>
            <Avatar 
                className={classes.participantAvatar}
                onClick={()=>props.showUserDrawer(participant.id)}
                alt={participant.email} 
                src={gravatar(participant.email)} 
            />
          </Grid>

          <Grid item style={{width: 'calc(100% - 101px)'}}>
              <Typography
                noWrap
                component="span"
                variant="subtitle2"
                display={"block"}
                className={classes.displayName}
                color="textPrimary">
                {participant.displayName || 'Site visitor'}
              </Typography>


              <Grid container>

                <Typography
                  component="span"
                  //variant="h6"
                  display="inline"
                  //className={classes.inline}
                  color="textPrimary">
      
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
                      dangerouslySetInnerHTML={
                      { __html: props.message }
                      }
                    />

                  </div>
      
                </Typography>
      
              </Grid>


          </Grid>

          <Grid item style={{alignSelf: "flex-start"}}>
            
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

        {/*
        
        <ListItemAvatar>
              <Avatar 
              onClick={()=>props.showUserDrawer(props.messageUser.id)}
              alt={props.messageUser.email} 
              src={gravatar(props.messageUser.email)} 
            />
          
        </ListItemAvatar>

        <ListItemText
          primary={
            <Grid container justify={"space-between"}>

            <Grid item>
              <Typography
                  noWrap
                  component="span"
                  variant="subtitle2"
                  display={"inline"}
                  className={classes.displayName}
                  color="textPrimary">
                  {props.messageUser.displayName}
              </Typography>
            </Grid>

            

              <Grid item>

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
            
          }
          secondary={
            <React.Fragment>

              <Typography
                component="span"
                //variant="h6"
                display="inline"
                //className={classes.inline}
                color="textPrimary">

                <div className={classes.flexContainer}>
                  
                  {
                    props.messageUser.id != props.messageUser.id ?
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

                  <span className={classes.textMargin} 
                    dangerouslySetInnerHTML={
                    { __html: props.message }
                  }/>

           
                                 

                </div>

              </Typography>




            </React.Fragment>
          }
        />
          
        */}


      </ListItem>

      <Divider variant="fullWidth" component="li" />
    </List>
  );
}

export default AlignItemsList;