import React from 'react'

export default function Avatar ({ src, indicator, size }) {
  function sizeClassName (size) {
    switch (size) {
      case 'small':
        return 'h-6 w-6'
      case 'medium':
        return 'h-8 w-8'
      case 'large':
        return 'h-10 w-10'
      default:
        return 'h-6 w-6'
    }
  }

  return (
    <span className="inline-block relative">
      <img
        className={`${sizeClassName(size)} rounded-full`}
        src={src}
        alt={src}
      />

      {
        indicator &&
        <span
          className="absolute top-0 right-0
          block h-3 w-3 transform
          -translate-y-1/2 -translate-x-1/4 rounded-full
          text-white shadow-solid bg-green-400 border-white border-2">
        </span>
      }
    </span>
  )
}
