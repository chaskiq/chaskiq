/* eslint-disable no-script-url */

import React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';

const useStyles = makeStyles({
  depositContext: {
    flex: 1,
  },
  title: {
    fontSize: '1.2em'
  }
});

export default function Count({data, label, appendLabel, subtitle}) {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Typography className={classes.title} component="h2" variant="h6" color="primary" gutterBottom>
        {label}
      </Typography>
      <Typography component="p" variant="h4">
        {data || 0} {appendLabel}
      </Typography>
      <Typography 
        color="textSecondary"
        variant={"caption"}
        className={classes.depositContext}>
        {subtitle || moment().format('LL')}
      </Typography>
      {/*<div>
        <Link color="primary" href="javascript:;">
          View Data
        </Link>
      </div>*/}
    </React.Fragment>
  );
}
