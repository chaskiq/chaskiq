import React from 'react'

export default function EmptyView ({ title, subtitle, icon, image, shadowless, h2Classes }) {
  function h2Styles () {
    return h2Classes || `text-2xl tracking-tight
        font-extrabold text-gray-900 sm:text-3xl
        sm:leading-none md:text-4xl`
  }

  return (
    <div
      className={`bg-white overflow-hidden ${
        shadowless ? '' : 'shadow'
      } rounded-lg py-5 h-full`}
    >
      <div className="flex flex-col px-4 py-5 sm:p-6 items-center">
        {icon && icon}

        <h2 className={h2Styles()}>
          {title}
        </h2>

        {subtitle && (
          <div className="py-4 mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
            {subtitle}
          </div>
        )}
        {image && image}
      </div>
    </div>
  )
}
