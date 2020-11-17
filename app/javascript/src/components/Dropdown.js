import React, { useEffect } from 'react'
import useOnClickOutside from './hooks/useClickOutside'
import Button from './Button'

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

        <div className="flex">
          {triggerButton ? (
            triggerButton(() => setOpen(!open))
          ) : (
            <span className="rounded-md shadow-sm">
              <Button
                variant="outlined"
                onClick={() => setOpen(!open)}>
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
              </Button>
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
