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

export function ColorPicker(props: IColorPickerProps) {
  const [displayColorPicker, setDisplayColorPicker] = React.useState(false);
  const [value, setValue] = React.useState(
    props.color || props.defaultValue || '#444'
  );

  function handleClick(e) {
    e.preventDefault();
    setDisplayColorPicker(!displayColorPicker);
  }

  function handleClose() {
    setDisplayColorPicker(false);
  }

  function handleColorChangeComplete(color) {
    setValue(color);
  }

  React.useEffect(() => {
    props.colorHandler && props.colorHandler(value);
  }, [value]);

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
      {props.variant == 'circle' && (
        <div
          className="h-10 w-10 rounded-full"
          style={{ backgroundColor: value }}
          onClick={handleClick}
        ></div>
      )}

      {!props.variant && (
        <div className="mt-1 flex rounded-md shadow-sm">
          <div className="relative flex-grow focus-within:z-10">
            <Button
              variant="clean"
              className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              aria-label="Toggle color"
              onClick={handleClick}
            >
              <DockerIcon style={{ color: value || '#ccc' }} />
            </Button>

            <HexColorInput
              className="dark:text-gray-100 dark:bg-gray-900 form-input h-full block w-full rounded-none rounded-l-md pl-10 transition ease-in-out duration-150 sm:text-sm sm:leading-5 border border-gray-300"
              color={value}
              name={props.name}
              placeholder="#00ff00"
              onChange={handleColorChangeComplete}
            ></HexColorInput>
          </div>

          <button
            onClick={handleClick}
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
      )}

      {displayColorPicker && (
        <div style={popover}>
          <div style={cover} onClick={handleClose} />
          <HexColorPicker color={value} onChange={handleColorChangeComplete} />
        </div>
      )}
    </ErrorBoundary>
  );
}
