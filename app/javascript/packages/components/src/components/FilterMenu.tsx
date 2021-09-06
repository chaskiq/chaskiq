import React from 'react';
import Dropdown from './Dropdown';
import { CheckmarkIcon } from './icons';

type FilterMenuProps = {
  filterHandler: (option: any, clickHandler: any) => void;
  value: string;
  triggerButton?: any;
  options: any;
  position?: 'left' | 'right';
  origin?: string;
};

export default function FilterMenu({
  filterHandler,
  value,
  triggerButton,
  options,
  position,
  origin,
}: FilterMenuProps) {
  const [open, setOpen] = React.useState(false);

  function selectOption(option) {
    filterHandler(option, handleClose);
  }

  function handleClose(): void {
    setOpen(false);
  }

  return (
    <React.Fragment>
      <Dropdown
        labelButton={value}
        triggerButton={triggerButton}
        position={position}
        origin={origin}
        isOpen={open}
      >
        {options.map((option) => (
          <div className="py-1" key={`filter-menu-${option.id}`}>
            <button
              onClick={() => selectOption(option)}
              className={`w-full group flex items-center
              px-4 py-2 text-sm leading-5 text-gray-700
              ${
                value === option.name
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 '
                  : ''
              }
              hover:bg-gray-100 hover:text-gray-900
              focus:outline-none focus:bg-gray-100
              focus:text-gray-900
              dark:hover:bg-gray-700 dark:hover:text-gray-100
              dark:focus:bg-gray-800
              `}
            >
              {option.state === 'checked' && (
                <div className="text-sm text-green-500">
                  <CheckmarkIcon></CheckmarkIcon>
                </div>
              )}

              {option.icon && <i>{option.icon}</i>}

              <div className="flex flex-col justify-between ml-2">
                <span className="font-bold self-start dark:text-gray-100">
                  {option.name || option.title}
                </span>

                {option.description && (
                  <span className="text-xs text-left dark:text-gray-300">
                    {option.description}
                  </span>
                )}
              </div>
            </button>
          </div>
        ))}
      </Dropdown>
    </React.Fragment>
  );
}
