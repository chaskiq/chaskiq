import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography'
import ListItemText from '@material-ui/core/ListItemText' 
import ListItemIcon from '@material-ui/core/ListItemIcon'

import MoreVertIcon from '@material-ui/icons/MoreVert';

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

    option.onClick ? option.onClick() : props.handleClick(option)

    setAnchorEl(null);
  }

  return (
    <div>

      { props.toggleButton(handleClick) }

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
        {props.options.map((option) => (
          <MenuItem 
            key={option.id} 
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