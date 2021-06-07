import React from 'react'

// alert, info, success

export default function Badge ({ variant, children, className, size }) {
  function variantColor () {
    if (!variant) return 'gray'
    return variant
  }

  function sizeClasses () {
    switch (size) {
      case 'sm':
        return 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
      default:
        return 'inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium leading-5'
    }
  }


  return (
    <span className={`${className || ''} inline-flex items-center 
      ${sizeClasses()}
      bg-${variantColor()}-300 text-${variantColor()}-800
    `}>
      {children}
    </span>
  )
}
