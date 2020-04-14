import React from 'react'

export default function Badge ({ children }) {
  return (
    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium leading-5 bg-red-100 text-red-800">
      {children}
    </span>
  )
}
