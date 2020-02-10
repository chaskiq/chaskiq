import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Divider from '@material-ui/core/Divider';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'


const useStyles = makeStyles(theme => ({
  root: {
    //width: '100%',
    //maxWidth: 360,
    //backgroundColor: theme.palette.background.paper,
  },
}));


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
    index.onClick ? index.onClick(index) : props.handleClick(index)
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function mergeButton(){
    return React.cloneElement(
      props.button,
      {onClick: handleClickListItem}
    )
  }

  return (
    <React.Fragment>

      {
        props.button ? mergeButton() : 
      
        <List component="nav">
          <ListItem
            button
            aria-haspopup="true"
            aria-controls="lock-menu"
            aria-label="Switch application"
            onClick={handleClickListItem}
          >
            <ListItemText 
              primary="Switch application" 
            />
            {Boolean(anchorEl) ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
        </List>
      }

      <Menu id="lock-menu" anchorEl={anchorEl} 
        open={Boolean(anchorEl)} 
        onClose={handleClose}
        /*anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}*/
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}>

        {props.options.map((option, index) => (
          option.type === "divider" ? 
          <Divider key={`list-menu-${index}-${option.type}`}/> :
          <MenuItem
            key={`list-menu-${index}-${option.type}`}
            //disabled={index === 0}
            selected={selectedIndex.key === option.key}
            onClick={event => handleMenuItemClick(event, option)}
          >
            {option.name}
          </MenuItem>
        ))}
      </Menu>
      
    </React.Fragment>
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