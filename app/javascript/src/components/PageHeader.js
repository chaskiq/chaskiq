import React from 'react'
import { Link } from 'react-router-dom'

export default function PageHeader ({
  title,
  actionHandler,
  actionLabel,
  breadcrumbs,
  actions
}) {
  return (
    <div className="mb-5">
      <div>
        <nav className="sm:hidden">
          <a
            href="#"
            className="flex items-center text-sm leading-5 font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus:underline transition duration-150 ease-in-out"
          >
            <svg
              className="flex-shrink-0 -ml-1 mr-1 h-5 w-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </a>
        </nav>

        {breadcrumbs && (
          <nav className="hidden sm:flex items-center text-sm leading-5 font-medium">
            {breadcrumbs.map((o, i) => (
              <React.Fragment>
                {o.to && (
                  <Link
                    to={o.to}
                    className="text-gray-600 hover:text-gray-700 focus:outline-none focus:underline transition duration-150 ease-in-out"
                  >
                    {o.title}
                  </Link>
                )}

                {!o.to && <span className="text-gray-400">{o.title}</span>}

                {breadcrumbs.length - 1 !== i && (
                  <svg
                    className="flex-shrink-0 mx-2 h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>

      <div className="mt-2 md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:leading-9 sm:truncate">
            {title}
          </h2>
        </div>

        <div className="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4">
          {actions && actions}
        </div>
      </div>
    </div>
  )
}
