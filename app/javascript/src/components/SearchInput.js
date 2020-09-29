import React from 'react'

import {
  SeachIcon
} from './icons'

export default function SearchInput ({onSubmit, placeholder}) {

  const [value, setValue] = React.useState(null)

  return <div className="my-4">

    <div className="mt-1 flex rounded-md shadow-sm">
      <div className="relative flex-grow focus-within:z-10">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SeachIcon/>
        </div>
        <input id="email"
          value={value}
          onChange={(e)=> { setValue(e.target.value)} }
          className="py-3 border border-r-none block w-full rounded-none rounded-l-md pl-10 transition ease-in-out duration-150 sm:text-sm sm:leading-5"
          placeholder={placeholder}
        />
      </div>

      <button onClick={()=> onSubmit(value)} 
        className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm leading-5 font-medium rounded-r-md text-gray-700 bg-gray-50 hover:text-gray-500 hover:bg-white focus:outline-none focus:shadow-outline-blue focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150">
        <span className="ml-2">{I18n.t('common.submit')}</span>
      </button>
    </div>
  </div>
}