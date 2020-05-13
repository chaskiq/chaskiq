import React from 'react'

function FormDialog (props) {
  const [open, setOpen] = React.useState(props.open)

  function handleClickOpen () {
    setOpen(true)
  }

  function handleClose () {
    setOpen(false)
    props.handleClose && props.handleClose()
  }

  React.useEffect(() => setOpen(props.open), [props.open])

  return props.open ? (
    <Backdrop>
      <div
        open={props.open}
        // onClose={handleClose}
        // x-show="open"
        // x-transition:enter="ease-out duration-300"
        // x-transition:enter-start="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        // x-transition:enter-end="opacity-100 translate-y-0 sm:scale-100"
        // x-transition:leave="ease-in duration-200"
        // x-transition:leave-start="opacity-100 translate-y-0 sm:scale-100"
        // x-transition:leave-end="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        className="relative bg-white rounded-lg px-4 pt-5 pb-4 overflow-hidden--- shadow-xl transform transition-all sm:max-w-lg sm:w-full sm:p-6"
      >
        <div className="absolute top-0 right-0 pt-4 pr-4">
          <button
            onClick={handleClose}
            type="button"
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
          >
            <svg
              className="h-6 w-6"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div className="sm:flex--dis sm:items-start">
          {/* <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-red-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div> */}

          <div className="mt-3 sm:mt-0 text-left">
            {props.titleContent && (
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {props.titleContent}
              </h3>
            )}

            <div className="mt-2">{props.formComponent}</div>
          </div>
        </div>

        <div className="mt-5 sm:mt-4 flex flex-row-reverse">
          {props.dialogButtons}
        </div>
      </div>
    </Backdrop>
  ) : null
}

function Backdrop ({ children }) {
  return (
    <div className="z-50 fixed bottom-0 inset-x-0 px-4 pb-6 sm:inset-0 sm:p-0 sm:flex sm:items-center sm:justify-center">
      <div
        // x-show="open"
        // x-transition:enter="ease-out duration-300"
        // x-transition:enter-start="opacity-0"
        // x-transition:enter-end="opacity-100"
        // x-transition:leave="ease-in duration-200"
        // x-transition:leave-start="opacity-100"
        // x-transition:leave-end="opacity-0"
        className="fixed inset-0 transition-opacity"
      >
        <div className="absolute inset-0 bg-gray-500 opacity-75" />
      </div>

      {children}
    </div>
  )
}

/*
export function AlertModal({title, message, action, onClick}){

  return (

    <div
      //x-show="open"
      //x-transition:enter="ease-out duration-300"
      //x-transition:enter-start="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      //x-transition:enter-end="opacity-100 translate-y-0 sm:scale-100"
      //x-transition:leave="ease-in duration-200"
      //x-transition:leave-start="opacity-100 translate-y-0 sm:scale-100"
      //x-transition:leave-end="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      className="relative bg-white rounded-lg px-4 pt-5 pb-4 overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full sm:p-6">
      <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
        <button type="button" className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150">
          <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <svg className="h-6 w-6 text-red-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {title}
          </h3>
          <div className="mt-2">
            <p className="text-sm leading-5 text-gray-500">
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">

        <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
          <button
            type="button"
            onClick={onClick}
            className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-red-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-red-500 focus:outline-none focus:border-red-700 focus:shadow-outline-red transition ease-in-out duration-150 sm:text-sm sm:leading-5">
            {action}
          </button>
        </span>

        <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline transition ease-in-out duration-150 sm:text-sm sm:leading-5">
            Cancel
          </button>
        </span>
    </div>
  </div>

  )
}

export function MessageModal({}){
  return (

    <div x-show="open"
        x-transition:enter="ease-out duration-300"
        x-transition:enter-start="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        x-transition:enter-end="opacity-100 translate-y-0 sm:scale-100"
        x-transition:leave="ease-in duration-200"
        x-transition:leave-start="opacity-100 translate-y-0 sm:scale-100"
        x-transition:leave-end="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        className="bg-white rounded-lg px-4 pt-5 pb-4 overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full sm:p-6">
      <div>
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Payment successful
          </h3>
          <div className="mt-2">
            <p className="text-sm leading-5 text-gray-500">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius aliquam laudantium explicabo pariatur iste dolorem animi vitae error totam. At sapiente aliquam accusamus facere veritatis.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
        <span className="flex w-full rounded-md shadow-sm sm:col-start-2">
          <button type="button" className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-indigo-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo transition ease-in-out duration-150 sm:text-sm sm:leading-5">
            Deactivate
          </button>
        </span>
        <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:col-start-1">
          <button type="button" className="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline transition ease-in-out duration-150 sm:text-sm sm:leading-5">
            Cancel
          </button>
        </span>
      </div>
    </div>

  )
}
*/

export default FormDialog
