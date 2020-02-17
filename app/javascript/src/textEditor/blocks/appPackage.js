import React from 'react'
import WidgetsIcon from '@material-ui/icons/Widgets'

function appPackage(){
  return <WidgetsIcon/>
} 

export default class AppPackage extends React.Component {
  render = ()=> {
    return (
      <span></span>
    )
  }
}

export const AppPackageBlockConfig = (options={})=>{
  
  let config =  {
    title: 'add AppPackage',
    type: 'AppPackage',
    icon: appPackage,
    block: AppPackage,
    editable: true,
    renderable: true,
    breakOnContinuous: false,
    wrapper_class: "graf graf--AppPackage",
    selected_class: "is-selected",
    widget_options: {
      displayOnInlineTooltip: true,
      insertion: "func",
      funcHandler: options.handleFunc,
      insert_block: "AppPackage"
    }
  };
  
  return Object.assign(config, options)
}
