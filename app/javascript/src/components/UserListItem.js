import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Badge from '@material-ui/core/Badge';
import gravatar from "gravatar"
import styled from 'styled-components'
import PriorityHighIcon from '@material-ui/icons/PriorityHigh'

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    padding: '0px',
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: 'inline',
  },

  tinyAvatar: {
    width: '20px',
    height: '20px',
    marginRight: '20px',
  },
  flexContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  textMargin: {
    
    color: 'rgba(0, 0, 0, 0.54)'
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

  return (
    <List className={classes.root}>
      <ListItem alignItems="flex-start" 
        style={{
          backgroundColor: props.value === props.object ? 'aliceblue' : 'white'
        }}>
        <ListItemAvatar>
          {/*<Badge
                      className={classes.badge}
                      badgeContent={4} 
                      color="primary"></Badge>*/}
            <Avatar 
              onClick={()=>props.showUserDrawer(props.mainUser.id)}
              alt={props.mainUser.email} 
              src={gravatar.url(props.mainUser.email)} 
            />
          
        </ListItemAvatar>
        <ListItemText
          primary={props.messageUser.displayName}
          secondary={
            <React.Fragment>

              <Typography
                component="span"
                variant="body2"
                className={classes.inline}
                color="textPrimary">

                <div className={classes.flexContainer}>
                  
                  {
                    props.mainUser.id != props.messageUser.id ?
                      <Avatar 
                          onClick={()=>props.showUserDrawer(props.messageUser.id)} 
                          className={classes.tinyAvatar}
                          alt={props.messageUser.email} 
                          src={gravatar.url(props.messageUser.email)} 
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


              {
                /*
                  props.mainUser.id != props.messageUser.id ?

                  <ListItemAvatar>
                    <Avatar  className={classes.tinyAvatar}
                      alt={props.messageUser.email} 
                      src={gravatar.url(props.messageUser.email)} 
                    />
                  </ListItemAvatar> : null

                }
                <span dangerouslySetInnerHTML={
                  { __html: props.message }
                }/>
                */
              }

            </React.Fragment>
          }
        />
      </ListItem>
      <Divider variant="default" component="li" />
    </List>
  );
}

export default AlignItemsList;