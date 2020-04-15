import React, { useState } from "react";
import { useTransition, animated } from "react-spring";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { isEmpty } from "lodash";

import { clearStatusMessage } from "../actions/status_messages";

function CustomizedSnackbars(props) {
  const [open, setOpen] = React.useState(!isEmpty(props.status_message));

  function handleClick() {
    setOpen(true);
  }

  function handleClose(event, reason) {
    if (reason === "clickaway") {
      return;
    }

    props.dispatch(clearStatusMessage());

    setOpen(false);
  }

  React.useEffect(() => {
    setOpen(!isEmpty(props.status_message));
  }, [props]);

  function getPlacement() {
    return (
      props.status_message.placement || {
        vertical: "bottom",
        horizontal: "left",
      }
    );
  }

  function placementClass() {
    let vertical = "end";
    let horizontal = "end";

    switch (getPlacement().vertical) {
      case "bottom":
        vertical = "end";
        break;
      case "top":
        vertical = "start";
        break;
      case "center":
        vertical = "center";
        break;
      default:
        break;
    }

    switch (getPlacement().horizontal) {
      case "left":
        horizontal = "end";
        break;
      case "right":
        horizontal = "start";
        break;
      case "center":
        horizontal = "center";
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
          open={open}
          onClose={handleClose}
          placementClass={placementClass()}
          message={props.status_message.message}
          status={props.status_message.variant}
        />
      )}
    </div>
  );
}

function Alert({ title, message, status, onClose, placementClass }) {
  const [items, set] = useState([1]);
  const transitions = useTransition(items, (item) => item.key, {
    from: { transform: "translate3d(0,-40px,0)" },
    enter: { transform: "translate3d(0,0px,0)" },
    leave: { transform: "translate3d(0,-40px,0)" },
  });

  function statusIcon() {
    switch (status) {
      case "success":
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
      default:
        return <p>nu</p>;
    }
  }

  function transitionsClasses(status) {
    // x-show="show" x-transition:enter="transform ease-out duration-300 transition"
    // x-transition:enter-start="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
    // x-transition:enter-end="translate-y-0 opacity-100 sm:translate-x-0"
    // x-transition:leave="transition ease-in duration-100"
    // x-transition:leave-start="opacity-100"
    // x-transition:leave-end="opacity-0"
  }

  return (
    <div
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
      {transitions.map(({ item, props, key }) => (
        <animated.div
          // style={props}
          // x-data="{ show: true }"
          // x-show="show" x-transition:enter="transform ease-out duration-300 transition"
          // x-transition:enter-start="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
          // x-transition:enter-end="translate-y-0 opacity-100 sm:translate-x-0"
          // x-transition:leave="transition ease-in duration-100"
          // x-transition:leave-start="opacity-100"
          // x-transition:leave-end="opacity-0"
          key={key}
          className={
            "max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto"
          }
        >
          <div className="rounded-lg shadow-xs overflow-hidden">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">{statusIcon()}</div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm leading-5 font-medium text-gray-900">
                    {title || status}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-gray-500">
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
        </animated.div>
      ))}
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
