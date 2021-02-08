import React from 'react'
import Button from './Button'

import { connect } from 'react-redux'
import Peer from 'simple-peer'

import { createPortal } from 'react-dom'
import usePortal from './hooks/usePortal'
import {isEmpty} from 'lodash'
import styled from '@emotion/styled'

// Broadcast Types
const JOIN_ROOM = 'JOIN_ROOM'
const EXCHANGE = 'EXCHANGE'
const REMOVE_USER = 'REMOVE_USER'
const START_CALL = 'START_CALL'
const END_CALL = 'END_CALL'
const SIGNAL = 'SIGNAL'
const INIT = 'INIT'
const READY = 'READY'
const CLOSE_SESSION = 'CLOSE_SESSION'
const REJECT_CALL = 'REJECT_CALL'
// Ice Credentials

function getDisplayStream(){
  return navigator.mediaDevices.getDisplayMedia();
}

class VideoCall {
  peer = null 
  init = (stream, initiator) => {
      
      this.peer = new Peer({
          initiator: initiator,
          stream: stream,
          trickle: false,
          reconnectTimer: 1000,
          iceTransportPolicy: 'relay',
          config: {
              iceServers: [
                  { urls: ['stun:stun4.l.google.com:19302'] },
                  /*{
                      urls: process.env.REACT_APP_TURN_SERVERS.split(','),
                      username: process.env.REACT_APP_TURN_USERNAME,
                      credential: process.env.REACT_APP_TURN_CREDENCIAL
                  },*/
              ]
          }
      })
      //console.log("inicializó peer", this.peer)
      return this.peer
  }
  connect = (otherId) => {
    //console.log("CONNECTING PEER", this.peer)
    this.peer.signal(otherId)
  }  
}

let gstream = null

export function RtcView (props) {
  const currentUser = props.current_user.email
  const localVideo = React.useRef(null)
  const remoteVideoContainer = React.useRef(null)

  const documentObject = props.document || document

  const target = usePortal(props.buttonElement, documentObject)
  const infoTarget = usePortal(props.infoElement, documentObject)
  const localVideoTarget = usePortal(props.localVideoElement, documentObject)
  const remoteVideoTarget = usePortal(props.remoteVideoElement, documentObject)
  const callStatusTarget = usePortal(props.callStatusElement, documentObject)
  const callInitiatorTarget = usePortal(props.callInitiatorElement, documentObject)
  const callButtonsTarget = usePortal(props.callButtonsElement, documentObject)
  
  const [localStream, setLocalStream] = React.useState({})
  const [remoteStreamUrl, setRemoteStreamUrl] = React.useState('')
  const [streamUrl, setStreamUrl] = React.useState('')
  const [initiator, setInitiator] = React.useState(false)
  const [peer, setPeer] = React.useState({})
  const [full, setFull] = React.useState(false)
  const [connecting, setConnecting] = React.useState(false)
  const [waiting, setWaiting] = React.useState(true)
  const [callStarted, setCallStarted] = React.useState(false)

  const videoCall = new VideoCall();

  React.useEffect(() => {
    // returned function will be called on component unmount 
    return () => {
      //console.log("unmount!", localStream)
      removePeers()
    }
  }, [])

  React.useEffect(() => {
    if(!props.video) return
    startCall()
  }, [props.video])


  React.useEffect(()=>{
    //console.log("LOCAL STREAM CHANGED?", localStream )
    gstream = localStream
  }, [localStream.id])

  React.useEffect(() => {
    //console.log("RTC CHANGED!", props.rtc)
    handleRtcData()
  }, [props.rtc])

  React.useEffect(() => {
    setAudioLocal()
    setVideoLocal()
  }, [props.rtcVideo, props.rtcAudio])

  function startCall (){
    getUserMedia().then(() => {
      broadcastJoinSession()
    });
  }

  function broadcastData (data) {
    const a = {
      type: 'rtc_events',
      app: props.appKey,
      conversation_id: props.conversation.key
    }

    const params = Object.assign({}, data, a)
    //console.log('BROADCAST', params)
    props.events.perform('rtc_events', params)
  }

  function broadcastJoinSession () {
    broadcastData({
      event_type: JOIN_ROOM,
      from: currentUser
    })
  }

  function stopUserMedia () {
    removePeers()
  }

  function getUserMedia(cb) {
    return new Promise((resolve, reject) => {
      /*const op = {
        video: {
          enabled: props.rtcVideo,
          width: { min: 160, ideal: 640, max: 1280 },
          height: { min: 120, ideal: 360, max: 720 }
        },
        audio: {
          enabled: props.rtcAudio,
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
          sampleRate: 44000,
          channelCount: {
            ideal: 1
          },
          volume: 0.9
        },
      };*/

      const op = {
        audio: true,
        video: true
      }
      
      navigator.mediaDevices.getUserMedia(op).then(gotMedia).catch((err) => {
        console.log("error on RTC", err)
      })

      function gotMedia(stream){
        setLocalStream(stream)
          setStreamUrl(stream)
          localVideo.current.srcObject = stream;
          localVideo.current.muted = true
          localVideo.current.setAttribute('muted', 'muted')
          localVideo.current.volume = 0;
          resolve();
      }
    });
  }

  function setAudioLocal(){
    if(localStream.getAudioTracks && 
      localStream.getAudioTracks().length > 0){
      localStream.getAudioTracks().forEach(track => {
        track.enabled = props.rtcAudio //!track.enabled;
      });
    }
  }

  function setVideoLocal(){
    if(localStream.getVideoTracks && 
      localStream.getVideoTracks().length>0){
      localStream.getVideoTracks().forEach(track => {
        track.enabled = props.rtcVideo;
      });
    }
  }

  function getDisplay() {
    getDisplayStream().then(stream => {
      stream.oninactive = () => {
        peer.removeStream(localStream);
        getUserMedia().then(() => {
          peer.addStream(localStream);
        });
      };
      
      setStreamUrl(stream)
      setLocalStream(stream)
      localVideo.current.srcObject = stream;
      peer.addStream(stream);
    });
  }

  function requestCall(){
    broadcastData({
      event_type: START_CALL,
      from: currentUser
    })
    setWaiting(true)
    setCallStarted(true)
  }

  function handleRtcData() {


    /*socket.on('full', () => {
      component.setState({ full: true });
    });*/

    const data = props.rtc

    if (data.from === currentUser) return
    if (data.event_type === START_CALL) setCallStarted(true)
    if (!props.video ) return

    switch (data.event_type) {
      case JOIN_ROOM:
        //console.log('join room!', data)
        return enter(data)
      case SIGNAL:
        const signal = data.signal
        if (signal.type === 'offer' && initiator) return;
        if (signal.type === 'answer' && !initiator) return;
        return call(signal)
      case INIT:
        //console.log("INIT!!!!")
        return setInitiator(true);   
      case READY:
        //console.log("READY!!!")
        return enter()
      case START_CALL:
        return setCallStarted(true)
      case REJECT_CALL:
        return setCallStarted(false)
      case CLOSE_SESSION:
        setCallStarted(false)
        closePeers()
        if(props.video) props.toggleVideoSession()
        break

      default: null //console.log('default receive DATA', data)
    }
  }

  function call (data) {
    peer && peer.signal && peer.signal(data.desc);
  };

  function enter (params) {
    setConnecting(true)

    const peer = videoCall.init(
      localStream,
      initiator
    );

    setPeer( peer );

    peer.on('signal', data => {
      const signal = {
        room: props.conversation.key,
        desc: data
      };
      broadcastData({
        event_type: 'SIGNAL',
        from: currentUser,
        signal: signal
      })
    });

    peer.on('stream', stream => {
      const id = `remoteVideoContainer`
      let element = documentObject.getElementById(id)
      if (!element) {
        element = documentObject.createElement('video')
        element.id = id
        remoteVideoContainer.current.appendChild(element)
      }

      element.autoplay = 'autoplay'
      element.srcObject = stream
      //element.muted = true
      //element.setAttribute('muted', 'muted')
      element.volume = 0.9;

      setConnecting(false)
      setWaiting(false)
    });

    peer.on('error', function(err) {
      console.log(err);
    });
  };

  function removePeers () {
    broadcastData({
      event_type: CLOSE_SESSION,
      from: currentUser
    })

    closePeers ()
  }

  function closePeers () {
    //if(props.video) props.toggleVideoSession()
    peer && peer.destroy && peer.destroy() // && peer.removeAllListeners()
    props.onCloseSession && props.onCloseSession()

    gstream.id && gstream.getTracks().forEach(track => track.stop());
    localStream.id && localStream.getTracks().forEach(track => track.stop());
  }

  function rejectCall () {
    broadcastData({
      event_type: REJECT_CALL,
      from: currentUser
    })
    closePeers()
  }

  return <React.Fragment>

    {
      localVideoTarget && createPortal(
        <div id="local-video-wrapper">
          <video id="local-video"
            muted="muted"
            autoPlay
            ref={ localVideo }>
          </video>
          {callStarted && <button
            className='control-btn'
            onClick={() => { getDisplay(); }}
          >
          share screen
          </button>}
        </div>, localVideoTarget
      )
    }

    {
      remoteVideoTarget && createPortal(
        <div id="remote-video-container"
          ref={ remoteVideoContainer }>
        </div>, remoteVideoTarget)
    }

    {
      infoTarget && createPortal(
        <React.Fragment>
          
          {/*callStarted && 'call started'*/}

          {connecting && (

            <div className="status inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-400">
              <p>Establishing connection...</p>
            </div>
          )}

          {waiting && callStarted && (
            <div className="status inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-400">
              <p>Waiting for someone...</p>
            </div>
          )}

        </React.Fragment>, infoTarget)
    }

    {
      initiator && !callStarted &&
      callInitiatorTarget && createPortal( 
        <div id="call-initiator" className="flex flex-col justify-center items-center space-y-6">
          <p className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-pink-100 text-blue-800 border border-pink-900-">
            Start a call
          </p>
          <div className="call-buttons">
            <button
              style={{ color: 'white', backgroundColor: 'green', border: 'none' }}
              onClick={requestCall}>
              <CallIcon style={{ height: '30px', width: '30px' }}/>
            </button>
            <button
              onClick={() => {
                props.toggleVideoSession()
                closePeers()
              } }
              style={{ color: 'white', backgroundColor: 'red', border: 'none' }}>
              <CallEndIcon style={{ height: '30px', width: '30px' }}/>
            </button>
          </div>
        </div>
      , 
        callInitiatorTarget)
    }

    {/*{
      props.buttonElement && createPortal(
        <Button
          className={`btn btn-outline${props.video ? '-success active' : '-secondary'}`}
          onClick={() => {
            // if(props.video) localStream.stop()
            props.toggleVideoSession()
          }
          }>
          <i className="fa fa-video"></i>
        </Button>
        , target)
    }
    */}

    {/* check the event start call instead event_type */ }
    { 
      props.callStatusElement && !props.video &&
      !initiator && callStarted &&
      createPortal(
        <div id="call-status">
          <p>Hey! an agent is calling you</p>
          <div className="call-buttons">
            <button
              style={{ color: 'white', backgroundColor: 'green', border: 'none' }}
              onClick={() => props.toggleVideoSession() } >
              <CallIcon style={{ height: '30px', width: '30px' }}/>
            </button>
            <button
              onClick={() => rejectCall() }
              style={{ color: 'white', backgroundColor: 'red', border: 'none' }}>
              <CallEndIcon style={{ height: '30px', width: '30px' }}/>
            </button>
          </div>
        </div>
        , callStatusTarget)
     }


     {
       props.callButtonsElement && 
       props.video && 
       callStarted &&
       createPortal(
          <div className="call-buttons flex flex-col space-y-1">

            <Button
              variant="outlined"
              className="rounded-full"
              onClick={()=> props.toggleVideo()}
              style={{ color: `${props.rtcVideo ? 'green' : 'gray' }` }}>
              <CameraIcon/>
            </Button>

            <Button
              variant="outlined"
              onClick={()=> props.toggleAudio()}
              style={{ color: `${props.rtcAudio ? 'green' : 'gray' }` }}>
              <MicIcon/>
            </Button>

            <Button
              variant="outlined"
              onClick={()=>{ 
                stopUserMedia()
                setCallStarted(false)
                closePeers()
                props.toggleVideoSession()
              }
              }
              style={{
                color: 'white',
                background: 'red',
                border: 0
              }}>
              {!props.video ? <CallIcon/> : <CallEndIcon/>}
            </Button>

          </div>
        , callButtonsTarget)
     }

  </React.Fragment>
}



export function RtcWrapper (props) {
  return props.current_user ? <RtcView {...props}/> : <p>k</p>
}

function mapStateToProps (state) {
  const { app, conversation, current_user, rtc } = state
  const appKey = app.key
  return {
    conversation,
    current_user,
    appKey,
    rtc
  }
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
      aria-hidden="true" tabIndex="-1" title="Call">
      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"></path>
    </BaseIcon>
  )
}

export function CallEndIcon (props) {
  return (
    <BaseIcon {...props} fill="currentColor" viewBox="0 0 24 24"
      aria-hidden="true" tabIndex="-1" title="CallEnd">
      <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z">
      </path>
    </BaseIcon>
  )
}



export default connect(mapStateToProps)(RtcWrapper)
