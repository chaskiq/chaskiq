import React from 'react'
import styled from '@emotion/styled'

const Wrapper = styled.div`

  ${
    (props)=>{
      return props.relativePosition ?
      `position:relative;` :
      `position: absolute;
      z-index: 2000;
      height: calc(100vh - 132px);`
    }
  }
  
  width: 100%;
  background: black;

  display: flex;
  justify-content: center;
  justify-items: center;
  align-items: center;
  text-align: center;

  #status-information {
    color: #fff;
    position: absolute;
    width: 100%;
  }

  #localVideo{

    position: absolute;
    z-index: 220;
    top: 0px;
    /* display: none; */

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
      width:50px;
      height:50px;
      margin-right: 4px;

      border: 1px solid #ccc;
      background: white;
      display: flex;
      justify-content: center;
    }
  }

`

export const ModalWrapper = styled.div`
  position: absolute;
  ${
    (props)=>{
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
  }

`

export default function RtcViewWrapper ({ 
  videoSession,
  setVideoSession,
  toggleVideo,
  toggleAudio,
  rtcVideo,
  rtcAudio,
  relativePosition,
  expand,
  setExpand
}) {
  const [localFullScreen, setLocalFullScreen] = React.useState(false)
  const [remoteFullScreen, setRemoteFullScreen] = React.useState(false)

  return (
    <Wrapper
      relativePosition={relativePosition}
      style={{ visibility: `${!videoSession ? 'hidden' : ''}` }}
    >
      {}
      {/* <div id="callButton">call</div>
      <div id="info">info</div> */}
      {
        setExpand && <button className="expand-viewer" onClick={()=> setExpand(!expand) }>
        { !expand ? <FullScreenIcon/> : <FullScreenExitIcon/> }
        </button>
      }
      

      <div id="localVideo"></div>
      <div id="remoteVideo"></div>

      <div id="status-information">
        call in progress
      </div>

      <div className="call-buttons">
        <button 
          onClick={toggleVideo}
          style={{ color: `${rtcVideo ? 'green' : 'gray' }` }}>
          <CameraIcon/>
        </button>

        <button 
          onClick={toggleAudio}
          style={{ color: `${rtcAudio ? 'green' : 'gray' }` }}>
          <MicIcon/>
        </button>


        <button 
          onClick={setVideoSession}
          style={{ color: `${rtcAudio ? 'green' : 'gray' }` }}>
          {!videoSession ? <CallIcon/> : <CallEndIcon/>}
        </button>
      </div>

    </Wrapper>
  )
}

const BaseIcon = styled.svg`
  height: 30px;
  width: 30px;
`

export function CloseIcon (props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z">
      </path>
    </BaseIcon>
  )
}

export function MicIcon (props) {
  return (
    <BaseIcon {...props} fill="currentColor" 
      viewBox="0 0 24 24" aria-hidden="true" 
      tabindex="-1" title="Mic">
        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z">
        </path>
    </BaseIcon>
  )
}

export function MicOffIcon (props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 24 24" 
      aria-hidden="true" tabindex="-1" title="MicOff">
      <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z">
      </path>
    </BaseIcon>
  )
}

export function CameraIcon (props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 24 24" 
      aria-hidden="true" tabindex="-1" title="Videocam">
      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z">
      </path>
    </BaseIcon>
  )
}

export function CameraOffIcon (props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 24 24" 
      aria-hidden="true" tabindex="-1" title="Videocam">
      <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"></path>
    </BaseIcon>
  )
}

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

export function ScreenShareIcon (props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 24 24" 
      aria-hidden="true" tabindex="-1" title="ScreenShare">
      <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zm-7-3.53v-2.19c-2.78 0-4.61.85-6 2.72.56-2.67 2.11-5.33 6-5.87V7l4 3.73-4 3.74z">
      </path>
    </BaseIcon>
  )
}

export function ScreenShareExitIcon (props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 24 24" 
      aria-hidden="true" tabindex="-1" title="ScreenShare">
      <path d="M21.22 18.02l2 2H24v-2h-2.78zm.77-2l.01-10c0-1.11-.9-2-2-2H7.22l5.23 5.23c.18-.04.36-.07.55-.1V7.02l4 3.73-1.58 1.47 5.54 5.54c.61-.33 1.03-.99 1.03-1.74zM2.39 1.73L1.11 3l1.54 1.54c-.4.36-.65.89-.65 1.48v10c0 1.1.89 2 2 2H0v2h18.13l2.71 2.71 1.27-1.27L2.39 1.73zM7 15.02c.31-1.48.92-2.95 2.07-4.06l1.59 1.59c-1.54.38-2.7 1.18-3.66 2.47z">
      </path>
    </BaseIcon>
  )
}

export function CallIcon (props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 24 24" 
    aria-hidden="true" tabindex="-1" title="Call">
      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"></path>
    </BaseIcon>
  )
}

export function CallEndIcon (props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 24 24" 
    aria-hidden="true" tabindex="-1" title="CallEnd">
      <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z">
      </path>
    </BaseIcon>
  )
}