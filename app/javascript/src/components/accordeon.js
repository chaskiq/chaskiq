import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

const ExpansionPanel = withStyles({
  root: {
    /*border: '1px solid rgba(0, 0, 0, .125)',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },*/
  },
  expanded: {},
})(MuiExpansionPanel);

const ExpansionPanelSummary = withStyles({
  root: {
    //backgroundColor: 'rgba(0, 0, 0, .03)',
    //borderBottom: '1px solid rgba(0, 0, 0, .125)',
    //marginBottom: -1,
    //minHeight: 56,
    //'&$expanded': {
    //  minHeight: 56,
    //},
  },
  content: {
    '&$expanded': {
      //margin: '12px 0',
    },
  },
  expanded: {},
})(MuiExpansionPanelSummary);

const ExpansionPanelDetails = withStyles(theme => ({
  root: {
    display: 'inherit',
    padding: theme.spacing(1),
  },
}))(MuiExpansionPanelDetails);

function CustomizedExpansionPanels(props) {
  const [expanded, setExpanded] = React.useState(props.items[0].name);

  const handleChange = panel => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const withValues = (col)=> {
    return col.filter( (o)=> o.value )
  }

  return (
    <div>

      {
        props.items.map((o, i)=>(
          <ExpansionPanel 
            key={`expansion-panel-${i}`}
            square 
            expanded={expanded === o.name} 
            onChange={handleChange(o.name)}>

            <ExpansionPanelSummary 
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`${o.name}-content`}
              expandIcon={<ExpandMoreIcon />}
              id="panel1d-header">

              <Typography>
                {o.name}
              </Typography>
            </ExpansionPanelSummary>

            <ExpansionPanelDetails>

              {
                o.items ?
                  <List>
                  {
                    withValues(o.items).map((item, index)=>(
                         <React.Fragment key={`expansion-detail-item-${index}`}>
                            <ListItem>
                              <ListItemText
                                primary={item.label}
                                secondary={
                                  <Typography noWrap>
                                    {item.value}
                                  </Typography>
                                }
                              />

                            </ListItem>
                            <Divider/>
                         </React.Fragment>
                      )) 
                  }
                  </List> : null 
              }
              
              { o.component ? o.component : null }

              {
                /*<Typography>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
                    sit amet blandit leo lobortis eget. Lorem ipsum dolor sit amet, consectetur adipiscing
                    elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
                  </Typography>
                */
              }
              
            </ExpansionPanelDetails>
          </ExpansionPanel>
        ))
      }

    </div>
  );
}

export default CustomizedExpansionPanels;