import React, { useEffect } from 'react'
import useOnClickOutside from './hooks/useClickOutside'

export default function Dropdown ({
  children,
  labelButton,
  triggerButton,
  isOpen,
  position,
  origin,
  onOpen
}) {
  const [open, setOpen] = React.useState(isOpen)

  const ref = React.useRef()

  useOnClickOutside(ref, () => setOpen(false))

  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  useEffect(() => {
    onOpen && onOpen(open)
  }, [open])

  return (
    <React.Fragment>
      <div
        ref={ref}
        className={'relative inline-block text-left'}
      >

        <div>
          {triggerButton ? (
            triggerButton(() => setOpen(!open))
          ) : (
            <span className="rounded-md shadow-sm">
              <button
                onClick={() => setOpen(!open)}
                className="inline-flex justify-center w-full
                 rounded-md border border-gray-300 px-4 py-2
                 bg-white text-sm leading-5 font-medium text-gray-700
                 hover:text-gray-500 focus:outline-none
                 focus:border-blue-300 focus:shadow-outline-blue
                 active:bg-gray-50 active:text-gray-800
                 transition ease-in-out duration-150"
              >
                {labelButton}
                <svg
                  className="-mr-1 ml-2 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          )}
        </div>

        {open && (
          <div
            className={`z-50 origin-top-right absolute 
            ${position || 'left'}-0
            ${origin || ''}
             mt-2 w-56 rounded-md shadow-lg`}
          >
            <div className="rounded-md bg-white shadow-xs">{children}</div>
          </div>
        )}
      </div>
    </React.Fragment>
  )
}
