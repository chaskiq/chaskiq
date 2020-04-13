import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const styles = {
  card: {
    maxWidth: 345,
  },
  media: {
    height: 140,
  },
};

function AppCard(props) {
  const { classes } = props;
  return (
    <Card className={classes.card}>
      <CardActionArea>
        
        <CardContent onClick={props.onClick}>
          <Typography gutterBottom variant="h5" component="h2">
            {props.app.name} {props.app.state}
          </Typography>
          <Typography component="p">
            {props.app.tagline}
          </Typography>
        </CardContent>
      </CardActionArea>

      <CardActions>
        <Button size="small" color="primary" onClick={props.onClick}>
          View app
        </Button>
        <Button size="small" color="primary" 
          onClick={()=> window.open(`/tester/${props.app.key}`)}>
          Open test app
        </Button>
      </CardActions>
    </Card>
  );
}

AppCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AppCard);