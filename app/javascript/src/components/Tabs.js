import React from 'react'

// import tw from 'tailwind.macro'
import tw from 'twin.macro'
import styled from '@emotion/styled'

// https://nystudio107.com/blog/using-tailwind-css-with-gatsby-react-emotion-styled-components

const TabItem = styled.a`
  ${(props) => {
    if (props.active) {
      return tw`border-pink-500 text-gray-900 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`
    } else {
      return tw`border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`
    }
  }};
`

const Scrollable = styled.div`
  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
`

export default function SimpleTabs ({ tabs, currentTab, onChange }) {
  const [value, setValue] = React.useState(currentTab || 0)

  React.useEffect(() => {
    setValue(currentTab || 0)
  }, [currentTab])

  React.useEffect(() => {
    if (!onChange) return
    onChange(value)
  }, [value])

  return (
    <div className="w-full">
      <div className="border-b border-gray-200">
        <Scrollable className="overflow-auto">
          <nav className="-mb-px flex justify-start w-screen">
            {tabs.map((o, i) => (
              <TabItem
                onClick={() => setValue(i)}
                active={i === value}
                key={'tab' + o.label}
                className={`${i > 0 && 'ml-4 lg:ml-8'}`}
                href="#"
              >
                {o.icon && o.icon}
                <span>{o.label}</span>
              </TabItem>
            ))}
          </nav>
        </Scrollable>
      </div>

      {<div>{tabs[value] && tabs[value].content && tabs[value].content}</div>}
    </div>
  )
}
