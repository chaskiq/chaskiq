import React, { useRef, useState, useEffect } from 'react';
import { createSubscription, eventsSubscriber, destroySubscription } from './subscriptions';


export const CallList = ({ i18n, data, userToken }) => {
  const CableApp = useRef(createSubscription());
  const [conferences, setConferences] = useState(data.conferences);
  const [agentInCall, setAgentInCall] = useState(data.agent_in_call);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    eventsSubscriber(CableApp.current, (e) => {
      setEvent(e);
    });
    return () => {
      console.log('unmounting cable from app container');
      if (CableApp.current) destroySubscription(CableApp.current);
    };
  }, []);

  useEffect(() => {
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
                          {i18n.t('twilio_phone.status.onHold')}
                        </p>
                      )}

                      <p className="truncate text-md text-gray-600 dark:text-gray-100 font-bold">
                        {conf.profile.profile_id}
                      </p>

                      {conf.agent_names.length > 0 && (
                        <p className="truncate text-xs text-gray-700 p-1 bg-blue-300 flex flex-col">
                          <span>{i18n.t('twilio_phone.messages.agentsInCall')}</span>
                          <div className="flex flex-col">
                            {conf.agent_names.map((o) => (
                              <span key={o}>{o}</span>
                            ))}
                          </div>
                        </p>
                      )}

                      {conf.agent_names.length === 0 && (
                        <p className="truncate text-xs text-gray-700 p-1 bg-yellow-300">
                          {i18n.t('twilio_phone.messages.noAgentsInCall')}
                        </p>
                      )}

                      <button
                        className="relative flex items-center hover:text-gray-900 underline hover:underline"
                        onClick={() => goTo(conf.conference.url)}
                      >
                        {i18n.t('twilio_phone.buttons.goToConversation')}
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
              {i18n.t('twilio_phone.messages.noConversations')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
