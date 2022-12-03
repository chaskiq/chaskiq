import React from 'react';

export default function ButtonTabSwitch({ handleClick, options, option }) {
  const activeClass = 'bg-brand text-gray-100 border-brand pointer-events-none';

  return (
    <>
      {options.map((o, i) => (
        <button
          onClick={(_e) => handleClick(o)}
          key={`tabtab-${i}`}
          className={`${
            option.name === o.name ? activeClass : ' dark:border-gray-600'
          }
					focus:outline-none 
					focus:shadow-outline-gray
					outline-none border bg-white dark:bg-gray-900 dark:text-gray-100
					font-light py-2 px-4
					${o.classes}
					`}
        >
          {o.name}
        </button>
      ))}
    </>
  );
}
