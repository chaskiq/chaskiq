
import React from 'react'
import ReactDOM from 'react-dom'

import { Popover, OverlayTrigger, Overlay } from 'react-bootstrap';
import { SketchPicker } from 'react-color';
import { EditorBlock } from 'draft-js'


import {UpdateData} from "./commons.js"

export default class ButtonBlock extends React.Component {
  constructor(props) {
    super(props)

    let existing_data = this.props.block.getData().toJS()
    this.state = {
      enabled: false,
      label: existing_data.label || "click me",
      href: existing_data.href || "",
      data: this.props.blockProps.data.toJS(),
      containerStyle: existing_data.containerStyle || this.containerStyle(),
      buttonStyle: existing_data.buttonStyle || this.defaultStyle(),
      float: existing_data.float || "left",
      border: existing_data.border || "default",
      fill: existing_data.fill || "fill",
      displayPopOver: false
    }

    this.togglePopUp        = this.togglePopUp.bind(this)
    this.changeLabel        = this.changeLabel.bind(this)
    this.changeHref         = this.changeHref.bind(this)
    this.handleFloat        = this.handleFloat.bind(this)
    this.handleFill         = this.handleFill.bind(this)
    this.handleBorder       = this.handleBorder.bind(this)
    this.setButtonStyle     = this.setButtonStyle.bind(this)
    this.defaultStyle       = this.defaultStyle.bind(this)
    this.toggle             = this.toggle.bind(this)
    this.hidePopover        = this.hidePopover.bind(this)
    this.updateData         = this.updateData.bind(this)
    this.setWrapperRef      = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  /**
   * Set the wrapper ref
   */
  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target) && !event.target.closest(".popover")) {
        this.hidePopover()
    }
  }

  // will update block state
  updateData() {
    UpdateData(this)
  }

  changeLabel(ev){
    this.setState({
      label: ev.currentTarget.value
    }, this.updateData)
  }

  changeHref(ev){
    this.setState({
      href: ev.currentTarget.value
    }, this.updateData)
  }

  setButtonStyle(args){
   let a = Object.assign({}, this.state.buttonStyle, args);
    this.setState({buttonStyle: a}, this.updateData)
  }

  defaultStyle(){
    return {
      color: "#fff",
      backgroundColor: "#3498db",
      padding: "6px 12px",
      display: "inline-block",
      fontFamily: "Helvetica",
      fontSize: 13,
      float: "none",
     }
  }

  containerStyle(){
    return {
      textAlign: "left",
      margin: "0px 13px 0px 0px"
    }
  }

  setPosition(direction){
    switch (direction) {
      case "left":
        return Object.assign({}, this.state.containerStyle, { textAlign: 'left' });
        break;
      case "right":
        return Object.assign({}, this.state.containerStyle, { textAlign: 'right' });
        break;
      case "center":
        return Object.assign({}, this.state.containerStyle, { textAlign: 'center' });
        break;
      default:
        return this.containerStyle()
    }
  }

  setFill(fill){
    switch (fill) {
      case "fill":
        return Object.assign({}, this.state.buttonStyle, { color: this.state.buttonStyle.backgroundColor,
                                                          backgroundColor: this.state.buttonStyle.color,
                                                          border: `1px solid ${this.state.buttonStyle.color}`
                                                        });
        break;
      case "stroke":
        return Object.assign({}, this.state.buttonStyle, {
          color: this.state.buttonStyle.backgroundColor,
          backgroundColor: this.state.buttonStyle.color,
          border: `1px solid ${this.state.buttonStyle.backgroundColor}`
        });
        break;
      default:
        return this.defaultStyle()
    }
  }

  handleFloat(direction){
    console.log(`direction ${direction}`)
    this.setState({
      containerStyle: this.setPosition(direction),
      float: direction
    },
      ()=>{
        this.updateData()
        // this will toggle popover on position change
        //this.refs.btn.click()
        this.setState({displayPopOver: false}, ()=>{

          setTimeout( ()=>{
            this.setState({displayPopOver: true})
                 // this.refs.btn.click()
          }, 300)


        })
      }
    )
  }

  handleFill(fill){
    console.log(`fill ${fill}`)
    this.setState({
      buttonStyle: this.setFill(fill),
      fill: fill
    },
      this.updateData
    )
  }

  getBorderValue(border){
    switch (border){
      case "medium":
        return "6px"
      case "large":
        return "40px"
      default:
        return "0px"
    }
  }

  handleBorder(border){
    console.log(`border ${border}`)
    let borderStyle = this.getBorderValue(border)
    this.setState({border: border}, ()=>{
      this.setButtonStyle({borderRadius: borderStyle})
    })

  }

  popoverTop(){
    return (<Popover id="popover-positioned-top" title="Popover top">
              <ButtonControls
                changeLabel={this.changeLabel}
                label={this.state.label}
                changeHref={this.changeHref}
                handleFloat={this.handleFloat}
                handleFill={this.handleFill}
                handleBorder={this.handleBorder}
                float={this.state.float}
                border={this.state.border}
                toggle={this.toggle}
                fill={this.state.fill}
                href={this.state.href}
                blockProps={this.props.blockProps}
                buttonStyle={this.state.buttonStyle}
                setButtonStyle={this.setButtonStyle}
              />
            </Popover>)
  }

  togglePopUp(ev){
    ev.preventDefault()
    this.setState({ displayPopOver: !this.state.displayPopOver }) //, this.updateData );
    //this.setState({enabled: !this.state.enabled})
  }

  toggle() {
    this.setState({ displayPopOver: !this.state.displayPopOver }) //, this.updateData);
  }

  hidePopover(){
    this.setState({ displayPopOver: false });
  }

  placeholderRender(){
    if (this.props.block.text.length === 0 ) {
      return  (
        <div className="public-DraftEditorPlaceholder-root">
          <div className="public-DraftEditorPlaceholder-inner">
            {"write something" }
          </div>
        </div>
      )
    }
  }

  render() {
    // onClick={this.togglePopUp}
    // onMouseOver={this.props.blockProps.disableEditable}
    // onMouseOut={this.props.blockProps.enableEditable}
    return (
      <div style={{width: '100%', margin: "18px 0px 47px 0px"}}>
        <div 
          ref={this.setWrapperRef}
          style={this.state.containerStyle}>
          <a href={this.href}
            className="btn"
            onClick={this.togglePopUp}
            ref="btn"
            style={this.state.buttonStyle}
            href={this.state.href}
            onMouseOver={ this._showPopLinkOver }
            onMouseOut={ this._hidePopLinkOver }
            >

            {/*this.state.label*/}

            {/*this.placeholderRender()*/}

            {
              <EditorBlock
                {...Object.assign({}, this.props)} 
              />
            }
          </a>


          {
            this.state.displayPopOver ?
            <Overlay
              show={this.state.displayPopOver}
              placement="top"
              //container={this}
              target={() => this.refs.btn }>
              {this.popoverTop()}
            </Overlay>
            : <p/>
            
          }
        </div>
    </div>

    )
  }
}

class ButtonControls extends React.Component {

  constructor(props) {
    super(props)
    this.changeLabel = this.changeLabel.bind(this)
    this.changeHref  = this.changeHref.bind(this)
    this.state = {
      open: false,
      fontsFamilies: ["Georgia",
                      "Helvetica",
                      "Tahoma",
                      "Times",
                      "Verdana"],
      fontSizes:  [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                   22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 44, 48,
                   52, 56, 60]
    }
  }

  changeLabel(ev){
    console.log(ev)
    this.props.changeLabel(ev)
  }

  changeHref(ev){
    console.log(ev)
    this.props.changeHref(ev)
  }

  activeFloat(direction){
    if(direction == this.props.float){
      return "active"
    }else{
      return ""
    }
  }

  activeFill(fill){
    if(fill == this.props.fill){
      return "active"
    }else{
      return ""
    }
  }

  activeBorder(border){
    if(border == this.props.border){
      return "active"
    }else{
      return ""
    }
  }

  render(){
    return (
      <div
        key="0"
        id="button-edit"
        onMouseOver={(e)=> {
            this.props.blockProps.disableEditable() 
          }
        }
        onMouseOut={(e)=> {
            this.setState({ displayPopOver: false })
            this.props.blockProps.enableEditable()
          }
        }>
        <a
          className="close-popup"
          href="#" onClick={(ev)=>{ ev.preventDefault(); this.props.toggle(ev) }}  >
          <svg
            className="svgIcon-use"
            height="19"
            viewBox="0 0 19 19"
            width="19">
            <path
              d="M13.792 4.6l-4.29 4.29-4.29-4.29-.612.613 4.29 4.29-4.29 4.29.613.612 4.29-4.29 4.29 4.29.612-.613-4.29-4.29 4.29-4.29"
              fillRule="evenodd"
            />
          </svg>
        </a>

        <div className="edit">
          <div className="content-elements">
            {
              /*
              <div className="form-group">
                <input
                  className="form-control"
                  id="buttonText"
                  placeholder="Click me"
                  type="text"
                  value={this.props.label}
                  onChange={this.changeLabel}
                />
              </div>
              */
            }

            <div className="input-group">
              <span
                className="input-group-addon"
                id="link">
                <img
                  className="link"
                  src={"images/icons/link.svg"}
                />
              </span>
              <input
                className="form-control"
                placeholder="Add link to button"
                type="text"
                value={this.props.href}
                onChange={this.changeHref}
              />
            </div>
          </div>

          <div className="design-settings">

            <div
              aria-label="..."
              className="btn-group btn-group-justified"
              id="button-align"
              role="group">
              <div
                className="btn-group"
                role="group">
                <button
                  className={`btn btn-default ${this.activeFloat('left')}`}
                  type="button"
                  onClick={(ev)=>{ev.preventDefault(); this.props.handleFloat("left")}}>

                  <svg className="link" xmlns="http://www.w3.org/2000/svg" width="25" height="12" viewBox="0 0 25 12">
                    <g>
                      <rect width="25" height="1" y="11"/>
                      <rect width="13" height="6" x="1" y="3" rx=".5"/>
                      <rect width="25" height="1"/>
                    </g>
                  </svg>
                </button>
              </div>

              <div
                className="btn-group"
                role="group">
                <button
                  className={`btn btn-default ${this.activeFloat('right')}`}
                  type="button"
                  onClick={(ev)=>{ev.preventDefault(); this.props.handleFloat("right")}}>
                  <svg className="link" xmlns="http://www.w3.org/2000/svg" width="25" height="12" viewBox="0 0 25 12">
                    <g>
                      <rect width="25" height="1" y="11"/>
                      <rect width="13" height="6" x="11" y="3" rx=".5"/>
                      <rect width="25" height="1"/>
                    </g>
                  </svg>
                </button>
              </div>
              <div
                className="btn-group"
                role="group">
                <button
                  className={`btn btn-default ${this.activeFloat('center')}`}
                  type="button"
                  onClick={(ev)=>{ev.preventDefault(); this.props.handleFloat("center")}}>
                  <svg className="link" xmlns="http://www.w3.org/2000/svg" width="25" height="12" viewBox="0 0 25 12">
                    <g>
                      <rect width="25" height="1" y="11"/>
                      <rect width="13" height="6" x="6" y="3" rx=".5"/>
                      <rect width="25" height="1"/>
                    </g>
                  </svg>
                </button>
              </div>
            </div>
            <div
              aria-label="..."
              className="btn-group btn-group-justified"
              id="button-corners"
              role="group">
              <div
                className="btn-group"
                role="group">
                <button
                  className={`btn btn-default ${this.activeBorder('default')}`}
                  type="button"
                  onClick={(ev)=>{
                    ev.preventDefault()
                    this.props.handleBorder("default")
                  }}>
                  <svg className="link" xmlns="http://www.w3.org/2000/svg" width="43" height="12" viewBox="0 0 43 12">
                    <path d="M1,1 L1,11 L42,11 L42,1 L1,1 Z M43,0 L43,12 L0,12 L0,0 L43,0 Z"/>
                  </svg>
                </button>
              </div>
              <div
                className="btn-group"
                role="group">
                <button
                  className={`btn btn-default ${this.activeBorder('medium')}`}
                  type="button"
                  onClick={(ev)=>{
                    ev.preventDefault()
                    this.props.handleBorder("medium")}
                  }>
                  <svg className="link" xmlns="http://www.w3.org/2000/svg" width="43" height="12" viewBox="0 0 43 12">
                    <path d="M3.5,1 C2.11928813,1 1,2.11928813 1,3.5 L1,8.5 C1,9.88071187 2.11928813,11 3.5,11 L39.5,11 C40.8807119,11 42,9.88071187 42,8.5 L42,3.5 C42,2.11928813 40.8807119,1 39.5,1 L3.5,1 Z M3.5,0 L39.5,0 C41.4329966,0 43,1.56700338 43,3.5 L43,8.5 C43,10.4329966 41.4329966,12 39.5,12 L3.5,12 C1.56700338,12 0,10.4329966 0,8.5 L0,3.5 C0,1.56700338 1.56700338,0 3.5,0 Z"/>
                  </svg>
                </button>
              </div>
              <div
                className="btn-group"
                role="group">

                <button
                  className={`btn btn-default ${this.activeBorder('large')}`}
                  type="button"
                  onClick={(ev)=>{
                    ev.preventDefault()
                    this.props.handleBorder("large")}
                  }>
                  <svg className="link" xmlns="http://www.w3.org/2000/svg" width="43" height="12" viewBox="0 0 43 12">
                    <path d="M6,1 C3.23857625,1 1,3.23857625 1,6 C1,8.76142375 3.23857625,11 6,11 L37,11 C39.7614237,11 42,8.76142375 42,6 C42,3.23857625 39.7614237,1 37,1 L6,1 Z M6,0 L37,0 C40.3137085,0 43,2.6862915 43,6 C43,9.3137085 40.3137085,12 37,12 L6,12 C2.6862915,12 0,9.3137085 0,6 C0,2.6862915 2.6862915,0 6,0 Z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div
              aria-label="..."
              className="btn-group btn-group-justified"
              id="button-fill"
              role="group">
              <div
                className="btn-group"
                role="group">
                <button
                  className={`btn btn-default ${this.activeFill('fill')}`}
                  type="button"
                  onClick={(ev)=>{ev.preventDefault(); this.props.handleFill("fill")}}>
                  <svg className="link" xmlns="http://www.w3.org/2000/svg" width="79" height="12" viewBox="0 0 79 12">
                    <rect width="79" height="12" rx="2"/>
                  </svg>
                </button>
              </div>
              <div
                className="btn-group"
                role="group">
                <button
                  className={`btn btn-default ${this.activeFill('stroke')}`}
                  type="button"
                  onClick={(ev)=>{ev.preventDefault(); this.props.handleFill("stroke")}}>
                  <svg className="link" xmlns="http://www.w3.org/2000/svg" width="79" height="12" viewBox="0 0 79 12">
                    <path d="M2.5,1 C1.67157288,1 1,1.67157288 1,2.5 L1,9.5 C1,10.3284271 1.67157288,11 2.5,11 L76.5,11 C77.3284271,11 78,10.3284271 78,9.5 L78,2.5 C78,1.67157288 77.3284271,1 76.5,1 L2.5,1 Z M2.5,0 L76.5,0 C77.8807119,-2.77555756e-16 79,1.11928813 79,2.5 L79,9.5 C79,10.8807119 77.8807119,12 76.5,12 L2.5,12 C1.11928813,12 1.38777878e-16,10.8807119 0,9.5 L0,2.5 C-1.38777878e-16,1.11928813 1.11928813,2.77555756e-16 2.5,0 Z"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="input-group text-style">
              <div className="input-group-btn">
                <div className="btn-group">
                  <button
                    aria-expanded="true"
                    aria-haspopup="true"
                    className="btn dropdown-toggle"
                    data-toggle="dropdown"
                    id="button-font-color"
                    type="button">
                    <span
                      className="color-select"
                      style={{
                        background: this.props.buttonStyle.color
                      }}
                    />
                  </button>
                  <ul
                    aria-labelledby="button-font-color"
                    className="dropdown-menu color-picker">
                    <li>
                      <SketchPicker
                        color={ this.props.buttonStyle.color }
                        presetColors={[]}
                        onChangeComplete={(color, ev)=>{
                          this.props.setButtonStyle({color: color.hex})}
                        }
                      />
                    </li>
                  </ul>
                </div>
                <div className="btn-group">
                  <button
                    aria-expanded="true"
                    aria-haspopup="true"
                    className="btn dropdown-toggle"
                    data-toggle="dropdown"
                    id="button-font-size"
                    type="button">
                      {this.props.buttonStyle.fontSize}
                    <span className="caret" />
                  </button>
                  <ul
                    aria-labelledby="button-font-size"
                    className="dropdown-menu">
                    {
                      this.state.fontSizes.map((o,i)=>{
                        return (
                          <li key={`font-size-${i}`}>
                            <a href="#" onClick={(ev)=>{
                                ev.preventDefault()
                                this.props.setButtonStyle({fontSize: o})
                              }
                            }>
                              {o}
                            </a>
                          </li>
                        )
                      })
                    }
                  </ul>
                </div>
              </div>
              <div className="dropdown font-select" style={{float: "none"}}>
                <button
                  aria-expanded="true"
                  aria-haspopup="true"
                  className="btn dropdown-toggle"
                  data-toggle="dropdown"
                  id="dropdownMenu1"
                  type="button">
                  <span className="selected">
                    {this.props.buttonStyle.fontFamily}
                  </span>
                  <span className="caret" />
                </button>
                <ul
                  aria-labelledby="dropdownMenu1"
                  className="dropdown-menu">
                  {
                    this.state.fontsFamilies.map((o,i)=>{
                      return (
                        <li key={`font-family-${i}`}>
                          <a href="#" onClick={(ev)=>{
                              ev.preventDefault()
                              this.props.setButtonStyle({fontFamily: o})
                            }
                          }>
                            {o}
                          </a>
                        </li>
                      )
                    })
                  }
                </ul>
              </div>
            </div>
            <div className="input-group text-style">
              <div className="input-group-btn">
                <div className="btn-group">
                  <button
                    aria-expanded="true"
                    aria-haspopup="true"
                    className="btn dropdown-toggle"
                    data-toggle="dropdown"
                    id="button-font-color"
                    type="button">
                    <span
                      className="color-select"
                      style={{
                        background: this.props.buttonStyle.backgroundColor
                      }}
                    />
                  </button>
                  <ul
                    aria-labelledby="button-font-color"
                    className="dropdown-menu color-picker">
                    <li>
                      <SketchPicker
                        color={ this.props.buttonStyle.backgroundColor }
                        onChangeComplete={(color, ev)=>{
                          this.props.setButtonStyle({backgroundColor: color.hex})}
                        }
                      />
                    </li>
                  </ul>
                </div>
              </div>
              <input
                aria-label="..."
                className="form-control"
                type="text"
                value={this.props.buttonStyle.backgroundColor}
                onChange={(ev)=>{
                          this.props.setButtonStyle({backgroundColor: ev.currentTarget.value})}
                        }
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}