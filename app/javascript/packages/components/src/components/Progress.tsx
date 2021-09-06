import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';
// based on https://codepen.io/Siddharth11/pen/xbGrpG

const spin = keyframes`
  100% { 
    transform: rotate(360deg); 
  } 
`;

const Loader = styled.div`
  animation: ${spin} 0.5s infinite linear;
  border-top-color: white;
`;

interface ICircularIndeterminate {
  size?: number;
}
export default function CircularIndeterminate({
  size,
}: ICircularIndeterminate) {
  const sizeVariant = size || 16;
  // h-16 w-16
  return (
    <div className="flex justify-center items-center">
      <Loader
        className={`loader ease-linear rounded-full
          border-4 border-t-4 border-pink-600 h-${sizeVariant} w-${sizeVariant}`}
      />
    </div>
  );
}
