import React from 'react'
import { Transition } from '@headlessui/react'

export default function UserSlide ({ open, onClose, children }) {
  return (
    <>
      <div className={`${!open ? 'hidden' : ''} fixed inset-0 overflow-hidden z-50`}>
        <div className="absolute inset-0 overflow-hidden">
          <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex sm:pl-16">

            <Transition show={open} className="w-screen max-w-2xl"
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full">
              <div className="z-50 h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                <header className="px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between space-x-3">
                    <h2 className="text-lg leading-7 font-medium text-gray-900">
                      Profile
                    </h2>
                    <div className="h-7 flex items-center">
                      <button aria-label="Close panel" onClick={onClose} className="text-gray-400 hover:text-gray-500 transition ease-in-out duration-150">
                        {/* Heroicon name: x */}
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </header>
                {children}
              </div>
            </Transition>
          </section>
        </div>
      </div>
      <div
        onClick={onClose}
        style={{
          background: '#000',
          position: 'fixed',
          opacity: 0.6,
          zIndex: 10,
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh'
        }}
      />
    </>
  )
}
