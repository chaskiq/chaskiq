import React from 'react'

export default function Card ({ title, children }) {
  return <div>
    {
      title && <p className="text-lg leading-6 font-medium text-gray-900 truncate">
        {title}
      </p>
    }
    <p>{children}</p>
  </div>
}
