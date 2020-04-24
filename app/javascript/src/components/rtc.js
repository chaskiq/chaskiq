import React from 'react'
import Button from './Button'

import { uniq } from 'lodash'
import { connect } from 'react-redux'

import { createPortal } from 'react-dom'
import usePortal from './hooks/usePortal'

// Broadcast Types
const JOIN_ROOM = 'JOIN_ROOM'
const EXCHANGE = 'EXCHANGE'
const REMOVE_USER = 'REMOVE_USER'
// Ice Credentials

const ice = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
}

// Objects
let pcPeers = {}
// data objects
const localConnection = null
const remoteConnection = null
let sendChannel = null
let receiveChannel = null
var localStream = null

export function RtcView (props) {
  const currentUser = props.current_user.email

  const [users, setUsers] = React.useState([])

  const localVideo = React.useRef(null)
  const remoteVideoContainer = React.useRef(null)

  const documentObject = props.document || document

  const target = usePortal(props.buttonElement, documentObject)
  const infoTarget = usePortal(props.infoElement, documentObject)
  const localVideoTarget = usePortal(props.localVideoElement, documentObject)
  const remoteVideoTarget = usePortal(props.remoteVideoElement, documentObject)


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

  function initVideoSession () {
    navigator
      .mediaDevices
      .getUserMedia({
        audio: false,
        video: true
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

    switch (data.event_type) {
      case JOIN_ROOM:
        console.log('join room eepe', data)
        return joinRoom(data)
      case EXCHANGE:
        if (data.to !== currentUser) return
        console.log('trying exgancn', data.to, data.from)
        setUsers(uniq(users.concat(data.from)))
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
    pcPeers = {}

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
    delete pcPeers[data.from]
  }

  function createPC (userId, isOffer) {
    const pc = new RTCPeerConnection(ice)
    pcPeers[userId] = pc
    // DISABLE VIDEO
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
      createPortal(
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
      createPortal(
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

          {
            users.length > 0
              ? <span>
                {' '}
                <b>connected users: </b>
                {' '}
                {users.map((o) => (
                  <span key={`user-${o}`}>
                    {o}
                  </span>
                ))}
              </span> : null
          }
        </React.Fragment>, infoTarget)
    }

    {
      createPortal(
        <video id="local-video"
          ref={ localVideo }
          autoPlay>
        </video>, localVideoTarget
      )
    }

    {
      createPortal(
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

export default connect(mapStateToProps)(RtcWrapper)
