
import React from 'react'
import { Popover } from 'react-bootstrap';
import {UpdateData} from "./commons.js"
import { SketchPicker } from 'react-color';
import { Editor, EditorBlock } from 'draft-js';


export default class UnsubscribeBlock extends React.Component {
  constructor(props) {
    super(props)
    let existing_data = this.props.block.getData().toJS()
    this.state = {
      enabled: false,
      link_name: "Unsuscribe",
      displayPopOver: false,
      data: this.props.blockProps.data.toJS(),
      buttonStyle: existing_data.buttonStyle || this.defaultStyle(),
      city: "Jackson Inc.",
      address: "Paupio 46, Vilnius",
      country: "Lithuania",
      notice: "You received this email because you signed up on our website or made purchase from us."

    }
    this.placeholderRender = this.placeholderRender.bind(this)
    this.hidePopover    = this.hidePopover.bind(this)
    this.setWrapperRef = this.setWrapperRef.bind(this)
    this.handleClickOutside = this.handleClickOutside.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.setButtonStyle = this.setButtonStyle.bind(this)
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
    if (this.wrapperRef && this.wrapperRef.refs.btn && !this.wrapperRef.refs.btn.contains(event.target) && !event.target.closest(".popover")) {
        this.hidePopover()
    }
  }

  updateData(){
    UpdateData(this)
  }

  handleChange(data, updateData=false){
    this.setState(data, ()=>{
      if(updateData){
        this.updateData()
      }
    })
  }

  popoverTop(){
    return (<Popover id="popover-positioned-top" title="Popover top">
              <ButtonControls
                link_name={this.state.link_name}
                handleChange={this.handleChange}
                setButtonStyle={this.setButtonStyle}
                buttonStyle={this.state.buttonStyle}
                hidePopover={this.hidePopover}
                ref={this.setWrapperRef}
              />
            </Popover>)
  }

  defaultStyle(){
    return {
      color: "#fff",
      backgroundColor: "#3498db",
      padding: "5px",
      display: "block",
      fontFamily: "Helvetica",
      fontSize: 13
     }
  }

  setButtonStyle(args){
   let a = Object.assign({}, this.state.buttonStyle, args);
    this.setState({buttonStyle: a}, this.updateData)
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
        console.log(this.props.block.getText().length)

    return (
      <div>
        <hr/>


        {this.placeholderRender()}

        <EditorBlock {...Object.assign({}, this.props, {
          "editable": true })
        } />
        {
          /*
            <a href="#" ref="btn"
              onMouseOver={this.props.blockProps.disableEditable}
              onMouseOut={this.props.blockProps.enableEditable}
              onClick={(ev)=>{
                ev.preventDefault();
                this.setState({displayPopOver: !this.state.displayPopOver
              })
            }}>
                {this.state.link_name}
            </a>

            <Overlay
              show={this.state.displayPopOver}
              onHide={() => this.setState({ displayPopOver: false })}
              placement="top"
              target={() => ReactDOM.findDOMNode(this.refs.btn)}>
              {this.popoverTop()}
            </Overlay>
          */
        }


      </div>
    )
  }
}


class ButtonControls extends React.Component {

  constructor(props) {
    super(props)
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

  handleChange(ev, field, updateData=false){
    //ev.preventDefault()
    let data = {[field]: ev.currentTarget.value}
    console.log(`updating ${JSON.stringify(data)}`)
    this.props.handleChange(data, updateData)
  }

  render(){
    return (
      <div
        key="0"
        id="button-edit">
        <a
          className="close-popup"
          href="#" onClick={(ev)=> {ev.preventDefault(); this.props.hidePopover()}}>
          <svg
            className="svgIcon-use"
            height="19"
            viewBox="0 0 19 19"
            width="19">
            <path
              d="M13.792 4.6l-4.29 4.29-4.29-4.29-.612.613 4.29 4.29-4.29 4.29.613.612 4.29-4.29 4.29 4.29.612-.613-4.29-4.29 4.29-4.29"
              fillRule="evenodd"/>
          </svg>
        </a>

        <div className="edit">
          <div className="content-elements">

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
                defaultValue={this.props.link_name}
                onChange={(ev)=>{
                  this.handleChange(ev, "link_name")}
                }
                onBlur={(ev)=>{
                  this.handleChange(ev, "link_name", true)}
                }
              />

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
                    ref="btn"
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
              <div className="dropdown font-select">
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

          </div>
        </div>
      </div>
    )
  }
}

