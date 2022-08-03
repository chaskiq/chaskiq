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

export const eventsSubscriber = (cableApp, cb) => {
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
      },
      disconnected: () => {
        console.log('disconnected from events');
      },
      received: (data) => {
        switch (data.type) {
          case '/package/TwilioPhone':
            cb(data);
          default:
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
};

// eslint-disable-next-line no-undef
document.addEventListener('DOMContentLoaded', () => {
  let data = document.querySelector(
    'meta[name="data"]'
    //@ts-ignore
  ).content;

  const endpointURL = document.querySelector(
    'meta[name="endpoint-url"]'
    //@ts-ignore
  ).content;

  const contentType = document.querySelector(
    'meta[name="content-type"]'
    //@ts-ignore
  ).content;

  const userToken = document.querySelector(
    'meta[name="user-token"]'
    //@ts-ignore
  )?.content;

  data = JSON.parse(data);
  ReactDOM.render(
    contentType && contentType === 'call-list' ? (
      <CallList data={data} endpointURL={endpointURL} userToken={userToken} />
    ) : (
      <PhoneCall data={data} endpointURL={endpointURL} />
    ),
    document.body.appendChild(document.getElementById('content'))
  );
});

function PhoneCall({ data, endpointURL }) {
  const CableApp = React.useRef(createSubscription());

  // Setup Twilio.Device
  let device = React.useRef(null);

  const [callStatus, setCallStatus] = React.useState('Connecting to Twilio...');

  const [callStarted, setCallStarted] = React.useState(false);
  const [holdStatus, setHoldStatus] = React.useState(false);

  let hangUpButton = React.useRef(null);
  let answerButton = React.useRef(null);

  const { agents_id, conversation_key, profile_id, user_key, user } = data;

  React.useEffect(() => {
    eventsSubscriber(CableApp.current, (event) => {
      if (event.payload.FriendlyName == conversation_key) {
        console.log(event);
        switch (event.payload.StatusCallbackEvent) {
          case 'participant-hold':
          case 'participant-unhold':
            setHoldStatus(event.payload.Hold === 'true');
            break;
          case 'participant-leave':
            //if(user.id + "" == event.agents_id)
            break;
          default:
            break;
        }
      }
    });

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

    device.current.on('ready', function (device) {
      console.log('Twilio.Device Ready!');
      setCallStatus('Ready');
    });

    device.current.on('error', function (error) {
      console.log('Twilio.Device Error: ' + error.message);
      setCallStatus('ERROR: ' + error.message);
    });

    device.current.on('connect', function (conn) {
      console.log('Successfully established call!');
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

  function putOnHold() {
    var url = endpointURL;
    var data = {
      conversation_key: conversation_key,
      type: 'hold',
      profile_id: profile_id,
      hold_action: !holdStatus,
    };

    fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .catch((error) => console.error('Error:', error))
      .then((response) => console.log('Success:', response));
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

              {callStarted && (
                <button
                  className="btn-notice inline-flex items-center px-3 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 disabled:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  onClick={putOnHold}
                >
                  {holdStatus ? 'unhold' : 'put on hold'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

function CallList({ data, userToken }) {
  const CableApp = React.useRef(createSubscription());

  const [conferences, setConferences] = React.useState(data.conferences);
  const [agentInCall, setAgentInCall] = React.useState(data.agent_in_call);
  const [event, setEvent] = React.useState(null);

  React.useEffect(() => {
    eventsSubscriber(CableApp.current, (e) => {
      setEvent(e);
    });
    return () => {
      console.log('unmounting cable from app container');
      if (CableApp.current) destroySubscription(CableApp.current);
    };
  }, []);

  React.useEffect(() => {
    if (!event) return;
    switch (event.payload.StatusCallbackEvent) {
      case 'conference-end':
        removeCall(event.payload);
        break;
      case 'participant-join':
        upsertConference(event);
        break;
      case 'participant-hold':
        updateCallStatus(event.payload, true);
        break;
      case 'participant-unhold':
        updateCallStatus(event.payload, false);
        break;
      default:
        break;
    }
  }, [event]);

  function updateCallStatus(payload, mode) {
    let newConferences = conferences.map((o) => {
      if (o.key === payload.FriendlyName) {
        const conf = Object.assign(o.conference, { hold_status: mode });
        return Object.assign(o, { conference: conf });
      } else {
        return o;
      }
    });
    setConferences(newConferences);
  }

  function removeCall(payload) {
    let newConferences = conferences.filter(
      (o) => o.key !== payload.FriendlyName
    );
    setConferences(newConferences);
  }

  function upsertConference(event) {
    const newConferences = upsert(conferences, event.conference);
    setConferences(newConferences);
  }

  function upsert(array, element) {
    const i = array.findIndex((_element) => _element.key === element.key);
    if (i > -1) {
      return array.map((o) => {
        if (o.key === element.key) {
          return element;
        } else {
          return o;
        }
      });
    } else {
      return [element, ...array];
    }
  }

  function status_class(val) {
    switch (val) {
      case 'completed':
        return 'bg-gray-800 text-white';
      case 'in-progress':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-100 text-black';
    }
  }

  function confClass(conf) {
    if (agentInCall) {
      return '-m-1 p-3 border border-transparent rounded-full shadow-sm text-white bg-green-300 cursor-default';
    } else {
      return '-m-1 p-3 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500';
    }
  }

  function confClick(e, conf) {
    e.preventDefault();

    if (agentInCall) {
      return false;
    } else {
      window.open(
        conf.url + `&user_token=${userToken}`,
        'pagename',
        'resizable,height=260,width=370'
      );
      return false;
    }
  }

  function goTo(url) {
    window.parent.postMessage({ type: 'url-push-from-frame', url: url }, '*');
    return false;
  }

  return (
    <div>
      <div>
        <ul
          role="list"
          className="flex-1 divide-y divide-gray-200 overflow-y-auto"
        >
          {conferences.map((conf) => (
            <li key={`call-conversation-${conf.conversation.key}`}>
              <div className="group relative flex items-center py-6 px-5">
                <div className="-m-1 block flex-1 p-1">
                  <div
                    className="absolute inset-0 group-hover:bg-gray-50 dark:group-hover:bg-gray-900"
                    aria-hidden="true"
                  ></div>
                  <div className="relative flex min-w-0 flex-1 items-center dark:text-white">
                    <a
                      href="#"
                      className={confClass(conf)}
                      onClick={(e) => confClick(e, conf)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 rounded-full"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </a>

                    <div className="ml-4 truncate">
                      <p
                        className={`text-xs font-medium p-1 my-1 rounded inline-block ${status_class(
                          conf.conference.status
                        )} `}
                      >
                        {conf.conference.status}
                      </p>

                      {conf.conference.hold_status && (
                        <p
                          className={`text-xs font-medium p-1 my-1 rounded inline-block bg-black text-white px-2 mx-2`}
                        >
                          ON HOLD
                        </p>
                      )}

                      <p className="truncate text-md text-gray-600 dark:text-gray-100 font-bold">
                        {conf.profile.profile_id}
                      </p>

                      {conf.agent_names.length > 0 && (
                        <p className="truncate text-xs text-gray-700 p-1 bg-blue-300 flex flex-col">
                          <span>AGENTS IN THE CALL:</span>
                          <div className="flex flex-col">
                            {conf.agent_names.map((o) => (
                              <span key={o}>{o}</span>
                            ))}
                          </div>
                        </p>
                      )}

                      {conf.agent_names.length === 0 && (
                        <p className="truncate text-xs text-gray-700 p-1 bg-yellow-300">
                          NO AGENTS IN THE CALL
                        </p>
                      )}

                      <button
                        className="relative flex items-center hover:text-gray-900 underline hover:underline"
                        onClick={() => goTo(conf.conference.url)}
                      >
                        Go to conversation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {conferences.length === 0 && (
          <div className="p-4 relative block w-full border-2 border-gray-300 border-dashed rounded-lg md:p-12 text-center hover:border-gray-400 focus:outline-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span className="mt-2 block text-sm font-medium text-gray-900">
              {' '}
              No active conversations{' '}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
