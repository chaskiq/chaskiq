import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Button from '@material-ui/core/Button';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import { amber, green } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import { makeStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import {isEmpty} from 'lodash'

import {clearStatusMessage} from '../actions/status_messages'

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

const useStyles1 = makeStyles(theme => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: theme.palette.primary.dark,
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
}));

function MySnackbarContentWrapper(props) {
  const classes = useStyles1();
  const { className, message, onClose, variant, ...other } = props;
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={clsx(classes[variant], className)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          <Icon className={clsx(classes.icon, classes.iconVariant)} />
          {message}
        </span>
      }
      action={[
        <IconButton key="close" aria-label="Close" color="inherit" onClick={onClose}>
          <CloseIcon className={classes.icon} />
        </IconButton>,
      ]}
      {...other}
    />
  );
}

MySnackbarContentWrapper.propTypes = {
  className: PropTypes.string,
  message: PropTypes.node,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['success', 'warning', 'error', 'info']).isRequired,
};

const useStyles2 = makeStyles(theme => ({
  margin: {
    margin: theme.spacing(1),
  },
}));

function CustomizedSnackbars(props) {
  const classes = useStyles2();
  const [open, setOpen] = React.useState( !isEmpty(props.status_message) );

  function handleClick() {
    setOpen(true);
  }

  function handleClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }

    props.dispatch(clearStatusMessage())

    setOpen(false);
  }

  React.useEffect(() => {
    setOpen( !isEmpty(props.status_message)  );
  }, [props])

  function getPlacement(){
    return props.status_message.placement || {
          vertical: 'bottom',
          horizontal: 'left',
        }
  }

  return (
    <div>
      
      {/*<Button variant="outlined" 
        className={classes.margin} 
        onClick={handleClick}>
        Open success snackbar
      </Button>*/}

      
        <Snackbar
          anchorOrigin={getPlacement()}
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
        >
          {
            !isEmpty(props.status_message) ?
            
            <MySnackbarContentWrapper
              onClose={handleClose}
              variant={props.status_message.variant}
              message={props.status_message.message}
            /> : null

          }
        </Snackbar>

      

      {
        /*

        <MySnackbarContentWrapper
          variant="error"
          className={classes.margin}
          message="This is an error message!"
        />
        <MySnackbarContentWrapper
          variant="warning"
          className={classes.margin}
          message="This is a warning message!"
        />
        <MySnackbarContentWrapper
          variant="info"
          className={classes.margin}
          message="This is an information message!"
        />
        <MySnackbarContentWrapper
          variant="success"
          className={classes.margin}
          message="This is a success message!"
        />

        */
      }

    </div>
  );
}


function mapStateToProps(state) {
  const { status_message } = state
  return {
    status_message
  }
}

export default withRouter(connect(mapStateToProps)(CustomizedSnackbars))
