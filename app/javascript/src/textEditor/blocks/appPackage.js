import React from 'react'
//import {AppPackage} from "../icons";
import { updateDataOfBlock, addNewBlockAt } from "Dante2/package/es/model/index.js" //'../../../model/index.js'

function appPackage(){
  return <span></span> 
} 

export default class AppPackage extends React.Component {
  constructor(props) {
    super(props);
    this.config = this.props.blockProps.config
    let existing_data = this.props.block.getData().toJS()
    this.providers =  [
      {
        name: "calendy",
        scripts: ["https://assets.calendly.com/assets/external/widget.js"],
        frame: {type: "div", 
                class: "calendly-inline-widget", 
                src: "https://calendly.com/miguelmichelson/15min?hide_landing_page_details=1" },
        style: {minWidth:'320px', height:'630px'},
      },
      {
        name: "typeform",
        frame: {type: "iframe", src: "https://miguelmichelsonm.typeform.com/to/ucwHzU/embed.js"},
        style: {width: '100%', height: '500px'},
      }

    ]

    this.state = {
      provider: this.props.block.data.get('provider')
    }

  }

  componentDidMount(){
   // this.providers.map((o)=>{
   //   o.scripts && o.scripts.map((s)=> this.addScript(s))
   // })
  }

  updateData = (options)=> {
    let { blockProps, block } = this.props
    let { getEditorState } = blockProps
    let { setEditorState } = blockProps
    let data = block.getData()
    let newData = data.merge(this.state).merge(options)
    return setEditorState(updateDataOfBlock(getEditorState(), block, newData))
  }

  renderItem = (o)=>{
    return <button>{o.name}</button>
  }

  handleClick = (o)=>{
    this.setState({
      provider: o
    }, this.updateData)
  }
  
  render = ()=> {
    return (
      <span>

        {
          this.providers.map((o)=>{
            return <button onClick={()=>this.handleClick(o)}>
                    {o.name}
                   </button>
          })
        }

        {
          this.state.provider && this.renderItem(this.state.provider) 
        }

      </span>
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
      insertion: "insertion",
      insert_block: "AppPackage"
    }
  };
  
  return Object.assign(config, options)
}
