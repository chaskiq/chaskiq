import React from 'react'
import Button from './Button'

import { connect } from 'react-redux'

import { createPortal } from 'react-dom'
import usePortal from './hooks/usePortal'

// Broadcast Types
const JOIN_ROOM = 'JOIN_ROOM'
const EXCHANGE = 'EXCHANGE'
const REMOVE_USER = 'REMOVE_USER'
const START_CALL = 'START_CALL'
const END_CALL = 'END_CALL'
// Ice Credentials

const ice = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
}

let sendChannel = null
let receiveChannel = null
var localStream = null

export function RtcView (props) {
  const currentUser = props.current_user.email

  const [pcPeers, setPcPeers] = React.useState({})

  const localVideo = React.useRef(null)
  const remoteVideoContainer = React.useRef(null)

  const documentObject = props.document || document

  const target = usePortal(props.buttonElement, documentObject)
  const infoTarget = usePortal(props.infoElement, documentObject)
  const localVideoTarget = usePortal(props.localVideoElement, documentObject)
  const remoteVideoTarget = usePortal(props.remoteVideoElement, documentObject)
  const callStatusTarget = usePortal(props.callStatusElement, documentObject)

  React.useEffect(() => {
    props.video ? initVideoSession() : null
    // setTimeout(()=>
    //  handleJoinSession(), Math.random()
    // )
    return handleLeaveSession()
  }, [])

  React.useEffect(() => {
    props.video && initVideoSession()
    !props.video && handleLeaveSession()
  }, [props.video])

  React.useEffect(() => {
    handleRtcData()
  }, [props.rtc])

  React.useEffect(() => {
    localStream && localStream.getTracks().forEach((track) => (
      toggleTrack(track)
    ))
  }, [props.rtcVideo, props.rtcAudio])

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

  function handleRtcData () {
    // console.log('RTC UPDATE!!', props.rtc)

    const data = props.rtc

    if (data.from === currentUser) return;

    switch (data.event_type) {
      case JOIN_ROOM:
        console.log('join room!', data)
        return joinRoom(data)
      case EXCHANGE:
        if (data.to !== currentUser) return
        if(!props.video) return
        console.log('trying exchange', data.to, data.from)
        return exchange(data)
      case REMOVE_USER:
        return removeUser(data)
      default:
    }
  }

  function handleJoinSession () {
    broadcastData({
      event_type: JOIN_ROOM,
      from: currentUser
    })
  }

  function handleLeaveSession () {
    for (var user in pcPeers) {
      pcPeers[user].close()
    }
    // pcPeers = {}
    setPcPeers({})
    // App.session.unsubscribe();

    if (remoteVideoContainer) remoteVideoContainer.current.innerHTML = ''

    broadcastData({
      event_type: REMOVE_USER,
      from: currentUser
    })

    if (localStream) {
      localStream.getTracks().forEach(
        (track) => track.stop()
      )
    }

    /*

    stream.removeTrack(track);
    if (pc.removeTrack) {
      pc.removeTrack(pc.getSenders().find(sender => sender.track == track));
    } else {
      // If you have code listening for negotiationneeded events:
      setTimeout(() => pc.dispatchEvent(new Event('negotiationneeded')));
    }

    */
  }

  function joinRoom (data) {
    createPC(data.from, true)
  }

  function removeUser (data) {
    console.log('removing user', data.from)
    const video = documentObject.getElementById(`remoteVideoContainer+${data.from}`)
    video && video.remove()
    console.log('peers', pcPeers)
    // delete pcPeers[data.from]
    const newPeers = {
      ...pcPeers
    }
    delete newPeers[data.from]
    console.log('removed , current peers', newPeers)
    setPcPeers(newPeers)
  }

  function removePeers () {
    Object.keys(pcPeers).map((k) => removeUser({ from: k }))
  }

  function createPC (userId, isOffer) {
    const pc = new RTCPeerConnection(ice)
    // pcPeers[userId] = pc
    setPcPeers({ ...pcPeers, [userId]: pc })
    // DISABLE VIDEO
    if (!props.video) return

    if (props.video) {
      localStream.getTracks().forEach(function (track) {
        localStream.addTrack(track)
        if (pc.addTrack) {
          pc.addTrack(track, localStream)
        } else {
          // If you have code listening for negotiationneeded events:
          setTimeout(() => pc.dispatchEvent(new Event('negotiationneeded')))
        }
      })
    }

    pc.ondatachannel = receiveChannelCallback

    sendChannel = pc.createDataChannel('sendDataChannel')
    console.log('Created send data channel')
    sendChannel.onopen = onSendChannelStateChange
    sendChannel.onclose = onSendChannelStateChange

    isOffer &&
      pc
        .createOffer()
        .then(offer => {
          pc.setLocalDescription(offer)
          broadcastData({
            event_type: EXCHANGE,
            from: currentUser,
            to: userId,
            sdp: JSON.stringify(pc.localDescription)
          })
        })
        .catch(logError)

    pc.onicecandidate = event => {
      event.candidate &&
        broadcastData({
          event_type: EXCHANGE,
          from: currentUser,
          to: userId,
          candidate: JSON.stringify(event.candidate)
        })
    }

    pc.ontrack = event => {
      const id = `remoteVideoContainer+${userId}`
      let element = documentObject.getElementById(id)
      if (!element) {
        element = documentObject.createElement('video')
        element.id = `remoteVideoContainer+${userId}`
        remoteVideoContainer.current.appendChild(element)
      }

      element.autoplay = 'autoplay'
      element.srcObject = event.streams[0]
    }

    /* pc.onaddstream = event => {
      const element = documentObject.createElement('video')
      element.id = `remoteVideoContainer+${userId}`
      element.autoplay = 'autoplay'
      element.srcObject = event.stream
      element.style = 'border: 1px solid red;width: 100px;height: 100px;'
      remoteVideoContainer.current.appendChild(element)
    } */

    pc.oniceconnectionstatechange = event => {
      if (pc.iceConnectionState === 'disconnected') {
        console.log('Disconnected:', userId)
        broadcastData({
          event_type: REMOVE_USER,
          from: userId
        })
      }
    }

    return pc
  }

  function exchange (data) {
    let pc

    console.log('PC PEERS', pcPeers)

    if (!pcPeers[data.from]) {
      pc = createPC(data.from, false)
    } else {
      // if("candidate already exists!") return
      pc = pcPeers[data.from]
    }

    if (data.candidate) {
      pc
        .addIceCandidate(new RTCIceCandidate(JSON.parse(data.candidate)))
        .then(() => console.log('Ice candidate added'))
        .catch(logError)
    }

    if (data.sdp) {
      const sdp = JSON.parse(data.sdp)

      pc
        .setRemoteDescription(new RTCSessionDescription(sdp))
        .then(() => {
          if (sdp.type === 'offer') {
            pc.createAnswer().then(answer => {
              pc.setLocalDescription(answer)
              broadcastData({
                event_type: EXCHANGE,
                from: currentUser,
                to: data.from,
                sdp: JSON.stringify(pc.localDescription)
              })
            })
          }
        })
        .catch(logError)
    }
  }

  function broadcastData (data) {
    const a = {
      type: 'rtc_events',
      app: props.appKey,
      conversation_id: props.conversation.key
    }

    const params = Object.assign({}, data, a)
    console.log("BROADCAST", params)
    props.events.perform('rtc_events', params)
  }

  const logError = error => console.warn('Whoops! Error:', error)

  const receiveChannelCallback = (event) => {
    console.log('Receive Channel Callback')
    receiveChannel = event.channel
    receiveChannel.onmessage = onReceiveMessageCallback
    receiveChannel.onopen = onReceiveChannelStateChange
    receiveChannel.onclose = onReceiveChannelStateChange
  }

  /* const sendData = () => {
    const data = props.diff
    // console.log("data diff: ", data)
    if (sendChannel && sendChannel.readyState === 'open') {
      console.log('Sent Data: ' + data)
      sendChannel.send(data)
    }
  } */

  const onReceiveMessageCallback = (event) => {
    console.log('Received Message')
    props.handleRTCMessage(event.data)
    // dataChannelReceive.value = event.data;
    // console.log(event.data)
  }

  const onSendChannelStateChange = () => {
    const readyState = sendChannel.readyState
    console.log('Send channel state is: ' + readyState)
  }

  const onReceiveChannelStateChange = () => {
    const readyState = receiveChannel.readyState
    console.log(`Receive channel state is: ${readyState}`)
  }

  return <React.Fragment>
    {
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

    {
      infoTarget && createPortal(
        <React.Fragment>

          {/* <Button
          onClick={handleJoinSession}>
                  joinkk
        </Button> */}

          {' '}

          <b>you: {' '}</b>
          <span id="current-user">
            {currentUser}
          </span>

          <b>connected users: </b>

          {
            Object.keys(pcPeers).map((o) => (
              <span key={`user-${o}`}>
                {o}
              </span>
            )
            )
          }

        </React.Fragment>, infoTarget)
    }

    {
      props.callStatusElement && !props.video &&
      Object.keys(pcPeers).length > 0 &&
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
              onClick={() => removePeers() }
              style={{ color: 'white', backgroundColor: 'red', border: 'none' }}>
              <CallEndIcon style={{ height: '30px', width: '30px' }}/>
            </button>
          </div>
        </div>
        , callStatusTarget)
    }

    {
      localVideoTarget && createPortal(
        <video id="local-video"
          ref={ localVideo }
          autoPlay>
        </video>, localVideoTarget
      )
    }

    {
      remoteVideoTarget && createPortal(
        <div id="remote-video-container"
          ref={ remoteVideoContainer }>
        </div>, remoteVideoTarget)
    }

    { /*
        props.manualJoin && <div>
          <button onClick={handleJoinSession}>
            Join Session
          </button>

          <button onClick={handleLeaveSession}>
            Leave Room
          </button>
        </div>
      */}

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
