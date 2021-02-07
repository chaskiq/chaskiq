import React from 'react'
import styled from '@emotion/styled'

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
  //position: absolute;
  //bottom: 0;
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
    <React.Fragment>

      <CallStatus id="callStatus"/>

      <div
        className="flex"
        relativePosition={relativePosition}
        style={{ visibility: `${!videoSession ? 'hidden' : ''}` }}
      >

        {/* <div id="callButton">call</div>
        <div id="info">info</div> */}

        <div id="call-wrapper"
          className="flex"
          style={{ visibility: `${!videoSession ? 'hidden' : ''}` }}>

          <div className="flex justify-between w-full items-center lg:space-x-10 space-x-2">

            <CallButtons id="callButtons" className="space-x-4"/>

            <div id="localVideo"
              className="bg-black overflow-hidden lg:h-32 lg:w-32 h-20 w-20 rounded-full border-2 border-green-600"
            />

            <div id="remoteVideo"
              className="bg-black overflow-hidden
              h-32 w-32
              rounded-full border-2
              border-green-600"
            />

            <CallInitiator id="callInitiator" className="flex flex-col justify-center items-center space-y-5"/>

            <div id="status-information" className="hidden lg:block">
              <div id="info"></div>
            </div>

          </div>


          <div id="status-information" className="block lg:hidden">
              <div id="info"></div>
          </div>

          <div className="justify-end hidden">
            {
              setExpand &&
              <button className="expand-viewer" onClick={() => setExpand(!expand) }>
                { !expand ? <FullScreenIcon/> : <FullScreenExitIcon/> }
              </button>
            }
          </div>

        </div>
      </div>

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
