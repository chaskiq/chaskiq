import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

function a11yProps(index) {
  return {
    id: `scrollable-force-tab-${index}`,
    'aria-controls': `scrollable-force-tabpanel-${index}`,
  };
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    borderBottom: '1px solid #ddd'
    //backgroundColor: theme.palette.background.paper,
  },
  appBar: {
    backgroundColor: 'transparent'
  },
  tabs:{
    color: 'black',
  },
  indicator: {
    backgroundColor: theme.palette.primary.main
  }

}));

export default function ScrollableTabsButtonForce({tabs, changeHandler}) {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  function handleChange(event, newValue) {
    setValue(newValue);
    changeHandler(newValue)
  }

  return (
    <div className={classes.root}>
      
      <AppBar position="static" className={classes.appBar} elevation={0}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="on"
          indicatorColor="primary"
          textColor="primary"
          //aria-label="scrollable force tabs example"
          className={classes.tabs}
          classes={{indicator: classes.indicator }}
        >
          {
            tabs.map((o)=> <Tab 
                            key={o.value} 
                            label={o.label}
                            />)
          }
        </Tabs>
      </AppBar>
      
    </div>
  );
}