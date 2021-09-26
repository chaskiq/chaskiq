import React from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';

import Button from '../Button';
import { DockerIcon, PaintIcon } from '../icons';

import I18n from '../../../../../src/shared/FakeI18n';
import ErrorBoundary from '../ErrorBoundary';

interface IColorPickerProps {
  color: string;
  name?: string;
  label: string;
  placeholder?: string;
  colorHandler: Function;
  defaultValue?: string;
  variant?: string;
  // label: 'Primary color';
  error?: string;
}
interface IColorPickerState {
  displayColorPicker: boolean;
  value: string;
}
export class ColorPicker extends React.Component<
  IColorPickerProps,
  IColorPickerState
> {
  state = {
    displayColorPicker: false,
    value: this.props.color || '555',
  };

  handleClick = (e) => {
    e.preventDefault();
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false });
  };

  handleColorChangeComplete = (color) => {
    this.setState({ value: color }, () => {
      this.props.colorHandler && this.props.colorHandler(color);
    });
    //,
    //  ()=> this.props.onChangeComplete(color.hex))
  };

  render() {
    const popover: React.CSSProperties = {
      position: 'absolute',
      zIndex: 2,
    };
    const cover: React.CSSProperties = {
      position: 'fixed',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
    };
    return (
      <ErrorBoundary>
        {this.props.variant == 'circle' && (
          <div>
            <div
              className="h-10 w-10 rounded-full"
              style={{ backgroundColor: this.state.value }}
              onClick={this.handleClick}
            >
              {this.state.displayColorPicker && (
                <div style={popover}>
                  <div style={cover} onClick={this.handleClose} />
                  <HexColorPicker
                    color={this.state.value}
                    onChange={this.handleColorChangeComplete}
                  />
                </div>
              )}
            </div>

            <HexColorInput
              className="hidden"
              color={this.state.value}
              name={this.props.name}
              placeholder="#00ff00"
              onChange={this.handleColorChangeComplete}
            />
          </div>
        )}

        {!this.props.variant && (
          <ErrorBoundary>
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
                  className="dark:text-gray-100 dark:bg-gray-900 form-input h-full block w-full rounded-none rounded-l-md pl-10 transition ease-in-out duration-150 sm:text-sm sm:leading-5 border border-gray-300"
                  color={this.state.value}
                  name={this.props.name}
                  placeholder="#00ff00"
                  onChange={this.handleColorChangeComplete}
                ></HexColorInput>
              </div>

              <button
                onClick={this.handleClick}
                className="-ml-px relative inline-flex items-center
                px-4 py-2 border border-gray-300 text-sm
                dark:bg-gray-900 dark:text-gray-100
                leading-5 font-medium rounded-r-md text-gray-700
                bg-gray-50 hover:text-gray-500 hover:bg-white
                focus:outline-none focus:shadow-outline-blue
                focus:border-blue-300 active:bg-gray-100
                active:text-gray-700 transition ease-in-out
                duration-150"
              >
                <PaintIcon />
                <span className="ml-2 text-xs">
                  {I18n.t('common.choose_color')}
                </span>
              </button>
            </div>

            {this.state.displayColorPicker && (
              <div style={popover}>
                <div style={cover} onClick={this.handleClose} />
                <HexColorPicker
                  color={this.state.value}
                  onChange={this.handleColorChangeComplete}
                />
              </div>
            )}
          </ErrorBoundary>
        )}
      </ErrorBoundary>
    );
  }
}
