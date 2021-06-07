import React from 'react'

export default function Panel ({ title, text, variant, link, classes }) {
  function variantClasses () {
    switch (variant) {
      case 'shadowless':
        return ''
      default:
        return 'shadow'
    }
  }

  return (
    <div className={` ${variantClasses()} ${classes || ''} sm:rounded-lg`}>
      <div className="px-4 py-5 sm:p-6">
        {
          title &&
            <h3 className="text-lg leading-6 font-medium">
              {title}
            </h3>
        }

        {text && (
          <div className="mt-2-- max-w-xl text-sm leading-5">
            <p>{text}</p>
          </div>
        )}

        {link && <div className="mt-3 text-sm leading-5">
          <a
            href={link.href}
            className="font-medium text-indigo-600 hover:text-indigo-500 transition ease-in-out duration-150"
          >
            {link.text} →
          </a>
        </div>}
      </div>
    </div>
  )
}
