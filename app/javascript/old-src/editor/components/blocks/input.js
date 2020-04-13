/*
 * Copyright (c) 2016, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import React, {Component} from "react";
//import classNames from "classnames";
//import icons from "../../icons";

export default class BlockInput extends Component {

  constructor(props) {
    super(props)
    this.state = {
      enabled: false,
      value: "sfsdd",
      edit: false
    }

  }

  handleChangeEv(ev, field){
    //ev.preventDefault()
    let data = {[field]: ev.currentTarget.value}
    console.log(`updating ${JSON.stringify(data)}`)
    this.props.handleOnChange(data)
  }

  render(){
    return (
      <p style={this.props.style} 
         onClick={(ev)=>{
            this.setState({edit: true}, ()=>{ 
              this.refs.input.focus()
          })
      }}>
          
        {
          this.state.edit
          ? <input
                className="form-control"
                placeholder={this.props.placeholder}
                type="text"
                ref="input"
                defaultValue={this.props.value}
                onBlur={(ev)=>{this.handleChangeEv(ev, this.props.name) ; this.setState({edit: false})}}
                //value={this.props.value}
                //onChange={(ev)=>{this.handleChangeEv(ev, this.props.name)}}
              />
          : <span> 
              {this.props.value} 
              <a href="#" onClick={(ev)=>{
                ev.preventDefault();
                this.setState({edit: true})}
              }> edit</a>
            </span>

        }
      </p>
    );
  }
}