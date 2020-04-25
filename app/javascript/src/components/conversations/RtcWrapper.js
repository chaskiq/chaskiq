import React from 'react'
import styled from '@emotion/styled'

import {

  MicIcon,

  CameraIcon,

  FullScreenIcon,
  FullScreenExitIcon
} from '../icons'

const LocalVideo = styled.div`
  position:relative;
  //width: 200px;

  ${
    (props) => {
      return `position: absolute;
      width: 125px;
      height: 91px;
      bottom: 139px;
      right: 2px;
      z-index: 30;`
    }
  }
  
  video {
    ${
      (props) => {
        if (!props.fullScreen) return ''
        return `
        position: fixed;
        left: 0;
        background: black;
        z-index: 10;
        height: 100vh;
        top:0px;
        `
      }
    }
    border: 1px solid blue;
    width: 100%;
    height: 100%
  }
  .call-buttons{
    ${(props) => {
        if (!props.fullScreen) {
          return `
          position: absolute;
          bottom: 6px;
          left: 8px;
        `
        }
        return `
        position: fixed;
        bottom: 14px;
        left: 0px;
        button{
          font-size: 3em;
 
        }
        `
      }
    }
    
    width: 100%;
    display: flex;
    justify-content: center;
    z-index: 20;
  }
`

const RemoteVideo = styled(LocalVideo)`
  ${
    (props) => {
      return `position: absolute;
      width: 317px;
      height: 238px;
      bottom: 5px;
      right: 6px;
      z-index: 10;
      video{
        border: 1px solid green;
      }`
    }
  }
`

export default function RtcDisplayWrapper ({
  videoSession,
  toggleVideo, toggleAudio,
  rtcVideo, rtcAudio 
}) {
  const [localFullScreen, setLocalFullScreen] = React.useState(false)
  const [remoteFullScreen, setRemoteFullScreen] = React.useState(false)

  return (
    <div 
      style={{ visibility: `${!videoSession ? 'hidden' : ''}` }}
    >
      <LocalVideo id="localVideo" fullScreen={localFullScreen}>
        <div className="call-buttons">
          <button
            className="mr-1 rounded-full bg-white
            hover:bg-gray-100 text-gray-800 font-semibold
            border border-gray-400 rounded shadow">
            <CameraIcon/>
          </button>

          <button
            className="mr-1 rounded-full bg-white
            hover:bg-gray-100 text-gray-800 font-semibold
            border border-gray-400 rounded shadow">
            <MicIcon/>
          </button>

          <button
            onClick={() => setLocalFullScreen(!localFullScreen)}
            className="mr-1 rounded-full bg-white
            hover:bg-gray-100 text-gray-800 font-semibold
            border border-gray-400 rounded shadow">
            { localFullScreen
              ? <FullScreenIcon/>
              : <FullScreenExitIcon/>
            }
          </button>

        </div>

      </LocalVideo>

      <div id="info" className="font-sm"></div>

      <RemoteVideo id="remoteVideo" fullScreen={remoteFullScreen}>
        <div className="call-buttons">
          <button
            className="mr-1 rounded-full bg-white
              hover:bg-gray-100 text-gray-800 font-semibold
              border border-gray-400 rounded shadow">
            <CameraIcon/>
          </button>

          <button
            className="mr-1 rounded-full bg-white
              hover:bg-gray-100 text-gray-800 font-semibold
              border border-gray-400 rounded shadow">
            <MicIcon/>
          </button>

          <button
            onClick={() => setRemoteFullScreen(!remoteFullScreen)}
            className="mr-1 rounded-full bg-white
              hover:bg-gray-100 text-gray-800 font-semibold
              border border-gray-400 rounded shadow">
            { remoteFullScreen
              ? <FullScreenIcon/>
              : <FullScreenExitIcon/>
            }
          </button>
        </div>
      </RemoteVideo>
    </div>
  )
}
