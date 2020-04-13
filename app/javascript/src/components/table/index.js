
import React from 'react'
import {isEmpty} from 'lodash'

export default function Table({
  data, 
  columns, 
  format,
  search,
  meta
}){


  const visibleColumns =()=>(
    columns.filter((o)=> !o.hidden)
  )

  const renderDefaultRow = (value)=>{
    return <td 
            className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
              {value}
            </td>
  }

  const handleFormat = (item)=>{
    console.log("ITEM", columns)
    return <tr>
            {visibleColumns().map((o)=>(
              o.render ? o.render(item) : 
              renderDefaultRow(item[o])
            ))}
          </tr>
  }

  return (
    <React.Fragment>
      <table className="min-w-full">
        <thead>
          <tr>

          {
            visibleColumns().map((o)=>(
              <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                {o.title}
              </th>
            ))
          }
            {/*<th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
        <th className="px-6 py-3 border-b border-gray-200 bg-gray-50"></th>*/}
          </tr>
        </thead>
        <tbody className="bg-white">

          {
            data && data.map((o)=>(
              handleFormat(o)
            ))
          }

        </tbody>
      </table>

      { meta && !isEmpty(meta) && 
        <Pagination meta={meta} search={search}/>
      }
    
      </React.Fragment>
  )

}

function Pagination({meta, search}){



  return (

    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
    <div className="flex-1 flex justify-between items-center">
      
      <button
        onClick={()=>search(meta.prev_page)}
        disabled={!meta.prev_page}
        className=" inline-flex items-center px-4 py-2 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150">
          Previous
      </button>

      <p className="text-sm leading-5 text-gray-700">
        Showing
        <span className="font-medium ml-1 mr-1">{meta.current_page }</span>
        to
        <span className="font-medium ml-1 mr-1">{meta.total_pages}</span>
        of
        <span className="font-medium ml-1 mr-1">{meta.total_count}</span>
        results
      </p>

      <button
        disabled={!meta.next_page}
        onClick={()=>search(meta.next_page)}
        className="ml-3  inline-flex items-center px-4 py-2 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150">
        Next
      </button>

    </div>

    {/*
    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>

        <p className="text-sm leading-5 text-gray-700">
          Showing
          <span className="font-medium">{meta.current_page }</span>
          to
          <span className="font-medium">{meta.total_pages}</span>
          of
          <span className="font-medium">{meta.total_count}</span>
          results
        </p>
      </div>

      <div>
      
        <span className="relative z-0 inline-flex shadow-sm">
          <button type="button" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm leading-5 font-medium text-gray-500 hover:text-gray-400 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-500 transition ease-in-out duration-150">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
            </svg>
          </button>
          <button type="button" className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150">
            1
          </button>
          <button type="button" className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150">
            2
          </button>
          <button type="button" className="hidden md:inline-flex -ml-px relative items-center px-4 py-2 border border-gray-300 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150">
            3
          </button>
          <span className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm leading-5 font-medium text-gray-700">
            ...
          </span>
          <button type="button" className="hidden md:inline-flex -ml-px relative items-center px-4 py-2 border border-gray-300 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150">
            8
          </button>
          <button type="button" className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150">
            9
          </button>
          <button type="button" className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm leading-5 font-medium text-gray-700 hover:text-gray-500 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150">
            10
          </button>
          <button type="button" className="-ml-px relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm leading-5 font-medium text-gray-500 hover:text-gray-400 focus:z-10 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-100 active:text-gray-500 transition ease-in-out duration-150">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
            </svg>
          </button>
        </span>
      </div>
    </div>
    */}

  </div>


  )

}

/*
<tr>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                </div>
                <div className="ml-4">
                  <div className="text-sm leading-5 font-medium text-gray-900">Bernard Lane</div>
                  <div className="text-sm leading-5 text-gray-500">bernardlane@example.com</div>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
              <div className="text-sm leading-5 text-gray-900">Director</div>
              <div className="text-sm leading-5 text-gray-500">Human Resources</div>
            </td>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                Active
              </span>
            </td>
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">
              Owner
            </td>
            <td className="px-6 py-4 whitespace-no-wrap text-right border-b border-gray-200 text-sm leading-5 font-medium">
              <a href="#" className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:underline">Edit</a>
            </td>
          </tr>
*/