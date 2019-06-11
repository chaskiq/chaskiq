import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SearchIcon from '@material-ui/icons/Search';
import ListItemIcon from '@material-ui/core/ListItemIcon'
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';

import gravatar from "gravatar"


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
}));

export default function LongMenu(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [options, setOption] = React.useState(props.options);
  const triggerButton = props.triggerButton
  const selectedOption = props.selectedOption
  const open = Boolean(anchorEl);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function selectOption(option) {
    props.filterHandler(option, handleClose )
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <div>

      {triggerButton ? triggerButton(handleClick) : null}

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


        {options.map(option => (
          <MenuItem 
            key={option.id} 
            selected={props.value === option.name} 
            onClick={()=> selectOption(option)}>
            

            { option.icon ?
              <ListItemIcon>
                {option.icon}
              </ListItemIcon> : null 
            }

            <Typography variant="inherit">
              {option.name}
            </Typography>
            
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}