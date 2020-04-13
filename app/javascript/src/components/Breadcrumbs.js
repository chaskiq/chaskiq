import React from 'react'
import {
  Link
} from 'react-router-dom'


export default function Breadcrumbs({breadcrumbs}){
  return (


    <nav className="hidden sm:flex items-center text-sm leading-5 font-medium">
            
      {
        breadcrumbs.map((o, i)=>(
          <React.Fragment>
          
            { o.to && <Link to={o.to} className="text-gray-600 hover:text-gray-700 focus:outline-none focus:underline transition duration-150 ease-in-out">
                {o.title}
              </Link>
            }

            {
              !o.to && <span className="text-gray-400">
                {o.title}
              </span>
            }
          
            {
              (breadcrumbs.length - 1) !== i &&
              <svg className="flex-shrink-0 mx-2 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
              </svg>
            }
            
          
          </React.Fragment>
        ))
      }
      
    </nav>

  )
}