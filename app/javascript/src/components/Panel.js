import React from 'react'

export default function Panel ({ title, text, variant }) {
  function variantClasses () {
    switch (variant) {
      case 'shadowless':
        return ''
      default:
        return 'shadow'
    }
  }

  return (
    <div className={`bg-white ${variantClasses()} sm:rounded-lg`}>
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {title}
        </h3>

        {
          text &&
          <div className="mt-2 max-w-xl text-sm leading-5 text-gray-500">
            <p>
              {text}
            </p>
          </div>
        }

        <div className="mt-3 text-sm leading-5">
          <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 transition ease-in-out duration-150">
            Learn more about our CI features →
          </a>
        </div>
      </div>
    </div>
  )
}
