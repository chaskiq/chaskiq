import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SearchIcon from '@material-ui/icons/Search';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';

const ITEM_HEIGHT = 48;

const useStyles = makeStyles(theme => ({
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatar: {
    width: 25,
    height: 25,
  },
}));

export default function LongMenu(props) {
  const classes = useStyles();
  const assignee = props.conversation.assignee
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [agents, setAgents] = React.useState([]);
  const open = Boolean(anchorEl);
  const conversation = props.conversation

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
    //console.log(props)
    //console.log(conversation)
    getAgents()
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function getAgents(){
    props.getAgents((agents)=> setAgents(agents) )
  }

  function setAgent(option){
    props.setAgent((option.id), (data)=>{
      setTimeout( ()=> handleClose(), 800)
    })
  }

  return (
    <div>

      <Tooltip title="Assign people">

        <IconButton
          aria-label="More"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          {/*<MoreVertIcon />*/}
          { assignee && <Avatar 
            className={classes.avatar}
            src={ assignee.avatarUrl}
          /> }
        </IconButton>

       </Tooltip>




      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            //width: 200,
          },
        }}
      >

        <List dense={true}
          component="nav" 
          aria-label="Assignee">
          <ListItem
            //button
            //aria-haspopup="true"
            //aria-controls="lock-menu"
            aria-label="Assignee"
            
          >
            <ListItemText 
              primary="Assignee" 
              secondary={ assignee ? assignee.email : null } 
            />
          </ListItem>
        </List>


        {/*<MenuItem>
           <div className={classes.searchIcon}>
              <SearchIcon />
            </div>

            <InputBase
              placeholder="Search…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'Search' }}
            />
        </MenuItem>*/}


        {agents.map(option => (
          <MenuItem 
            key={option.id} 
            selected={assignee ? option.id === assignee.id : null } 
            onClick={()=> setAgent(option)}>
            {option.email}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}