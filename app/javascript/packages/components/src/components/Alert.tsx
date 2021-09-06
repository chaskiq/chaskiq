import React from 'react';

import { Transition } from '@headlessui/react';

import { connect } from 'react-redux';
import { isEmpty } from 'lodash';

import { clearStatusMessage } from '@chaskiq/store/src/actions/status_messages';
import I18n from '../../../../src/shared/FakeI18n';

function CustomizedSnackbars(props) {
  const [open, setOpen] = React.useState(!isEmpty(props.status_message));

  function handleClose(_event: React.SyntheticEvent, reason?: string) {
    if (reason === 'clickaway') return;
    props.dispatch(clearStatusMessage());
    setOpen(false);
  }

  React.useEffect(() => {
    setOpen(!isEmpty(props.status_message));
  }, [props]);

  React.useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      props.dispatch(clearStatusMessage());
    }, 2500);
    return () => clearTimeout(timer);
  }, [open]);

  function getPlacement() {
    return (
      props.status_message.placement || {
        vertical: 'bottom',
        horizontal: 'left',
      }
    );
  }

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

  return (
    <div>
      {!isEmpty(props.status_message) && (
        <Alert
          // open={open}
          onClose={handleClose}
          placementClass={placementClass()}
          message={props.status_message.message}
          status={props.status_message.variant}
        />
      )}
    </div>
  );
}

type AlertType = {
  title?: string;
  message: string;
  status?: 'success' | 'error';
  onClose: (event: any, reason?: any) => void;
  placementClass: string;
};

function Alert({ title, message, status, onClose, placementClass }: AlertType) {
  /*const [items, set] = useState([1])
  const transitions = useTransition(items, (item) => item.key, {
    from: { transform: 'translate3d(0,-40px,0)' },
    enter: { transform: 'translate3d(0,0px,0)' },
    leave: { transform: 'translate3d(0,-40px,0)' }
  })*/

  function statusIcon() {
    switch (status) {
      case 'success':
        return (
          <svg
            className="h-6 w-6 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case 'error':
        return (
          <svg
            className="h-6 w-6 text-red-400"
            fill="none"
            viewBox="0 0 20 20"
            stroke="currentColor"
          >
            <path
              d="M2.92893219,17.0710678 C6.83417511,20.9763107 13.1658249,20.9763107 17.0710678,17.0710678 C20.9763107,13.1658249 20.9763107,6.83417511 17.0710678,2.92893219 C13.1658249,-0.976310729 6.83417511,-0.976310729 2.92893219,2.92893219 C-0.976310729,6.83417511 -0.976310729,13.1658249 2.92893219,17.0710678 Z M15.6568542,15.6568542 C18.7810486,12.5326599 18.7810486,7.46734008 15.6568542,4.34314575 C12.5326599,1.21895142 7.46734008,1.21895142 4.34314575,4.34314575 C1.21895142,7.46734008 1.21895142,12.5326599 4.34314575,15.6568542 C7.46734008,18.7810486 12.5326599,18.7810486 15.6568542,15.6568542 Z M9,5 L11,5 L11,11 L9,11 L9,5 Z M9,13 L11,13 L11,15 L9,15 L9,13 Z"
              id="Combined-Shape"
            ></path>
          </svg>
        );
      default:
        return <p>nu</p>;
    }
  }

  //function transitionsClasses (status) {
  // x-show="show" x-transition:enter="transform ease-out duration-300 transition"
  // x-transition:enter-start="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
  // x-transition:enter-end="translate-y-0 opacity-100 sm:translate-x-0"
  // x-transition:leave="transition ease-in duration-100"
  // x-transition:leave-start="opacity-100"
  // x-transition:leave-end="opacity-0"
  //}

  return (
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
      <Transition
        // style={props}
        // x-data="{ show: true }"
        show={true}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className={
          'max-w-sm w-full bg-white dark:bg-gray-900 dark:border-gray-200 border border-transparent dark:text-gray-200 shadow-lg rounded-lg pointer-events-auto'
        }
      >
        <div className="rounded-lg shadow-xs overflow-hidden">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">{statusIcon()}</div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm leading-5 font-medium text-gray-900 dark:text-gray-100">
                  {title} {I18n.t(`status_messages.${status}`)}
                </p>
                <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-300">
                  {message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  // @click="show = false; setTimeout(() => show = true, 1000)"
                  onClick={onClose}
                  className="inline-flex text-gray-400 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
}

function mapStateToProps(state) {
  const { status_message } = state;
  return {
    status_message,
  };
}

export default connect(mapStateToProps)(CustomizedSnackbars);
