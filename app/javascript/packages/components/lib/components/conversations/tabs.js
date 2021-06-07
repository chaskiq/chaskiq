import React from 'react'

export default function SimpleTabs ({ tabs, buttons }) {
  const [value, setValue] = React.useState(0)

  return (
    <div className="w-full">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          {tabs.map((o, i) => (
            <a
              href="#"
              onClick={() => setValue(i)}
              key={'conversation-tab' + o.label}
              className="whitespace-nowrap py-2 px-2 border-b-2 border-transparent font-medium text-sm leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300"
            >
              {o.label}
            </a>
          ))}

          {
            buttons && buttons()
          }

        </nav>
      </div>

      {<div>{tabs[value].content}</div>}
    </div>
  )
}
