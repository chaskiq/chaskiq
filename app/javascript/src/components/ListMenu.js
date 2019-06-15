import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'


const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
}));


const optionsDs = [
  'Show some love to Material-UI',
  'Show all notification content',
  'Hide sensitive notification content',
  'Hide all notification content',
];

function SimpleListMenu(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedIndex, setSelectedIndex] = React.useState(props.app || {} );

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

  function fetchApp(){
    return `${props.app.name} ${props.app.key}`
  }

  return (
    <div className={classes.root}>
      <List component="nav">
        <ListItem
          button
          aria-haspopup="true"
          aria-controls="lock-menu"
          aria-label="Switch application"
          onClick={handleClickListItem}
        >
          <ListItemText primary="Switch application" secondary={fetchApp}/>
        </ListItem>
      </List>

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

function mapStateToProps(state) {
  const { app } = state
  return {
    app
  }
}

export default withRouter(connect(mapStateToProps)(SimpleListMenu))


//export default SimpleListMenu;