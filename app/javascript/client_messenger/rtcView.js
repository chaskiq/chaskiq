import React from 'react'
import styled from '@emotion/styled'

const Wrapper = styled.div`
  position: fixed;
  top: 0px;
  width:100%;
  height: 100%;
`

export default function RtcViewWrapper (){
  
  return (
    <Wrapper>
      <div id="callButton">call</div>
      <div id="info">info</div>
      <div id="localVideo">local</div>
      <div id="removeVideo"></div>
    </Wrapper>
  )
}