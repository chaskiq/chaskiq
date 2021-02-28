import React, { useState, useCallback, useRef } from 'react'
import ReactFlow,
{
  Background,
  Controls,
  ReactFlowProvider,
  removeElements,
  addEdge,
  ArrowHeadType
} from 'react-flow-renderer'

import Slide from '../../components/Slide'
import Sidebar from './sidebar'

import ColorSelectorNode from './con'
import Rules from './elements/rules'
import Chat from './elements/chat'
import Post from './elements/post'
import Email from './elements/email'
import Bot from './elements/bot'
import Tour from './elements/tour'
import Banner from './elements/banner'
import CustomEdge from './edges/customEdge'
import EditorRenderer from './editor/editor'

const nodeTypes = {
  selectorNode: ColorSelectorNode,
  rules: Rules,
  chat: Chat,
	post: Post,
	email: Email,
	bot: Bot,
	tour: Tour,
	banner: Banner
}

const edgeTypes = {
  custom: CustomEdge
}

const getNodeId = () => `randomnode_${+new Date()}`
let id = 0
const getId = () => `dndnode_${id++}`

function Workflows () {
  const reactFlowWrapper = useRef(null)

  const initialElements = [
    { id: '1', type: 'input', data: { label: 'Node 1' }, position: { x: 250, y: 5 } },
    // { id: '11', type: 'selectorNode', data: { label: 'Node 1' }, position: { x: 250, y: 50 } },
    { id: '13', type: 'rules', data: { label: 'entry rule', ruleType: 'entry', predicates: [] }, position: { x: 250, y: 150 } },

    // you can also pass a React Node as a label
    { id: '2', data: { label: <div>Node 2</div> }, position: { x: 100, y: 100 } },

    {
      id: 'e5-8',
      source: '1',
      target: '13',
      type: 'custom',
      data: { text: 'custom edge' },
      arrowHeadType: ArrowHeadType.ArrowClosed
    },

    { id: 'e1-2', label: 'smoothstep edge', type: 'smoothstep', source: '1', target: '2', sourceHandle: 'a', animated: true }
    // { id: 'e1-3', type: 'smoothstep', source: '11', target: '2', animated: true }
  ]

  const [reactFlowInstance, setReactFlowInstance] = useState(null)

  const [elements, setElements] = useState(initialElements)
  const [open, setOpen] = useState(false)
  const onElementsRemove = (elementsToRemove) =>
    setElements((els) => removeElements(elementsToRemove, els))
  const onConnect = (params) => setElements((els) => addEdge(params, els))

  const [currentEntry, setCurrentEntry] = useState(null)

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

  function onClose () {
    setOpen(false)
    setCurrentEntry(false)
  }

  React.useEffect(() => {
    if (currentEntry) setOpen(true)
  }, [currentEntry])

  const onElementClick = (event, element) => {
    console.log(element.type)
    switch (element.type) {
      case 'rules':
			case 'chat':
			case 'post':
			case 'bot':
			case 'tour':
			case 'banner':
			case 'email':
        setCurrentEntry(element)
        break
      default:
        break
    }
  }

  function updateElements (element) {
    // find the index of object from array that you want to update
    const objIndex = elements.findIndex(obj => obj.id === element.id)
    // make final new array of objects by combining updated object.
    const updatedProjects = [
      ...elements.slice(0, objIndex),
      element,
      ...elements.slice(objIndex + 1)
    ]
    setElements(updatedProjects)
  }

  return (
    <div>
      <div className="save__controls">
        <button onClick={onAdd}>add node</button>
      </div>

      <Slide title={'s'} open={open} onClose={onClose}>
        {
          currentEntry &&
						<EditorRenderer
							data={ currentEntry }
							update={updateElements}
						/>
        }
      </Slide>

      <ReactFlowProvider>

        <div className="flex">
          <div className="w-3/4 h-screen reactflow-wrapper" ref={reactFlowWrapper}>
            <ReactFlow
              elements={elements}
              onElementsRemove={onElementsRemove}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onElementClick={ true && onElementClick }
              onLoad={onLoad}
              snapToGrid={true}
              snapGrid={[15, 15]}
              onDrop={onDrop}
              onDragOver={onDragOver}
              edgeTypes={edgeTypes}
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
