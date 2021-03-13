// src/components/button.js
import React from 'react'
// import tw from 'tailwind.macro'
import styled from '@emotion/styled'
import tw from 'twin.macro'
// https://nystudio107.com/blog/using-tailwind-css-with-gatsby-react-emotion-styled-components

const BaseButton = styled.button`
  ${(props) => {
    switch (props.variant) {
      case 'success':
        return tw`
        outline-none 
        rounded-md 
        bg-green-400 
        text-white
        hover:bg-green-500 
        focus:outline-none 
        focus:border-green-700 
        focus:shadow-outline
        `
      case 'flat':
        return tw`
        inline-flex 
        items-center 
        border 
        border-transparent 
        text-xs 
        font-medium 
        rounded 
        text-indigo-700 
        bg-indigo-100 
        hover:bg-indigo-200 
        focus:outline-none 
        `
      case 'flat-dark':
        return tw`
          flex
          items-center
          border 
          border-transparent 
          rounded 
          text-gray-100 
          bg-gray-900 
          hover:bg-gray-800 
          focus:outline-none 
          focus:border-gray-700 
          active:bg-gray-800 
          `
      case 'main':
        return tw`outline-none 
        inline-flex 
        items-center 
        border 
        border-transparent 
        rounded-md 
        text-white bg-indigo-600 
        hover:bg-indigo-500 
        focus:outline-none 
        focus:shadow-outline 
        focus:border-indigo-700 
        active:bg-indigo-700`
      case 'link':
        return tw`flex text-indigo-700 hover:text-indigo-900`
      case 'clean':
        return ''
      case 'outlined':
        return tw`
        flex 
        items-center
        inline-flex 
        justify-center 
        px-4 
        py-2 
        border 
        border-gray-300 
        shadow-sm 
        text-sm 
        font-medium 
        rounded-md text-gray-700 
        bg-white 
        hover:bg-gray-50 
        focus:outline-none 
        focus:ring-2 
        focus:ring-offset-2 
        focus:ring-pink-500
        `
      case 'icon':
        return tw`
        outline-none 
        rounded-full 
        p-1 
        bg-transparent
        hover:text-gray-400`
      case 'danger':
        return tw`outline-none 
        rounded 
        bg-red-400 
        text-white
        hover:bg-red-500 
        focus:outline-none 
        focus:border-red-700 
        focus:shadow-outline
        `
      default:
        return tw`
        flex 
        flex-wrap 
        items-center
        rounded
        border 
        border-transparent 
        text-indigo-700 
        bg-indigo-100 
        hover:bg-indigo-200
        focus:outline-none 
        focus:border-indigo-300 
        active:bg-indigo-200
        `
    }
  }};

  ${(props) => {
    switch (props.border) {
      case true:
        return tw`border`
      default:
        return ''
    }
    }
  }
`

const SizeButton = styled(BaseButton)`
  ${(props) => {
    switch (props.size) {
      case 'xs':
        return tw`
        px-2 py-1
        text-xs 
        font-medium 
      `
      case 'sm':
      case 'small':
        return tw`
        px-2.5 py-1.5 text-xs leading-4
      `
      case 'md':
      case 'medium':
        return tw`px-4 py-2 
        text-sm 
        leading-7 
        font-medium 
        uppercase 
        `
      case 'lg':
      case 'large':
        return tw`px-8 py-4 
        text-xl 
        font-light 
        uppercase`
      default:
        // const isIcon = props.variant === "icon" ? 'p-1' : 'px-2 py-1'
        if (props.variant === 'icon') {
          return tw`p-1`
        } else {
          return tw`
          px-2 py-1
          text-sm 
          font-medium 
          leading-7`
        }
    }
  }};
`

export default function Button ({ children, className, ...buttonProps }) {
  return (
    <SizeButton
      className={`transition duration-150 ease-in-out ${className || ''}`}
      // className="px-2 py-1 rounded-lg bg-green-400 text-green-800 text-xl font-light uppercase shadow-md hover:shadow-lg"
      {...buttonProps}
    >
      {children}
    </SizeButton>
  )
}

export function ButtonIndigo ({ children, ...buttonProps }) {
  return <SizeButton {...buttonProps}>
    {children}
  </SizeButton>
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
