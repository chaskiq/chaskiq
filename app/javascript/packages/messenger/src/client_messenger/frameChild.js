import React from 'react'
import RtcView from '@chaskiq/components/src/components/rtcView'


const FrameChild = ({
  // window,
  document,
  state,
  props,
  events,
  updateRtc,
  setVideoSession,
  toggleAudio,
  toggleVideo,
}) => {
  return (
    <React.Fragment>
      {
        <RtcView
          document={document}
          buttonElement={'callButton'}
          infoElement={'info'}
          localVideoElement={'localVideo'}
          remoteVideoElement={'remoteVideo'}
          callStatusElement={'callStatus'}
          callButtonsElement={'callButtons'}
          current_user={{ email: props.session_id }}
          rtc={state.rtc}
          handleRTCMessage={() => {}}
          toggleAudio={toggleAudio}
          toggleVideo={toggleVideo}
          rtcAudio={state.rtcAudio}
          rtcVideo={state.rtcVideo}
          onCloseSession={() => {
            updateRtc({})
          }}
          toggleVideoSession={() => setVideoSession(!state.videoSession)}
          video={state.videoSession}
          events={events}
          AppKey={props.app_id}
          conversation={state.conversation}
        />
      }
    </React.Fragment>
  )
}

export default FrameChild