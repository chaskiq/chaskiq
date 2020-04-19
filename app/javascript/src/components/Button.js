// src/components/button.js
import React from 'react'
import tw from 'tailwind.macro'
import styled from '@emotion/styled'

// https://nystudio107.com/blog/using-tailwind-css-with-gatsby-react-emotion-styled-components


const BaseButton = styled.button`

  ${(props) => {
    switch (props.variant) {
      case 'small':
        return tw`outline-none px-2 py-1 rounded-lg bg-green-400 text-green-800 text-xl font-light uppercase shadow-md hover:shadow-lg`
      case 'main':
        return tw`outline-none inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:shadow-outline-indigo focus:border-indigo-700 active:bg-indigo-700`
      case 'clean':
        return ''
      case 'outlined':
        return tw`outline-none
        inline-flex 
        items-center 
        px-4 py-2 
        border 
        text-sm 
        leading-5 font-medium 
        border-color-gray-500
        rounded-md text-gray-500
        focus:outline-none 
        border-1
        focus:shadow-outline-indigo 
        focus:border-indigo-700 
        active:bg-indigo-700`
      case 'icon':
        return tw`outline-none rounded-full p-1 bg-gray-10 hover:bg-gray-200`
      case 'danger':
        return tw`outline-none px-2 py-1 rounded-lg bg-red-400 text-red-800 text-xl font-light uppercase shadow-md hover:shadow-lg`
      default:
        return tw`uppercase outline-none inline-flex items-center 
        px-4 py-2 border border-transparent text-sm 
        leading-5 font-medium rounded-md text-white 
        bg-indigo-600 hover:bg-indigo-500 focus:outline-none 
        focus:border-indigo-700 focus:shadow-outline-indigo 
        active:bg-indigo-700`
    }
  }};
`

export default function Button ({ children, ...buttonProps }) {
  return (
    <BaseButton
      className={'transition duration-150 ease-in-out'}
      // className="px-2 py-1 rounded-lg bg-green-400 text-green-800 text-xl font-light uppercase shadow-md hover:shadow-lg"
      {...buttonProps}
    >
      {children}
    </BaseButton>
  )
}

export function ButtonIndigo ({ children, ...buttonProps }) {
  return <BaseButton {...buttonProps}>{children}</BaseButton>
}

export function DropdownButton ({ onClick, label, icon }) {
  return (
    <span className="relative z-0 inline-flex shadow-sm">
      <button
        onClick={onClick}
        type="button"
        className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150"
      >
        {icon && icon} {label}
      </button>

      <span className="-ml-px relative block">
        <button
          onClick={onClick}
          type="button"
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm leading-5 font-medium text-gray-500 hover:text-gray-400 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-500 transition ease-in-out duration-150"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </span>
    </span>
  )
}
