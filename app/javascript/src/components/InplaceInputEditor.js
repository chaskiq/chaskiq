import React, { useRef, useState } from 'react'

export default function InplaceInputEditor ({defaultValue, update}){
  const [editing, setEditing] = useState(false)

  function handleUpdate(){
    update(inputRef.current.value)
    setEditing(false)
  }

  function handleEnter (e) {
    if (e.key === 'Enter') {
      update(inputRef.current.value)
      setEditing(false)
    }
  }

  let inputRef = useRef(null)
  return (
    <div className="flex">  
      {
        !editing && 
        <div className="flex items-center">
          {defaultValue}

          <button onClick={()=> setEditing(!editing)} type="button" 
            className="mx-3 h-8 w-8 bg-white rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <svg className="h-5 w-5" x-description="Heroicon name: solid/pencil" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
            </svg>
            <span className="sr-only">Edit</span>
          </button>

        </div>
      }  
      
      {
        editing &&
        <div className="mt-2- flex items-center justify-between">
          <p className="text-md text-gray-500 italic">
            <input 
              defaultValue={defaultValue}
              onKeyDown={handleEnter}
              ref={inputRef}
              className="border-dashed border-b-2 border-gray-400 
              w-full py-2-- px-3-- text-gray-700
              focus:outline-none focus:border-gray-600"
            />
          </p>

          <button onClick={handleUpdate} type="button" 
            className="mx-3 h-8 w-8 bg-white rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            <span className="sr-only">Edit</span>
          </button>
        </div>
      }
    </div>
  )
}