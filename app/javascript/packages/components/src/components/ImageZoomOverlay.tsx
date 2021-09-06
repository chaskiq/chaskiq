import React from 'react';

import Button from './Button';
import { CloseIcon } from './icons';
import { connect } from 'react-redux';

import styled from '@emotion/styled';
import { setImageZoom } from '@chaskiq/store/src/actions/imageZoom';

export const ImageZoomOverlay = styled.div`
  overflow: auto;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  padding: 80px 40px;
  background-color: rgba(255, 255, 255, 0.97);
  text-align: center;
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
  button {
    position: absolute;
    right: 20px;
    top: 20px;
  }
`;

function ZoomImage({ dispatch, imageZoom }) {
  return (
    <div>
      {imageZoom && imageZoom.url && (
        <ImageZoomOverlay>
          <div>
            <img
              width={imageZoom.width}
              height={imageZoom.height}
              // className={classes.image}
              src={imageZoom.url}
            />
          </div>

          <Button variant={'icon'} onClick={() => dispatch(setImageZoom(null))}>
            <CloseIcon />
          </Button>
        </ImageZoomOverlay>
      )}
    </div>
  );
}

function mapStateToProps(state) {
  const { imageZoom } = state;
  return {
    imageZoom,
  };
}

export default connect(mapStateToProps)(ZoomImage);
