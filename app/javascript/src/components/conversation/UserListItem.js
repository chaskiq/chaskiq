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
  flexContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  textMargin: {
    color: 'rgba(0, 0, 0, 0.54)',
    marginTop: '0.5em',
    marginBottom: '.5em'
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


function AlignItemsList(props) {
  const classes = useStyles();
  const participant = props.conversation.mainParticipant

  return (
    <List className={classes.root}>
      <ListItem 
        //alignItems="flex-start" 
        style={{
          flexFlow: 'column',
          backgroundColor: props.value === props.object ? 'aliceblue' : 'white'
        }}>

        <Grid 
          container alignItems={"center"} 
          justify={"space-between"}>
        
          <Grid item>
            <Avatar 
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

              <span className={classes.textMargin} 
                dangerouslySetInnerHTML={
                { __html: props.message }
              }/>

      
                            

            </div>

          </Typography>

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