import React from 'react';

export default function SimpleTabs({ tabs, buttons }) {
  const [value, setValue] = React.useState(0);

  function displayRendered(item, i) {
    return item.render();
  }

  function renderItem(item, i) {
    if (item.render) return displayRendered(item, i);
    return (
      <a
        href="#"
        onClick={() => setValue(i)}
        key={'conversation-tab' + item.label}
        className="whitespace-nowrap py-2 px-2 border-b-2 border-transparent font-medium text-sm leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300"
      >
        {item.label}
      </a>
    );
  }

  return (
    <div className="w-full">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex items-center">
          {tabs.map((o, i) => renderItem(o, i))}
          {buttons && buttons()}
        </nav>
      </div>

      {<div>{tabs[value].content}</div>}
    </div>
  );
}
