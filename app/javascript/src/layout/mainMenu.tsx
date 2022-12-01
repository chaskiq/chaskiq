import React from 'react'
import { Link } from 'react-router-dom';
import Tooltip from "rc-tooltip";
import LayoutDefinitions from './layoutDefinitions'
export function InnerMenu({current_section, categories}) {
  return categories
    .filter((o) => o.id === current_section)
    .map(({ id, label, children }) => {
      //  expanded={expanded === id}
      return (
        <div
          key={`sidebar-section-${id}`}
          className="h-0-- flex-1 flex flex-col pt-5 pb-4 overflow-y-auto"
        >
          <div
            className="flex items-center flex-shrink-0 px-4
            text-lg leading-6 font-bold text-gray-900 dark:text-gray-100"
          >
            <h3 className="font-bold w-full">{label}</h3>
          </div>
          <nav className="mt-5 flex-1 px-4 space-y-2">
            {children
              .filter((o) => !o.hidden)
              .filter((o) => o.allowed)
              .map(
                ({
                  id: childId,
                  label,
                  icon,
                  active,
                  url,
                  _onClick,
                  render,
                  allowed,
                }) =>
                  !render ? (
                    <Link
                      key={`sidebar-section-child-${id}-${childId}`}
                      to={url}
                      aria-label={label}
                      disabled={!allowed}
                      className={`
                      ${active ? 'bg-gray-200 dark:bg-black' : ''} 
                      ${!allowed ? 'bg-gray-100 dark:bg-gray-100' : ''} 
                      bg-white hover:text-gray-600 hover:bg-gray-100 
                      dark:hover:text-gray-300 dark:hover:bg-black
                      dark:bg-black dark:text-gray-100 dark:focus:bg-black
                      focus:outline-none focus:bg-gray-200
                      group flex items-center 
                      px-2 py-2 
                      text-sm leading-5 font-medium text-gray-900 
                      rounded-md transition ease-in-out duration-150`}
                    >
                      <div className="text-lg mr-3 h-6 w-6 dark:text-gray-100 text-gray-500 group-hover:text-gray-500 group-focus:text-gray-600 transition ease-in-out duration-150">
                        {icon}
                      </div>
                      {label || childId}
                    </Link>
                  ) : (
                    render()
                  )
              )}
          </nav>
        </div>
      );
    });
}

export function MainMenu({current_section, categories, app, itemClass}) {
  const c = categories || LayoutDefinitions().categories(app)
  return c
    .filter((o) => o.allowed)
    .map((o) => (
      <Tooltip
        key={`sidebar-categories-${o.id}`}
        placement="right"
        overlay={o.label}
        defaultVisible={false}
        visible={false}
      >
        {o.url && (
          <Link
            to={`${o.url}`}
            aria-label={o.label}
            className={itemClass || 
              `text-gray-700 dark:text-white
                rounded-md flex 
                justify-center 
                cursor-pointer bg-gray-50 dark:bg-black
                hover:bg-gray-100 dark:hover:bg-gray-800 
                h-10 w-full 
                items-center 
                text-2xl font-semibold 
                my-5 overflow-hidden`
              }
          >
            <div className="flex items-center space-x-2">
              <span>{o.icon}</span>
              <span>{o.label}</span>
            </div>
          </Link>
        )}
      </Tooltip>
    ))
}

export function MainMenuHorizontal({current_section, categories, app}) {
  const c = categories || LayoutDefinitions().categories(app)
  return c
    .filter((o) => o.allowed)
    .map((o) => (
      o.url && (
        <Link
          to={`${o.url}`}
          aria-label={o.label}
          className="inline-flex items-center border-b-2 border-indigo-500 px-1 pt-1 text-sm font-medium text-gray-900">
          {o.icon}
        </Link>
      )
    ))
}