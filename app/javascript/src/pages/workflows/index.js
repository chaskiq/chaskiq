import React, { useState, useCallback, useRef } from 'react'
import ReactFlow,
{
  Background,
  Controls,
  ReactFlowProvider,
  removeElements,
  addEdge
} from 'react-flow-renderer'

import Sidebar from './sidebar'

import ColorSelectorNode from './con'
import Rules from './rules'

const nodeTypes = {
  selectorNode: ColorSelectorNode,
	rules: Rules
}

const getNodeId = () => `randomnode_${+new Date()}`
let id = 0;
const getId = () => `dndnode_${id++}`;


function Workflows () {
  const reactFlowWrapper = useRef(null)

  const initialElements = [
    { id: '1', type: 'input', data: { label: 'Node 1' }, position: { x: 250, y: 5 } },
    //{ id: '11', type: 'selectorNode', data: { label: 'Node 1' }, position: { x: 250, y: 50 } },
    { id: '13', type: 'rules', data: { label: 'entry rule' }, position: { x: 250, y: 150 } },

		// you can also pass a React Node as a label
    { id: '2', data: { label: <div>Node 2</div> }, position: { x: 100, y: 100 } },

    { id: 'e1-2', label: 'smoothstep edge', type: 'smoothstep', source: '1', target: '2', sourceHandle: 'a', animated: true },
    //{ id: 'e1-3', type: 'smoothstep', source: '11', target: '2', animated: true }
  ]

  const [reactFlowInstance, setReactFlowInstance] = useState(null)

  const [elements, setElements] = useState(initialElements)
  const onElementsRemove = (elementsToRemove) =>
    setElements((els) => removeElements(elementsToRemove, els))
  const onConnect = (params) => setElements((els) => addEdge(params, els))

  const onLoad = (_reactFlowInstance) => {
    console.log('flow loaded:', _reactFlowInstance)
    _reactFlowInstance.fitView()
    setReactFlowInstance(_reactFlowInstance)
  }

  const onAdd = useCallback(() => {
    const newNode = {
      id: getNodeId(),
      data: { label: 'Added node' },
      position: {
        x: Math.random() * window.innerWidth - 100,
        y: Math.random() * window.innerHeight
      }
    }
    setElements((els) => els.concat(newNode))
  }, [setElements])

  const onDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }
  const onDrop = (event) => {
    event.preventDefault()
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
    const type = event.dataTransfer.getData('application/reactflow')
    const position = reactFlowInstance.project({
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top
    })
    const newNode = {
      id: getId(),
      type,
      position,
      data: { label: `${type} node` }
    }
    setElements((es) => es.concat(newNode))
  }

  return (
    <div>
				ppokpokpok

      <div className="save__controls">
        <button onClick={onAdd}>add node</button>
      </div>

      <ReactFlowProvider>

        <div className="flex">
          <div className="w-3/4 h-screen reactflow-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
              elements={elements}
              onElementsRemove={onElementsRemove}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onLoad={onLoad}
              snapToGrid={true}
              snapGrid={[15, 15]}
              onDrop={onDrop}
              onDragOver={onDragOver}
            >
              <Background
								className="bg-gray-50"
                variant="dots"
                gap={12}
                size={0.6}
              />
              <Controls style={{ bottom: 60 }} />

            </ReactFlow>
          </div>
          <Sidebar/>
        </div>

      </ReactFlowProvider>

    </div>
  )
}

export default Workflows
