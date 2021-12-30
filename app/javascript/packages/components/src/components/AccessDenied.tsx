import React from 'react';
import icon from '../../../../src/images/favicon.png';

export default function AccessDenied() {
  return (
    <main className="flex-grow flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex-shrink-0 flex justify-center">
        <a href="/" className="inline-flex">
          <span className="sr-only">Chaskiq</span>
          <img className="h-12 w-auto" src={icon} alt="logo" />
        </a>
      </div>
      <div className="py-16">
        <div className="text-center">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
            401 error
          </p>
          <h1 className="mt-2 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Access denied
          </h1>
          <p className="mt-2 text-base text-gray-500">
            Sorry, you dont have access to this page.
          </p>
          <div className="mt-6">
            <a
              href="/"
              className="text-base font-medium text-indigo-600 hover:text-indigo-500"
            >
              Go back home<span aria-hidden="true"> →</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
