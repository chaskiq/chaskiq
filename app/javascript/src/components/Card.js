import React from 'react'

export default function Card ({ title, description, imageSrc }) {
  return (
    <div className="rounded overflow-hidden shadow-lg bg-white">
      {imageSrc && (
        <img className="w-full" src={imageSrc} alt="Sunset in the mountains" />
      )}

      <div className="px-6 py-4">
        {title && <div className="font-bold text-xl mb-2">{title}</div>}
        {description && (
          <p className="text-gray-700 text-base">{description}</p>
        )}
      </div>
      {/* <div className="px-6 py-4">
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">#photography</span>
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">#travel</span>
        <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">#winter</span>
      </div> */}
    </div>
  )
}
