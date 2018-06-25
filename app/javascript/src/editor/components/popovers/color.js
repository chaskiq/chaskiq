import React from 'react'
import { SketchPicker } from 'react-color';

import Icons from "../icons.js"

export default class DanteTooltipColor extends React.Component {

  constructor(...args) {
    super(...args)
    this.toggle = this.toggle.bind(this)
    this.state = {
      open: false,
      value: this.props.value
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.show === false){
      this.setState({open: false})
    }
  }

  toggle(ev) {
    // let selection = this.props.editorState.getSelection()
    // prevent unselection of selection
    ev.preventDefault()
    this.setState({open: true }) //!this.state.open})
  }

  handleClick(e, item){
    e.preventDefault()
    this.setState({value: item},
      ()=>{
        let o = { [this.props.style_type]: this.state.value }
        this.props.handleClick(e, o)
      }
    )
  }

  currentValue(){
    let selection = this.props.editorState.getSelection()
    if (!selection.isCollapsed()) {
      return this.props.styles[this.props.style_type].current(this.props.editorState)
    } else {
      return
    }

  }

  renderColor(){
    //console.log(`${this.currentValue()} vs ${this.props.value}`)
    const v = this.currentValue() || this.props.value
    //console.log(`this should be ${v}`)

    if(this.state.open){
      return (
        <div style={{position: 'absolute'}}>
          <SketchPicker
            color={ v }
            presetColors={[]}
            onChangeComplete={(color, e)=>{
              this.handleClick(e,  color.hex )}
            }
          />
        </div>
      )
    }
  }

  render() {
    return (
      <li className="dante-menu-button"
        onMouseDown={ this.toggle }>
        <span className={ 'dante-icon'}>
          {Icons['fontColor']()}
        </span>

        { this.renderColor()}
      </li>
    )
  }
}