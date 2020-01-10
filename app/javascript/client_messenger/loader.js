import React from 'react'
import styled from '@emotion/styled'
import { jsx, css, keyframes } from '@emotion/core'


const rotate = keyframes`
  from {
    transform: rotate(-45deg);
    //transform: scale(0.5);
    translateY(-30);
  }

  to {
    transform: rotate(0deg);
    //transform: scale(1);
    transform: translateY(-8px);
  }
`;

const SpinnerAnim = keyframes`
  to {transform: rotate(360deg);}
`

const Spinner = styled.div`
  //transition: all .1s ease-out;
  //animation: ${rotate} 0.3s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
  animation: ${SpinnerAnim} .6s linear infinite;

  ${(props)=> {return props.sm ? `width: 40px; height: 40px;` : ''} }

  ${(props)=> {return props.xs ? `width: 20px; height: 20px;` : ''} }

  ${(props)=> {return props.md ? `width: 60px; height: 60px;` : ''} }
  
  border: 4px solid ${(props)=> props.theme.palette.secondary};
  border-top: 4px solid white;
  border-radius: 50%;
`

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 1.2em;
`



export default function Loader(props){
  return (
    <SpinnerWrapper style={props.wrapperStyle}>
      <Spinner {...props}></Spinner>
    </SpinnerWrapper>
  )
}