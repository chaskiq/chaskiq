import React from "react";
import {LoadBalancerIcon} from '../../icons'

function appPackage() {
  return <LoadBalancerIcon/>;
}

export default class OnDemandTriggers extends React.Component {
  render = () => {
    return <span></span>;
  };
}

export const OnDemandTriggersBlockConfig = (options = {}) => {
  let config = {
    title: "add AppPackage",
    type: "AppPackage",
    icon: appPackage,
    block: OnDemandTriggers,
    editable: true,
    renderable: true,
    breakOnContinuous: false,
    wrapper_class: "graf graf--AppPackage",
    selected_class: "is-selected",
    widget_options: {
      displayOnInlineTooltip: true,
      insertion: "func",
      funcHandler: options.handleFunc,
      insert_block: "AppPackage",
    },
  };

  return Object.assign(config, options);
};
