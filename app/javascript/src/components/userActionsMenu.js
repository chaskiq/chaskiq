import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Typography from '@material-ui/core/Typography';

const options = [
  {
    title: 'Archive',
    description: 'Archive this person and their conversation history'
  },
  {
    title: 'Block',
    description: 'Blocks them so you won’t get their replies'
  },

  { 
    title: 'Unsubscribe',
    description: 'Removes them from your email list'
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
            maxHeight: ITEM_HEIGHT * 4.5,
            width: 200,
          },
        }}
      >
        {options.map(option => (
          <MenuItem key={option} 
            selected={option.title === 'Pyxis'} 
            onClick={handleClose}>
            <Typography variant="strong">{option.title}</Typography>
            <Typography variant="span">{option.description}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}