import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Divider from '@material-ui/core/Divider'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Badge from '@material-ui/core/Badge'
import Grid from '@material-ui/core/Grid'

import gravatar from "../../shared/gravatar"
import styled from '@emotion/styled'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import Moment from 'react-moment'

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    //maxWidth: 360,
    padding: '0px',
    //backgroundColor: theme.palette.background.paper,
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
    fontSize: '0.8em',
    margin: '5px'
  },
  displayName: {
    width: 'calc(100% - 9px)',
    fontWeight: 'bold'
  },
  highlightedItem: {
    flexFlow: 'column',
    paddingTop: '1.5em',
    paddingBottom: '1.5em',
    backgroundColor: theme.palette.primary.dark
  },
  defaultItem: {
    flexFlow: 'column',
    paddingTop: '1.5em',
    paddingBottom: '1.5em',
    backgroundColor: theme.palette.background.paper
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
  //color: rgba(0, 0, 0, 0.54);
  p{
    margin: 0px;
  }
`


function AlignItemsList(props) {
  const classes = useStyles();
  const participant = props.conversation.mainParticipant

  const renderAppBlock = ()=>{

    const message = props.messageObject.message

    if(message.blocks){
      
      const replied = message.state === "replied"
   
      const data = message.data

      return <div>
              
              <p>
                {`[${message.blocks.type}] `}
                {replied && <span>&#10003;{" "}<br/></span>}
              
              {
                data && Object.keys(data).map((o)=>{
                  return <span>{o}: {data[o]}<br/></span>
                })
              }
              </p>
             </div>

    }

    return null

  }

  return (
    <List className={classes.root}>
      <ListItem 
        //alignItems="flex-start" 
        className={
          props.value === props.object ? 
          classes.highlightedItem : classes.defaultItem
        }>

        <Grid 
          container 
          alignItems={"center"}
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

          <Grid item item xs={10} zeroMinWidth>
              <Typography
                noWrap
                component="span"
                variant="overline"
                display={"block"}
                className={classes.displayName}
                color="textPrimary">
                {participant.displayName || 'Site visitor'}

                {
                  props.messageObject.createdAt &&
                  <Typography
                    component="span"
                    variant="subtitle2"
                    className={classes.time}
                    color="textSecondary">
                    <span 
                      style={{padding: '.5em'}}>
                      {"·"}
                    </span>
                    <Moment fromNow ago>
                      {props.messageObject.createdAt}
                    </Moment>
                  </Typography>
                }

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


                {
                  renderAppBlock()
                }

                {
                  !props.messageObject.blocks &&  <ContentContent 
                                              variant={"body2"}
                                              noWrap 
                                              color={"secondary"}
                                              dangerouslySetInnerHTML={
                                                { __html: props.message }
                                                }
                                            />
                }

              </div>

          </Grid>
        
        </Grid>


      </ListItem>

      <Divider variant="fullWidth" component="li" />
    </List>
  );
}

export default AlignItemsList;