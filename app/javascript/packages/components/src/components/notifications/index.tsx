import React from 'react'
import { Fragment, useState } from 'react'
import { Transition } from '@headlessui/react'
import { connect } from 'react-redux';
import { clearNotification } from '@chaskiq/store/src/actions/notifications';

function Notification({notifications, dispatch}) {

  const [open, setOpen] = useState(false);

  const sound = new Audio(`/sounds/ringtone.wav`);

  function placementClass() {
    let vertical = 'end';
    let horizontal = 'end';
  
    switch (getPlacement().vertical) {
      case 'bottom':
        vertical = 'end';
        break;
      case 'top':
        vertical = 'start';
        break;
      case 'center':
        vertical = 'center';
        break;
      default:
        break;
    }
  
    switch (getPlacement().horizontal) {
      case 'left':
        horizontal = 'end';
        break;
      case 'right':
        horizontal = 'start';
        break;
      case 'center':
        horizontal = 'center';
        break;
      default:
        break;
    }
  
    return `sm:items-${vertical} sm:justify-${horizontal}`;
  }
  
  function getPlacement() {
    return (
      notifications?.placement || {
        vertical: 'bottom',
        horizontal: 'left',
      }
    );
  }

  function playSound() {
    sound.volume = 0.4;
    sound.loop = true
    sound.play();
  }

  function stopSound() {
    sound.pause();
    sound.currentTime = 0;
  }

  React.useEffect(()=> {
    setOpen(notifications.message ? true : false)
  }, [notifications.message])

  React.useEffect(() => {
    if (!open) return;
    playSound()

    const timer = setTimeout(() => {
      dispatch(clearNotification());
      stopSound()
    }, notifications.timeout );
    return () => clearTimeout(timer);
  }, [open]);

  function handleClose(_event: React.SyntheticEvent, reason?: string) {
    if (reason === 'clickaway') return;
    dispatch(clearNotification());
    setOpen(false);
  }

  return (
    <>
      {
        notifications.message && 
        <NotificationAlert
          open={open}
          setOpen={setOpen}
          placementClass={placementClass()}
          handleClose={handleClose}
        />
      }
    </>
    
  )

}

function NotificationAlert({open, setOpen, placementClass, handleClose}) {

  return (
    <>
      <div
      style={{ zIndex: 1000 }}
      className={`fixed 
                  z-50 
                  inset-0 
                  flex 
                  items-end 
                  justify-center 
                  px-4 py-6 
                  pointer-events-none 
                  sm:p-6
                  ${placementClass}
                `}
    >

        <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={open}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 divide-x divide-gray-200">
              <div className="w-0 flex-1 flex items-center p-4">
                <div className="w-full">
                  <p className="text-sm font-medium text-gray-900">Receive notifications</p>
                  <p className="mt-1 text-sm text-gray-500">Notifications may include alerts, sounds, and badges.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex flex-col divide-y divide-gray-200">
                  <div className="h-0 flex-1 flex">
                    <button
                      className="w-full border border-transparent rounded-none rounded-tr-lg px-4 py-3 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:z-10 focus:ring-2 focus:ring-indigo-500"
                      onClick={() => {
                        handleClose(false)
                      }}
                    >
                      Reply
                    </button>
                  </div>
                  <div className="h-0 flex-1 flex">
                    <button
                      className="w-full border border-transparent rounded-none rounded-br-lg px-4 py-3 flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onClick={() => {
                        handleClose(false)
                      }}
                    >
                      Don't allow
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  )
}

function mapStateToProps(state) {
  const { notifications } = state;
  return {
    notifications,
  };
}

export default connect(mapStateToProps)(Notification);
