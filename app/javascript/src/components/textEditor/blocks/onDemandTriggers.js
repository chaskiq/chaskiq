import React from 'react'
import { LoadBalancerIcon } from '../../icons'

function appPackage () {
  return <LoadBalancerIcon/>
}

export default class OnDemandTriggers extends React.Component {
  render = () => {
    return <span></span>
  };
}

export const OnDemandTriggersBlockConfig = (options = {}) => {
  const config = {
    title: 'Add Trigger',
    type: 'OnDemandTrigger',
    icon: appPackage,
    block: OnDemandTriggers,
    editable: true,
    renderable: true,
    breakOnContinuous: false,
    wrapper_class: 'graf graf--Trigger',
    selected_class: 'is-selected',
    widget_options: {
      displayOnInlineTooltip: true,
      insertion: 'func',
      funcHandler: options.handleFunc,
      insert_block: 'OnDemandTriggers'
    }
  }

  return Object.assign(config, options)
}
