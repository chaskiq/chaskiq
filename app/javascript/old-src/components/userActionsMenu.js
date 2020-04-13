import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Typography from '@material-ui/core/Typography'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'

import MoreVertIcon from '@material-ui/icons/MoreVert';
import UnsubscribeIcon from '@material-ui/icons/Unsubscribe'
import BlockIcon from '@material-ui/icons/Block'
import ArchiveIcon from '@material-ui/icons/Archive'

const options = [
  {
    title: 'Archive',
    description: 'Archive this person and their conversation history',
    icon: <ArchiveIcon/>,
    id: 'archive',
    state: 'archived'
  },
  {
    title: 'Block',
    description: 'Blocks them so you won’t get their replies',
    icon: <BlockIcon/>,
    id: 'block',
    state: 'blocked'
  },

  { 
    title: 'Unsubscribe',
    description: 'Removes them from your email list',
    icon: <UnsubscribeIcon/>,
    id: 'unsubscribe',
    state: 'unsubscribed'
  }
];

const ITEM_HEIGHT = 48;

export default function UserActionsMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleSelected(option){

    props.handleClick(option)

    setAnchorEl(null);
  }

  return (
    <div>
      <IconButton
        aria-label="More"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handleClick}
        color={"inherit"}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            //maxHeight: ITEM_HEIGHT * 4.5,
            //width: 200,
          },
        }}
      >
        {options.map((option)=> (
          <MenuItem key={`action-menu-${option.title}`} 
            selected={option.state === props.selected} 
            onClick={()=> handleSelected(option)}>

            <ListItemIcon>
              {option.icon}
            </ListItemIcon>

            <ListItemText 
              primary={option.title}
              secondary={option.description}
            />
     
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}