import { Controller } from '@hotwired/stimulus';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HexColorPicker, HexColorInput } from 'react-colorful';

export default class extends Controller {
  static targets = ['input'];

  initialize() {
    const wrapper = this.element;
    const selectWrapper = wrapper.querySelector('.color-wrapper');

    const root = createRoot(selectWrapper);

    root.render(
      <div>
        <ColorPicker
          colorHandler={this.colorHandler.bind(this)}
          color={`#${this.inputTarget.value}`}
          variant={'circle'}
        />
      </div>
    );
  }

  colorHandler(e) {
    this.inputTarget.value = e;

    this.resolveSrc();
  }

  resolveSrc() {
    const selectElement = document.querySelector('.avatar-select');
    const kind = selectElement.value;
    const resolvedPalette = this.resolvePalette();
    const url = `https://source.boringavatars.com/${kind}/128/1234?colors=${resolvedPalette}`;
    const avatar = document.querySelector('.avatar-component');
    avatar.style.backgroundImage = `url(${url})`;
  }

  resolvePalette() {
    let values = Array.from(
      document.querySelectorAll('input[data-color-picker-target]')
    )
      .map((input) => input.value.replace('#', ''))
      .join(',');
    return values;
  }

  connect() {}

  disconnect() {}
}

export function ColorPicker(props) {
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

  const popover = {
    position: 'absolute',
    zIndex: 2,
  };
  const cover = {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  };

  return (
    <React.Fragment>
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
              className="dark:text-gray-100 dark:bg-gray-900 form-input h-full block w-full rounded-none rounded-l-md pl-10 transition ease-in-out duration-150 sm:text-sm sm:leading-5 border border-gray-300 dark:border-gray-900"
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
              dark:border-gray-900
              dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-900
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
    </React.Fragment>
  );
}
