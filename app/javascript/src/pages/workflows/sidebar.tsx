import React from 'react';
export default function Sidebar() {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
  return (
    <aside className="h-screen w-72 px-4 divide-y divide-gray-200 sm:px-6 space-y-1.5">
      <div className="description">
        You can drag these nodes to the pane on the right.
      </div>

      <div>
        <div className="overflow-auto" style={{ height: `calc(100vh - 55px)` }}>
          <div className="text-md font-medium text-gray-900 pt-4--">
            Audience
          </div>

          <DefaultNode
            color={'yellow'}
            onDragStart={(event) => onDragStart(event, 'rules')}
          >
            Rules
          </DefaultNode>

          <div className="text-md font-medium text-gray-900 pt-4--">
            Messages to send
          </div>

          <DefaultNode onDragStart={(event) => onDragStart(event, 'chat')}>
            Chat
          </DefaultNode>

          <DefaultNode onDragStart={(event) => onDragStart(event, 'post')}>
            Post
          </DefaultNode>

          <DefaultNode onDragStart={(event) => onDragStart(event, 'email')}>
            Email
          </DefaultNode>

          <DefaultNode onDragStart={(event) => onDragStart(event, 'bot')}>
            Bot
          </DefaultNode>

          <DefaultNode onDragStart={(event) => onDragStart(event, 'tour')}>
            Tour
          </DefaultNode>

          <DefaultNode onDragStart={(event) => onDragStart(event, 'banner')}>
            Banner
          </DefaultNode>

          {/*<DefaultNode onDragStart={(event) => onDragStart(event, 'output')}>
						Output Node
					</DefaultNode>

					<DefaultNode onDragStart={(event) => onDragStart(event, 'selectorNode')}>
						selector
					</DefaultNode>*/}

          <div className="text-md font-medium text-gray-900 pt-4--">
            Actions to take
          </div>

          <DefaultNode
            onDragStart={(event) => onDragStart(event, 'selectorNode')}
          >
            selector
          </DefaultNode>
        </div>
      </div>
    </aside>
  );
}

type DefaultNodeType = {
  onDragStart: (event: any) => void;
  kind?: string;
  children: React.ReactChild;
  color?: string;
};
function DefaultNode({ onDragStart, kind, children, color }: DefaultNodeType) {
  function colorForIcon() {
    if (!color) return 'bg-purple-600 text-white';
    return `bg-${color}-500 text-white`;
  }

  return (
    <div
      className={`${kind} flex shadow-sm rounded-md`}
      draggable
      onDragStart={onDragStart}
    >
      <div
        className={`flex-shrink-0 flex items-center justify-center w-16 ${colorForIcon()} text-sm font-medium rounded-l-md`}
      >
        CD
      </div>
      <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
        <div className="flex-1 px-4 py-2 text-sm truncate">
          <a href="#" className="text-gray-900 font-medium hover:text-gray-600">
            {children}
          </a>
          <div className="text-gray-500">12 Members</div>
        </div>
        <div className="flex-shrink-0 pr-2">
          <button className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <span className="sr-only">Open options</span>
            <svg
              className="w-5 h-5"
              x-description="Heroicon name: solid/dots-vertical"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
