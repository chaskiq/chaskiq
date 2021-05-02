import React from 'react'
import { HexColorPicker, HexColorInput } from "react-colorful";

import Button from '../Button'
import { DockerIcon, PaintIcon } from '../icons'
export class ColorPicker extends React.Component {
  state = {
    displayColorPicker: false,
    value: this.props.color
  };

  handleClick = (e) => {
    e.preventDefault()
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
  };

  handleColorChangeComplete = (color) => {
    this.setState({ value: color }, () => {
      this.props.colorHandler && this.props.colorHandler(color)
    })
    //,
    //  ()=> this.props.onChangeComplete(color.hex))
  };

  render () {
    const popover = {
      position: 'absolute',
      zIndex: '2'
    }
    const cover = {
      position: 'fixed',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px'
    }
    return (
      <React.Fragment>
        <div className="mt-1 flex rounded-md shadow-sm">
          <div className="relative flex-grow focus-within:z-10">
            <Button
              variant="clean"
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              aria-label="Toggle color"
              onClick={this.handleClick}
            >
              <DockerIcon style={{ color: this.state.value || '#ccc' }} />
            </Button>

            <HexColorInput 
              className="form-input h-full block w-full rounded-none rounded-l-md pl-10 transition ease-in-out duration-150 sm:text-sm sm:leading-5 border border-gray-300"
              color={this.state.value}
              name={this.props.name}
              placeholder="#00ff00"
              onChange={this.handleColorChangeComplete}>
            </HexColorInput>
          </div>

          <button
            onClick={this.handleClick}
            className="-ml-px relative inline-flex items-center
            px-4 py-2 border border-gray-300 text-sm
            leading-5 font-medium rounded-r-md text-gray-700
            bg-gray-50 hover:text-gray-500 hover:bg-white
            focus:outline-none focus:shadow-outline-blue
            focus:border-blue-300 active:bg-gray-100
            active:text-gray-700 transition ease-in-out
            duration-150"
          >
            <PaintIcon />
            <span className="ml-2 text-xs">Choose color</span>
          </button>
        </div>

        {this.state.displayColorPicker ? (
          <div style={popover}>
            <div style={cover} onClick={this.handleClose} />
            <HexColorPicker 
              color={this.state.value} 
              onChange={this.handleColorChangeComplete} 
            />;
          </div>
        ) : null}
      </React.Fragment>
    )
  }
}
