import actioncable from 'actioncable';
import React from 'react';
import ReactDOM from 'react-dom';

export function createSubscription() {
  const chaskiq_cable_url = document.querySelector(
    'meta[name="chaskiq-ws"]'
    //@ts-ignore
  ).content;

  const appId = document.querySelector(
    'meta[name="app-id"]'
    //@ts-ignore
  ).content;

  const accessToken = JSON.parse(localStorage.AUTH).auth.accessToken;

  return {
    events: null,
    cable: actioncable.createConsumer(
      `${chaskiq_cable_url}?app=${appId}&token=${accessToken}`
    ),
  };
}

export function destroySubscription(cableApp) {
  cableApp.events.unsubscribe();
}

export const eventsSubscriber = (cableApp) => {
  const appId = document.querySelector(
    'meta[name="app-id"]'
    //@ts-ignore
  ).content;

  // unsubscribe cable ust in case
  if (cableApp.events) {
    cableApp.events.unsubscribe();
  }

  cableApp.events = cableApp.cable.subscriptions.create(
    {
      channel: 'EventsChannel',
      app: appId,
    },
    {
      connected: () => {
        console.log('connected to events');
        //setSubscribed(true);
      },
      disconnected: () => {
        console.log('disconnected from events');
        //setSubscribed(false);
      },
      received: (data) => {
        // console.log('received', data)
        switch (data.type) {
          default:
            console.log('unhandled', data);
            return null;
        }
      },
      notify: () => {
        console.log('notify!!');
      },
      handleMessage: () => {
        console.log('handle message');
      },
    }
  );

  // window.cable = CableApp
};

// eslint-disable-next-line no-undef
document.addEventListener('DOMContentLoaded', () => {
  let data = document.querySelector(
    'meta[name="data"]'
    //@ts-ignore
  ).content;

  data = JSON.parse(data);
  ReactDOM.render(
    <PhoneApp data={data} />,
    document.body.appendChild(document.getElementById('content'))
  );
});

function PhoneApp({ data }) {
  const CableApp = React.useRef(createSubscription());

  // Setup Twilio.Device
  let device = React.useRef(null);

  const [callStatus, setCallStatus] = React.useState('Connecting to Twilio...');

  const [callStarted, setCallStarted] = React.useState(false);

  let hangUpButton = React.useRef(null);
  let answerButton = React.useRef(null);

  const { agents_id, conversation_key, profile_id, user_key, user } = data;

  React.useEffect(() => {
    eventsSubscriber(CableApp.current);

    return () => {
      console.log('unmounting cable from app container');
      if (CableApp.current) destroySubscription(CableApp.current);
    };
  }, []);

  React.useEffect(() => {
    console.log('Requesting Access Token...');

    device.current = new window.Twilio.Device(window.token, {
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

    /*
      callStatus = document.querySelector("#call-status");
      answerButton = document.querySelector(".answer-button");
      callSupportButton = document.querySelector(".call-support-button");
      hangUpButton = document.querySelector(".hangup-button");
      callCustomerButtons = document.querySelector(".call-customer-button");
    */

    device.current.on('ready', function (device) {
      console.log('Twilio.Device Ready!');
      //updateCallStatus("Ready");
      setCallStatus('Ready');
    });

    device.current.on('error', function (error) {
      console.log('Twilio.Device Error: ' + error.message);
      //updateCallStatus("ERROR: " + error.message);
      setCallStatus('ERROR: ' + error.message);
    });

    device.current.on('connect', function (conn) {
      console.log('Successfully established call!');

      //hangUpButton.current.disabled = false
      //answerButton.current.disabled = true;

      //hangUpButton.disabled = false;
      //callCustomerButtons.disabled = true;
      //callSupportButton.disabled = true;
      //answerButton.disabled = true;
      // If phoneNumber is part of the connection, this is a call from a
      // support agent to a customer's phone
      if ('phoneNumber' in conn.message) {
        updateCallStatus('In call with ' + conn.message.phoneNumber);
      } else {
        // This is a call from a website user to a support agent
        updateCallStatus('In call with support');
      }

      setCallStarted(true);
    });

    device.current.on('disconnect', function (conn) {
      // Disable the hangup button and enable the call buttons
      /*hangUpButton.disabled = true;
      callCustomerButtons.disabled = false;
      callSupportButton.disabled = false;*/
      //hangUpButton.current.disabled = false
      setCallStatus('Ready');
      setCallStarted(false);
    });

    device.current.on('incoming', function (conn) {
      setCallStatus('Incoming support call');

      // Set a callback to be executed when the connection is accepted
      conn.accept(function () {
        setCallStarted(true);
        setCallStatus('In call with customer');
      });

      // Set a callback on the answer button and enable it
      answerButton.current.click(function () {
        conn.accept();
      });

      // answerButton.disabled = false;
      //answerButton.current.disabled = false
    });

    return () => {
      console.log('unmounting cable from app container');
    };
  }, []);

  /* Helper function to update the call status bar */
  function updateCallStatus(status) {
    //callStatus.textContent = status;
    setCallStatus(status);
  }

  /* Join conference */
  function joinConferenceCustomer() {
    const phoneNumber = profile_id;
    updateCallStatus('Calling ' + phoneNumber + '...');

    console.log('joining', conversation_key);
    var params = {
      name: conversation_key,
      chaskiq_agent: user.id,
    };

    device.current.connect(params);
  }

  /* End a call */
  function hangUp() {
    setCallStarted(false);
    device.current.disconnectAll();
  }

  return (
    <React.Fragment>
      <div className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8 flex">
        <div className="max-w-3xl mx-auto justify-center items-center">
          <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div className="text-lg leading-6 font-medium text-gray-900">
              <h3 className="panel-title">Call with {profile_id} </h3>
            </div>

            <div className="panel-body">
              <div className="my-2 max-w-xl text-sm text-gray-500">
                <p>
                  <strong>Status</strong>
                </p>

                <div className="well well-sm" id="call-status">
                  {callStatus}
                </div>
              </div>

              {callStarted ? 'SI' : 'NO'}

              <button
                className="hangup-button inline-flex items-center px-3 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 disabled:bg-red-300 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                //disabled
                disabled={!callStarted}
                ref={hangUpButton}
                onClick={hangUp}
              >
                Hang up
              </button>

              <button
                className="btn-notice inline-flex items-center px-3 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 disabled:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                ref={answerButton}
                disabled={callStarted}
                onClick={joinConferenceCustomer}
              >
                {agents_id.length > 0 ? 'Join call' : 'Pickup'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
