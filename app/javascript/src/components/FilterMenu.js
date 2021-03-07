import React from 'react'
import Dropdown from './Dropdown'
import { CheckmarkIcon } from './icons'

const ITEM_HEIGHT = 48

export default function FilterMenu ({
  filterHandler,
  value,
  triggerButton,
  selectedOption,
  options,
  position,
  origin
}) {
  const [open, setOpen] = React.useState(false)

  function selectOption (option) {
    filterHandler(option, handleClose)
  }

  function handleClose () {
    setOpen(false)
  }

  return (
    <React.Fragment>
      <Dropdown
        id="long-menu"
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
              ${value === option.name ? 'bg-gray-100 text-gray-900' : ''}
              hover:bg-gray-100 hover:text-gray-900
              focus:outline-none focus:bg-gray-100
              focus:text-gray-900`}
            >
              {
                option.state === 'checked' &&
                <div className="text-sm text-green-500">
                  <CheckmarkIcon></CheckmarkIcon>
                </div>
              }

              {option.icon && <icon>{option.icon}</icon>}

              <div className="flex flex-col justify-between ml-2">
                <span className="font-bold self-start">
                  {option.name || option.title}
                </span>

                {option.description && (
                  <span className="text-xs text-left">
                    {option.description}
                  </span>
                )}
              </div>
            </button>
          </div>
        ))}
      </Dropdown>
    </React.Fragment>
  )
}
