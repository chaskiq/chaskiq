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


const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
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

function AlignItemsList(props) {
  const classes = useStyles();

  return (
    <List className={classes.root}>
      <ListItem alignItems="flex-start">
        <ListItemAvatar>
          {/*<Badge
                      className={classes.badge}
                      badgeContent={4} 
                      color="primary"></Badge>*/}
            <Avatar 
              alt={props.mainUser.email} 
              src={gravatar.url(props.mainUser.email)} 
            />
          
        </ListItemAvatar>
        <ListItemText
          primary={props.messageUser.email}
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
                      <Avatar  className={classes.tinyAvatar}
                          alt={props.messageUser.email} 
                          src={gravatar.url(props.messageUser.email)} 
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
      <Divider variant="inset" component="li" />
    </List>
  );
}

export default AlignItemsList;