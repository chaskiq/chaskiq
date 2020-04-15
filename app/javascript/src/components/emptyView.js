import React from "react";

function EmptyView({ title, subtitle, icon, image, shadowless }) {
  return (
    <div
      className={`bg-white overflow-hidden ${
        shadowless ? "" : "shadow"
      } rounded-lg p-5 m-5`}
    >
      <div className="flex flex-col px-4 py-5 sm:p-6 items-center">
        {icon && icon}

        <h2 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-3xl sm:leading-none md:text-4xl">
          {title}
        </h2>

        {subtitle && (
          <p className="py-4 mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
            {subtitle}
          </p>
        )}
        {image && image}
      </div>
    </div>
  );
}

export default EmptyView;
