import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Button from '@material-ui/core/Button';

import { withRouter } from 'react-router-dom'


const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));

function ContextMenu(props) {
  const {label} = props
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedIndex, setSelectedIndex] = React.useState({} );

  function handleClickListItem(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleMenuItemClick(event, index) {
    setSelectedIndex(index);
    setAnchorEl(null);
    props.handleClick(index)
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <div className={classes.root}>
      {/*<List component="nav">
        <ListItem
          button
          aria-haspopup="true"
          aria-controls="lock-menu"
          aria-label={label}
          onClick={handleClickListItem}
        >
          <ListItemText 
            primary={label} 
            //secondary={fetchApp()}
          />
        </ListItem>
        </List>*/}

      <Button 
        variant={"outlined"} 
        onClick={handleClickListItem}>
        {label}
      </Button>

      <Menu id="lock-menu" anchorEl={anchorEl} 
        open={Boolean(anchorEl)} 
        onClose={handleClose}>

        {props.options.map((option, index) => (
          <MenuItem
            key={option.key}
            //disabled={index === 0}
            selected={selectedIndex.key === option.key}
            onClick={event => handleMenuItemClick(event, option)}
          >
            {option.name}
          </MenuItem>
        ))}
      </Menu>
      
    </div>
  );
}

export default withRouter(ContextMenu)


//export default SimpleListMenu;