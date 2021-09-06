import React from 'react';

export type Props = {
  children?: React.ReactNode;
  actions?: React.ReactNode;
};

export default function Content({ children, actions }: Props) {
  return (
    <main
      className="flex-1 relative z-0 overflow-y-auto--
    pt-2 pb-6 focus:outline-none md:py-6 h-screen"
    >
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <div className="rounded-lg h-96--">
            {children}

            {actions && actions}
          </div>
        </div>
      </div>
    </main>
  );
}
