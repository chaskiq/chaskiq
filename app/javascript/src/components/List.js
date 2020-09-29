import React from 'react'

export default function List ({ children, shadowless }) {
  return (
    <div
      className={`
      bg-white 
      ${shadowless ? '' : 'shadow'} 
      overflow-hidden sm:rounded-md`}
    >
      <ul>{children}</ul>
    </div>
  )
}

export function ListItem ({ avatar, action, children, onClick, divider }) {

  const clicableClasses = onClick && 'cursor-pointer'
  return (
    <li className={`${divider ? 'border-b' : ''}`}>
      <div
        onClick={onClick && onClick}
        className={`${clicableClasses} block
        hover:bg-gray-100
        focus:outline-none focus:bg-gray-200 transition duration-150
        ease-in-out`}
      >
        <div className="flex items-center px-4 py-4 sm:px-6">
          <div className="min-w-0 flex-1 flex items-center">
            {avatar && avatar}

            {children}
          </div>

          {action && (
            <div>
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

export function ListItemText ({ primary, secondary, terciary }) {
  return (
    <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
      <div>
        {primary && primary}

        {secondary && secondary}
      </div>

      <div className="hidden md:block">
        <div>
          {terciary && terciary}
        </div>
      </div>
    </div>
  )
}

export function ItemAvatar ({ avatar }) {
  return (
    <div className="flex-shrink-0">
      <img className="h-12 w-12 rounded-full" src={avatar} alt="" />
    </div>
  )
}

export function ItemListPrimaryContent ({ children }) {
  return (
    <div className="text-lg leading-5 font-medium text-indigo-600 truncate">
      {children}
    </div>
  )
}

export function ItemListSecondaryContent ({ children }) {
  return (
    <div className="mt-2 flex items-center text-sm leading-5 text-gray-500">
      {/* <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884zM18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" clipRule="evenodd"></path>
      </svg> */}
      <span className="truncate">{children}</span>
    </div>
  )
}
