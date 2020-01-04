import React from 'react'

import {
  ImageZoomOverlay
} from './conversation/styles'

import {
  setImageZoom
} from '../actions/imageZoom'

import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Close';
import { connect } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  button: {
    position: 'absolute',
    right: '20px',
    top: '20px'
  },

  image: {
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      height: 'auto'
    },
    [theme.breakpoints.up('md')]: {
      width: '80%',
      height: 'auto'
    },
    [theme.breakpoints.up('lg')]: {
      width: '50%',
      height: 'auto'
    },

  }
}));

function ZoomImage({dispatch, imageZoom}) {

  const classes = useStyles();

  return <div>
          { imageZoom && imageZoom.url && 
            <ImageZoomOverlay>
                <img 
                  width={imageZoom.width} 
                  height={imageZoom.height}
                  className={classes.image} 
                  src={imageZoom.url}
              />
              <IconButton className={classes.button}
                variant={"outlined"} 
                onClick={()=> dispatch(setImageZoom(null))}>
                <DeleteIcon/>
              </IconButton>
            </ImageZoomOverlay>
          }
        </div>
}


function mapStateToProps(state) {

  const {imageZoom} = state

  return {
    imageZoom
  }
}

//export default ShowAppContainer

export default connect(mapStateToProps)(ZoomImage)