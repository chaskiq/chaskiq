import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Call, CallEnd, Pause } from '../components/src/components/icons';
import {
  createSubscription,
  eventsSubscriber,
  destroySubscription,
} from './subscriptions';

export const PhoneCall = ({ data, endpointURL, i18n }) => {
  const { conversation_key, agents_id, profile_id, user_key, user, on_hold, action } = data;
  const CableApp = useRef(createSubscription());

  // Setup Twilio.Device
  const device = useTwilioDevice(window.token);
  const [callState, setCallState] = useState(CallStates.Initializing);
  const [onHold, setOnHold] = useState(on_hold);
  const [error, setError] = useState();

  /* Join conference */
  const joinCall = useCallback(() => {
    console.log('joining', conversation_key);
    var params = {
      name: conversation_key,
      chaskiq_agent: user.id,
      chaskiq_action: action,
      profile_id: profile_id
    };

    device.connect(params);
  }, [device, profile_id, user, conversation_key]);

  const pickUpCall = useCallback(() => {
    device.__activeConnection.accept();
  }, [device, callState]);

  const toggleHold = useCallback(async () => {
    var data = {
      conversation_key: conversation_key,
      type: 'hold',
      profile_id: profile_id,
      hold_action: !onHold,
    };

    try {
      const result = await fetch(endpointURL, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Success:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  }, [endpointURL, onHold, conversation_key, profile_id]);

  const hangUpCall = useCallback(async () => {
    device.__activeConnection.disconnect();
  }, [callState, toggleHold]);

  useEffect(() => {
    eventsSubscriber(CableApp.current, (event) => {
      if (event.payload.FriendlyName == conversation_key) {
        switch (event.payload.StatusCallbackEvent) {
          case 'participant-hold':
            setOnHold(true);
            break;
          case 'participant-unhold':
            setOnHold(false);
            break;
        }
      }
    });

    return () => {
      console.log('unmounting cable from app container');
      if (CableApp.current) {
        destroySubscription(CableApp.current);
      }
    };
  }, []);

  useEffect(() => {
    device.on('ready', function () {
      console.log('Twilio.Device Ready!');
      setCallState(CallStates.Idle);
    });

    device.on('error', function (error) {
      console.error('Twilio.Device Error: ' + error.message);
      setError(error.message);
    });

    device.on('connect', function (conn) {
      console.log('Twilio.Connected!');
      device.__activeConnection = conn;

      setCallState(CallStates.InProgress);
    });

    device.on('disconnect', function (conn) {
      console.log('Twilio.Disconnect!');
      device.__activeConnection = conn;

      setCallState(CallStates.Idle);
    });

    device.on('incoming', function (conn) {
      console.log('Twilio.Incoming!');
      device.__activeConnection = conn;

      setCallState(CallStates.Incoming);
    });

    return () => {
      console.log('unmounting cable from app container');
    };
  }, [device]);

  const callStatus = useMemo(() => {
    if (error) {
      return i18n.t('twilio_phone.messages.error', { message: error });
    }

    if (callState === CallStates.InProgress) {
      return i18n.t('twilio_phone.messages.inProgress');
    }

    if (callState === CallStates.Incoming) {
      return i18n.t('twilio_phone.messages.incoming');
    }

    return null;
  }, [error, callState]);

  return (
    <div className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8 flex">
      <div className="max-w-3xl mx-auto justify-center items-center">
        <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="text-lg leading-6 font-medium text-gray-900">
            <h3 className="panel-title">
              {callStatus}
              {i18n.t('twilio_phone.labels.title', {
                subject: i18n.t(`twilio_phone.labels.${profile_id}`, {
                  defaultValue: profile_id,
                }),
              })}
            </h3>
          </div>

          <div className="panel-body">
            <div className="my-5 max-w-xl text-sm text-gray-500">
              {callStatus && (
                <>
                  <p>
                    <strong>{i18n.t('twilio_phone.labels.status')}</strong>
                  </p>

                  <div className="well well-sm" id="call-status">
                    {callStatus}
                  </div>
                </>
              )}
            </div>

            <div className="mt-5">
              {callState === CallStates.InProgress && (
                <button
                  className="hangup-button inline-flex items-center px-3 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 disabled:bg-red-300 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mr-5"
                  onClick={hangUpCall}
                >
                  <CallEnd className="mr-1" />
                  {i18n.t('twilio_phone.buttons.hangUp')}
                </button>
              )}
              {callState === CallStates.Incoming && (
                <button
                  className="btn-notice inline-flex items-center px-3 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 disabled:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-5"
                  onClick={pickUpCall}
                >
                  <Call className="mr-1" />
                  {i18n.t('twilio_phone.buttons.pickUp')}
                </button>
              )}
              {callState === CallStates.Idle || callState === CallStates.Incoming && (
                <button
                  className="btn-notice inline-flex items-center px-3 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 disabled:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-5"
                  onClick={joinCall}
                >
                  <Call className="mr-1" />
                  {agents_id.length > 0
                    ? i18n.t('twilio_phone.buttons.join')
                    : i18n.t('twilio_phone.buttons.pickUp')}
                </button>
              )}
              {(callState === CallStates.InProgress && onHold) && (
                <button
                  className="btn-notice inline-flex items-center px-3 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 disabled:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={toggleHold}
                >
                  <Call className="mr-1" />
                  {i18n.t('twilio_phone.buttons.holdOff')}
                </button>
              )}
              {(callState === CallStates.InProgress && !onHold) && (
                <button
                  className="btn-notice inline-flex items-center px-3 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-600 disabled:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  onClick={toggleHold}
                >
                  <Pause className="mr-1" />
                  {i18n.t('twilio_phone.buttons.holdOn')}
                </button>
              )}
              {action == "new" && callState === CallStates.Idle && (
                <button
                  className="btn-notice inline-flex items-center px-3 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 disabled:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mr-5"
                  onClick={joinCall}>
                  <Call className="mr-1" />
                  {agents_id.length > 0
                    ? i18n.t('twilio_phone.buttons.join')
                    : i18n.t('twilio_phone.buttons.pickUp')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function useTwilioDevice(token) {
  const device = useMemo(() => {
    const current = new window.Twilio.Device(token, {
      // Set Opus as our preferred codec. Opus generally performs better, requiring less bandwidth and
      // providing better audio quality in restrained network conditions. Opus will be default in 2.0.
      codecPreferences: ['opus', 'pcmu'],
      // Use fake DTMF tones client-side. Real tones are still sent to the other end of the call,
      // but the client-side DTMF tones are fake. This prevents the local mic capturing the DTMF tone
      // a second time and sending the tone twice. This will be default in 2.0.
      fakeLocalDTMF: true,
      // Use `enableRingingState` to enable the device to emit the `ringing`
      // state. The TwiML backend also needs to have the attribute
      // `answerOnBridge` also set to true in the `Dial` verb. This option
      // changes the behavior of the SDK to consider a call `ringing` starting
      // from the connection to the TwiML backend to when the recipient of
      // the `Dial` verb answers.
      enableRingingState: true,
    });

    return current;
  }, [token]);

  useEffect(() => {
    return () => {
      device.destroy();
    };
  }, [device]);

  return device;
}

const CallStates = {
  Initializing: 'Initializing',
  Idle: 'Idle',
  Connecting: 'Connecting',
  Incoming: 'Incoming',
  InProgress: 'InProgress'
};
