import React from 'react';
import { RtcView } from '@chaskiq/components/src/components/rtc';

type FrameChildProps = {
  document?: any;
  state: any;
  props: any;
  events: any;
  updateRtc: any;
  setVideoSession: any;
  toggleAudio: any;
  toggleVideo: any;
  pushEvent: any;
};

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
  pushEvent,
}: FrameChildProps) => {
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
          pushEvent={pushEvent}
          handleRTCMessage={() => {}}
          toggleAudio={toggleAudio}
          toggleVideo={toggleVideo}
          rtcAudio={state.rtcAudio}
          rtcVideo={state.rtcVideo}
          onCloseSession={() => {
            updateRtc({});
          }}
          toggleVideoSession={() => setVideoSession(!state.videoSession)}
          video={state.videoSession}
          events={events}
          AppKey={props.app_id}
          conversation={state.conversation}
        />
      }
    </React.Fragment>
  );
};

export default FrameChild;
