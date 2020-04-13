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
import styled from '@emotion/styled'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'
import Moment from 'react-moment'
import { lighten } from "polished";
import {toCamelCase} from '../../shared/caseConverter'


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
    width: '2.3rem',
    height: '2.3rem',
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
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  highlightedItem: {
    flexFlow: 'column',
    paddingTop: '.7em',
    paddingBottom: '1.2em',
    backgroundColor: theme.palette.background.default,
    cursor: 'pointer'
  },
  defaultItem: {
    flexFlow: 'column',
    paddingTop: '.7em',
    paddingBottom: '1.2em',
    backgroundColor: theme.palette.background.paper,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: lighten(0.05, theme.palette.background.default)
    }
  },
  contentContent: {
    color: theme.palette.common.gray,
    fontSize: '0.9em'
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
  max-width: 17vw;
  font-size: .9em;
  
  @media (min-width: 320px) and (max-width: 480px) {
    max-width: 61vw;
  }

  p{
    margin: 0px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 17vw;
    @media (min-width: 320px) and (max-width: 480px) {
      max-width: 61vw;
    }
  }
`


function AlignItemsList(props) {
  const classes = useStyles();
  const participant = props.conversation.mainParticipant

  const renderAppBlock = ()=>{

    const message = toCamelCase(props.messageObject.message)
    const {blocks} = message

    if(blocks){
      
      const replied = message.state === "replied"
   
      const data = message.data

      return <div className={classes.contentContent}>
              
              <Typography variant="overline">
                {blocks.app_package || blocks.appPackage} 
              </Typography>

              <br/>
              
              <Typography variant={'caption'} >
                { 
                  data && <span
                    dangerouslySetInnerHTML={
                    { __html: data.formatted_text || data.formattedText }
                  }/> 
                }
              </Typography>

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

          <Grid item item xs={3}>
            <Avatar 
                className={classes.participantAvatar}
                onClick={()=>props.showUserDrawer(participant.id)}
                alt={participant.email} 
                src={participant.avatarUrl} 
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
                  props.messageUser && props.messageUser.id != participant.id ?
                    <Avatar 
                        onClick={()=>props.showUserDrawer(props.messageUser.id)} 
                        className={classes.tinyAvatar}
                        alt={props.messageUser.email} 
                        src={props.messageUser.avatarUrl} 
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
                                              className={classes.contentContent}
                                              noWrap 
                                              //color={"secondary"}
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