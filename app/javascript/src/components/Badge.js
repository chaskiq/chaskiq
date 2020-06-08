import React from 'react'

// alert, info, success

export default function Badge ({ variant, children, className }) {
  function variantColor () {
    if (!variant) return 'gray'
    return variant
  }

  return (
    <span className={`${className || ''} inline-flex items-center 
      px-3 py-0.5 rounded-full 
      text-sm font-medium leading-5
      bg-${variantColor()}-300 text-${variantColor()}-800
    `}>
      {children}
    </span>
  )
}
