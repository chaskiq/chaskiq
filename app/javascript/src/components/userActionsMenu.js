import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {Typography, ListItemText, ListItemIcon} from '@material-ui/core';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import UnsubscribeIcon from '@material-ui/icons/Unsubscribe'
import BlockIcon from '@material-ui/icons/Block'
import ArchiveIcon from '@material-ui/icons/Archive'

const options = [
  {
    title: 'Archive',
    description: 'Archive this person and their conversation history',
    icon: <ArchiveIcon/>
  },
  {
    title: 'Block',
    description: 'Blocks them so you won’t get their replies',
    icon: <BlockIcon/>
  },

  { 
    title: 'Unsubscribe',
    description: 'Removes them from your email list',
    icon: <UnsubscribeIcon/>
  }
];

const ITEM_HEIGHT = 48;

export default function LongMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <div>
      <IconButton
        aria-label="More"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handleClick}
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
        {options.map(option => (
          <MenuItem key={option} 
            selected={option.title === 'Pyxis'} 
            onClick={handleClose}>

            <ListItemIcon>
              {option.icon}
            </ListItemIcon>

            <ListItemText 
              primary={option.title}
              secondary={option.description}
            />
            {/*
            <Typography variant="strong">{option.title}</Typography>
            <br/>
            <Typography variant="caption">{option.description}</Typography>
          */}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}