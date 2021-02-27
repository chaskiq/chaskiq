import React from 'react'
export default function Sidebar () {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }
  return (
    <aside className="h-screen px-4 divide-y divide-gray-200 sm:px-6 space-y-1.5">

      <div className="description">You can drag these nodes to the pane on the right.</div>

			<div className="overflow-auto divide-y divide-gray-200 space-y-1.5 h-full">

				<p className="text-md font-medium text-gray-900 pt-4">Audience</p>

				<DefaultNode color={'yellow'} onDragStart={(event) => onDragStart(event, 'rules')}>
					Rules
				</DefaultNode>

				<p className="text-md font-medium text-gray-900 pt-4">Messages to send</p>

				<DefaultNode onDragStart={(event) => onDragStart(event, 'default')}>
					Chat
				</DefaultNode>

				<DefaultNode onDragStart={(event) => onDragStart(event, 'default')}>
					Post
				</DefaultNode>

				<DefaultNode onDragStart={(event) => onDragStart(event, 'default')}>
					Email
				</DefaultNode>

				<DefaultNode onDragStart={(event) => onDragStart(event, 'default')}>
					Bot
				</DefaultNode>

				<DefaultNode onDragStart={(event) => onDragStart(event, 'default')}>
					Tour
				</DefaultNode>

				<DefaultNode onDragStart={(event) => onDragStart(event, 'default')}>
					Banner
				</DefaultNode>

				<DefaultNode onDragStart={(event) => onDragStart(event, 'output')}>
					Output Node
				</DefaultNode>

				<DefaultNode onDragStart={(event) => onDragStart(event, 'selectorNode')}>
					selector
				</DefaultNode>

				<p className="text-md font-medium text-gray-900 pt-4">Actions to take</p>

				<DefaultNode onDragStart={(event) => onDragStart(event, 'selectorNode')}>
					selector
				</DefaultNode>

			</div>
    </aside>
  )
}

function DefaultNode ({ onDragStart, kind, children, color }) {

	function colorForIcon(){
		if(!color) return 'bg-purple-600 text-white'
		return `bg-${color}-500 text-white`
	}

  return (
    <li className={`${kind} col-span-1 flex shadow-sm rounded-md`} draggable onDragStart={onDragStart}>
      <div className={`flex-shrink-0 flex items-center justify-center w-16 ${colorForIcon()} text-sm font-medium rounded-l-md`}>
            CD
      </div>
      <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
        <div className="flex-1 px-4 py-2 text-sm truncate">
          <a href="#" className="text-gray-900 font-medium hover:text-gray-600">
						{children}
					</a>
          <p className="text-gray-500">12 Members</p>
        </div>
        <div className="flex-shrink-0 pr-2">
          <button className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <span className="sr-only">Open options</span>
            <svg className="w-5 h-5" x-description="Heroicon name: solid/dots-vertical" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
            </svg>
          </button>
        </div>
      </div>
    </li>
  )
}
