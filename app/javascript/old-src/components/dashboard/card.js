import React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Title from './title';

const useStyles = makeStyles({
  depositContext: {
    flex: 1,
  },
});

export default function Card({children, title, subtitle, context}) {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Title>{title}</Title>
      { subtitle && <Typography component="p" variant="h4">
          {subtitle}
        </Typography> 
      }

      { context &&
        <Typography color="textSecondary"
          variant={"caption"}
          className={classes.depositContext}>
          {context}
        </Typography>
      }

      <div>
        {children && children}
      </div>
    </React.Fragment>
  );
}