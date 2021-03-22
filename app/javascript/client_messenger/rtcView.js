import React from 'react'
import styled from '@emotion/styled'

const Wrapper = styled.div`

  ${
    (props) => {
      return props.relativePosition
      ? 'position:relative;'
      : `position: absolute;
      z-index: 2000;
      height: calc(100vh - 132px);`
    }
  }
  
  width: 100%;
  background: black;

  #call-wrapper {
    display: flex;
    justify-content: center;
    justify-items: center;
    align-items: center;
    text-align: center;
  
    #status-information {
      color: #fff;
      position: absolute;
      width: 100%;
      bottom: 50%;
    }
  
    #localVideo{
  
      position: absolute;
      z-index: 220;
      top: 15px;

      display: flex;
      justify-content: center;

      #local-video-wrapper{
        display: flex;
        flex-direction: column;
      }

      .control-btn{
        background: black;
        color: white;
      }

      video {
        background: black;
        height: 80px;
        width: 80px;
        border: 2px solid limegreen;
        margin: .3em;
        border-radius: 50%;
        overflow: hidden;
        -webkit-transform: translateZ(0);
        box-shadow: 0 19px 51px 0 rgba(0,0,0,0.16), 0 14px 19px 0 rgba(0,0,0,0.07);
      }
    }
  
    #remoteVideo{
      video{
        height: 78vh;
        width: 100%;
        object-fit: cover;
        background: black;
      }
    }
  
    .call-buttons{
      position: absolute;
      bottom: 0px;
      z-index: 2000;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      button {
        border-radius:50%;
        padding: .6em;
        margin-right: 4px;
  
        border: 1px solid #ccc;
        background: white;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

  }


`

export const ModalWrapper = styled.div`
  position: absolute;
  ${(props) => (!props.videoSession && 'visibility:hidden;')}
  ${
    (props) => {
      return props.expanded ? 'width:100%;' : 'width: 322px;'
    }
  }

  height: 100vh;
  display: flex;
  right: 0px;
  justify-content: center;
  background: black;
  z-index: 2000;
  top: 0;

  .expand-viewer{
    position: absolute;
    top: 10px;
    color: white;
    width: 20px;
    height: 20px;
    right: 11px;
    z-index:20;
  }

`

const CallStatus = styled.div`
  #call-status{
    position: absolute; 
    width: 100%; 
    height: 100vh; 
    border: 1px solid rgb(204, 204, 204); 
    bottom: 0; 
    left: -1px; 
    background: black; 
    z-index: 2000; 
    color: white; 
    display: flex; 
    flex-direction: column;
    justify-content: center; 
    align-items: center;
  }

  .call-buttons{
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    button {
      border-radius:50%;
      width:50px;
      height:50px;
      margin-right: 4px;

      border: 1px solid #ccc;
      background: white;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
`

const CallInitiator = styled.div`
  position: absolute;
  z-index: 20;
  bottom: 0px;
  #call-initiator{
    color: white; 
    display: flex; 
    flex-direction: column;
    justify-content: center; 
    align-items: center;
  }
  p{
    margin-bottom: 1em;
  }

  .call-buttons{
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    button {
      border-radius:50%;
      width:50px;
      height:50px;
      margin-right: 4px;

      border: 1px solid #ccc;
      background: white;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
`

const CallButtons = styled.div`
  position: absolute;
  bottom: 0;
`

export default function RtcViewWrapper ({
  videoSession,
  relativePosition,
  expand,
  setExpand
}) {
  //const [localFullScreen, setLocalFullScreen] = React.useState(false)
  //const [remoteFullScreen, setRemoteFullScreen] = React.useState(false)

  return (
    <React.Fragment>

      <CallStatus id="callStatus"/>
      <CallInitiator id="callInitiator"/>

      <Wrapper
        relativePosition={relativePosition}
        style={{ visibility: `${!videoSession ? 'hidden' : ''}` }}
      >

        {/* <div id="callButton">call</div>
        <div id="info">info</div> */}

        <div id="call-wrapper" style={{ visibility: `${!videoSession ? 'hidden' : ''}` }}>

          {
            setExpand && <button className="expand-viewer" onClick={() => setExpand(!expand) }>
              { !expand ? <FullScreenIcon/> : <FullScreenExitIcon/> }
            </button>
          }

          <div id="localVideo"></div>
          <div id="remoteVideo"></div>

          <div id="status-information">
            <div id="info"></div>
          </div>

          <CallButtons id="callButtons"/>

        </div>

      </Wrapper>
    </React.Fragment>
  )
}

const BaseIcon = styled.svg`
  height: 30px;
  width: 30px;
`

export function FullScreenIcon (props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 24 24"
      aria-hidden="true" tabindex="-1" title="Fullscreen">
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z">
      </path>
    </BaseIcon>
  )
}

export function FullScreenExitIcon (props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 24 24"
      aria-hidden="true" tabindex="-1" title="FullscreenExit">
      <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z">
      </path>
    </BaseIcon>
  )
}
