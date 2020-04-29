import React from 'react'
import Button from './Button'

import { connect } from 'react-redux'
import Peer from 'simple-peer'

import { createPortal } from 'react-dom'
import usePortal from './hooks/usePortal'
import {isEmpty} from 'lodash'

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
// Ice Credentials

let sendChannel = null
let receiveChannel = null
var localStream = null
let negotiating = false;


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
      console.log("inicializó peer", this.peer)
      return this.peer
  }
  connect = (otherId) => {
    console.log("CONNECTING PEER", this.peer)
    this.peer.signal(otherId)
  }  
} 



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

  const [localStream, setLocalStream] = React.useState({})
  const [remoteStreamUrl, setRemoteStreamUrl] = React.useState('')
  const [streamUrl, setStreamUrl] = React.useState('')
  const [initiator, setInitiator] = React.useState(false)
  const [peer, setPeer] = React.useState({})
  const [full, setFull] = React.useState(false)
  const [connecting, setConnecting] = React.useState(false)
  const [waiting, setWaiting] = React.useState(true)
  const [micState, setMicState] =React.useState(true)
  const [camState, setCamState] =React.useState(true)

  const videoCall = new VideoCall();

  React.useEffect(() => {
    //props.video ? initVideoSession() : null
    // setTimeout(()=>
    //  handleJoinSession(), Math.random()
    // )

    //return handleLeaveSession()
  }, [])

  React.useEffect(() => {
    //props.video && initVideoSession()
    //!props.video && handleLeaveSession()
    if(!props.video) return 
    getUserMedia().then(() => {
      //socket.emit('join', { roomId: roomId });
      handleJoinSession()
    });

  }, [props.video])


  React.useEffect(()=>{
    console.log("LOCAL STREAM CHANGED?", localStream )
    //if(localStream && localStream.id) {
    //  enter()
    //}
  }, [localStream.id])

  React.useEffect(() => {
    console.log("RTC CHANGED!", props.rtc)
    handleRtcData()
  }, [props.rtc])

  React.useEffect(() => {
    setAudioLocal()
    setVideoLocal()
  }, [props.rtcVideo, props.rtcAudio])


  function broadcastData (data) {
    const a = {
      type: 'rtc_events',
      app: props.appKey,
      conversation_id: props.conversation.key
    }

    const params = Object.assign({}, data, a)
    console.log('BROADCAST', params)
    props.events.perform('rtc_events', params)
  }

  function handleJoinSession () {
    broadcastData({
      event_type: JOIN_ROOM,
      from: currentUser
    })
  }

  function getUserMedia(cb) {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia = navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;
      const op = {
        video: {
          enabled: props.rtcVideo,
          width: { min: 160, ideal: 640, max: 1280 },
          height: { min: 120, ideal: 360, max: 720 }
        },
        audio: {
          enabled: false, //props.rtcAudio,
          sampleSize: 16,
          channelCount: 2,
          echoCancellation: true,
          noiseSuppression: false
        },
      };
      navigator.getUserMedia(
        op,
        stream => {
          setLocalStream(stream)
          setStreamUrl(stream)
          localVideo.current.srcObject = stream;
          resolve();
        },
        () => {  }
      );
    });
  }

  function setAudioLocal(){
    if(localStream.getAudioTracks && 
      localStream.getAudioTracks().length > 0){
      localStream.getAudioTracks().forEach(track => {
        track.enabled = props.rtcAudio //!track.enabled;
      });
    }
    //setMicState(!micState)
  }

  function setVideoLocal(){
    if(localStream.getVideoTracks && 
      localStream.getVideoTracks().length>0){
      localStream.getVideoTracks().forEach(track => {
        track.enabled = props.rtcVideo;
      });
    }
    //setCamState(!camState)
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

  function handleRtcData() {

    /*socket.on('disconnected', () => {
      component.setState({ initiator: true });
    });
    socket.on('full', () => {
      component.setState({ full: true });
    });*/

    const data = props.rtc

    if (data.from === currentUser) return
    if (!props.video) return

    switch (data.event_type) {
      case JOIN_ROOM:
        console.log('join room!', data)
        return enter(data)
      case SIGNAL:
        const signal = data.signal
        if (signal.type === 'offer' && initiator) return;
        if (signal.type === 'answer' && !initiator) return;
        return call(signal)
      case INIT:
        console.log("INIT!!!!")
        return setInitiator(true);   
      case READY:
        console.log("READY!!!")
        return enter()
      case CLOSE_SESSION:
        //localStream && localStream.getTracks().forEach(track => track.stop());
        //peer.removeAllListeners();
        //peer.destroy();
        break

      default: console.log('default receive DATA', data)
    }
  }

  function call (data) {
    peer.signal(data.desc);
  };

  function enter (params) {
    setConnecting({connecting: true} )

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

  }

  function closePeers () {
    if(props.video) props.toggleVideoSession()
    peer && peer.destroy && peer.destroy() // && peer.removeAllListeners()
    props.onCloseSession && props.onCloseSession()
  }

  function rejectCall () {
    broadcastData({
      event_type: 'REJECT_CALL',
      from: currentUser
    })
    closePeers()
  }


  /*
    function toggleTrack (track) {
      switch (track.kind) {
        case 'audio':
          track.enabled = props.rtcAudio
          break
        case 'video':
          track.enabled = props.rtcVideo
        default:
          break
      }
    }

    function initVideoSession () {
      navigator
        .mediaDevices
        .getUserMedia({
          audio: {
            enabled: props.rtcAudio,
            sampleSize: 16,
            channelCount: 2,
            echoCancellation: true,
            noiseSuppression: false
          },
          video: props.rtcVideo
        })
        .then(stream => {
          localStream = stream
          // window.localS = stream
          localVideo.current.srcObject = stream
          localVideo.current.muted = true
          setTimeout(() => handleJoinSession(), Math.random())
        })
        .catch(logError)
    }
  */
 

  return <React.Fragment>


    {
      localVideoTarget && createPortal(
        <React.Fragment>
        <video id="local-video"
          ref={ localVideo }
          autoPlay>
        </video>
        <button
          className='control-btn'
          onClick={() => { getDisplay(); }}
        >
         share
        </button>
        </React.Fragment>, localVideoTarget
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
          {connecting && (
            <div className='status'>
              <p>Establishing connection...</p>
            </div>
          )}
          {waiting && (
            <div className='status'>
              <p>Waiting for someone...</p>
            </div>
          )}
        </React.Fragment>, infoTarget)
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

    { 
      props.callStatusElement && !props.video &&
      !initiator && props.rtc.event_type &&
      createPortal(
        <div id="call-status">
          <p>hay un wn llamandooo</p>
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

export function CallIcon (props) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24"
      aria-hidden="true" tabIndex="-1" title="Call">
      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"></path>
    </svg>
  )
}

export function CallEndIcon (props) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24"
      aria-hidden="true" tabIndex="-1" title="CallEnd">
      <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z">
      </path>
    </svg>
  )
}

export default connect(mapStateToProps)(RtcWrapper)
