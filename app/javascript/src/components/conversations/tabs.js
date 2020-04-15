import React from 'react'

function TabContainer (props) {
  return <p component="div">{props.children}</p>
}

export default function SimpleTabs ({ tabs }) {
  const [value, setValue] = React.useState(0)

  function handleChange (event, newValue) {
    setValue(newValue)
  }

  return (
    <div className="w-full">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          {tabs.map((o, i) => (
            <a
              href="#"
              onClick={() => setValue(i)}
              key={'conversation-tab' + o.label}
              className="whitespace-no-wrap py-2 px-1 border-b-2 border-transparent font-medium text-sm leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300"
            >
              {o.label}
            </a>
          ))}
        </nav>
      </div>

      {<div>{tabs[value].content}</div>}
    </div>
  )
}
