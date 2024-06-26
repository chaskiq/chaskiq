import React from 'react';

export default function UpgradePage({ page, app }) {
  return (
    <main className="mt-10 mx-auto max-w-screen-xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
      <div className="sm:text-center lg:text-left">
        <h2 className="text-4xl tracking-tight leading-10 font-extrabold text-gray-900 dark:text-gray-100 sm:text-5xl sm:leading-none md:text-6xl">
          Upgrade Plan
          <br className="xl:hidden" />
          {/*<span className="text-brand-600">{page.message}</span>*/}
        </h2>

        <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
          We're sorry, but it seems that the feature you're trying to access is
          not available on your current subscription plan. But don't worry,
          we've got you covered! By upgrading your plan, you'll not only gain
          access to this amazing feature, but you'll also unlock a whole new
          world of powerful tools and capabilities designed to help you grow
          your business and achieve your goals.
        </p>

        <p className="mt-4 text-gray-500 sm:mt-5 sm:text-xs sm:max-w-xl sm:mx-auto md:mt-5 md:text-sm lg:mx-0">
          Ready to upgrade and enjoy all the benefits of a higher tier plan?
          Click the button below to explore our pricing options and find the
          perfect plan for your needs.
        </p>

        <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
          <div className="rounded-md shadow">
            <a
              href={`/apps/${app.key}/billing`}
              className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-brand hover:bg-brand focus:outline-none focus:border-brand focus:shadow-outline-brand transition duration-150 ease-in-out md:py-4 md:text-lg md:px-10"
            >
              Go to Billing
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
