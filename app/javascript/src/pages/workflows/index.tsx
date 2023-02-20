import React, { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';

import { MarkerType, Position } from 'reactflow';
import ButtonEdge from './edges/buttonEdge';
import 'reactflow/dist/style.css';

import ColorSelectorNode from './con';
import Rules from './elements/rules';
import Chat from './elements/chat';
import Post from './elements/post';
import Email from './elements/email';
import Bot from './elements/bot';
import Tour from './elements/tour';
import Banner from './elements/banner';
import CustomEdge from './edges/customEdge';
import EditorRenderer from './editor/editor';
import Sidebar from './sidebar';
import Slide from '@chaskiq/components/src/components/Slide';

const initialNodes = [
  {
    id: '1',
    type: 'rules',
    data: { label: 'entry rule', ruleType: 'entry', predicates: [] },
    position: { x: 250, y: 0 },
  },
  /*{
    id: '2',
    //type: 'rules',
    data: { label: 'entry rule', ruleType: 'entry', predicates: [] },
    position: { x: 100, y: 100 },
  },
  {
    id: '3',
    type: 'output',
    data: {
      label: 'Output Node',
    },
    position: { x: 400, y: 100 },
  },
  {
    id: '4',
    //type: 'custom',
    position: { x: 100, y: 200 },
    data: {
      selects: {
        'handle-0': 'smoothstep',
        'handle-1': 'smoothstep',
      },
    },
  },
  {
    id: '5',
    type: 'output',
    data: {
      label: 'custom style',
    },
    className: 'circle',
    style: {
      background: '#2B6CB0',
      color: 'white',
    },
    position: { x: 400, y: 200 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: '6',
    type: 'output',
    style: {
      background: '#63B3ED',
      color: 'white',
      width: 100,
    },
    data: {
      label: 'Node',
    },
    position: { x: 400, y: 325 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: '7',
    type: 'default',
    className: 'annotation',
    data: {
      label: (
        <>
          On the bottom left you see the <strong>Controls</strong> and the bottom right the{' '}
          <strong>MiniMap</strong>. This is also just a node 🥳
        </>
      ),
    },
    draggable: false,
    selectable: false,
    position: { x: 150, y: 400 },
  },*/
];

const initialEdges = [
  //{ id: 'e1-2', source: '1', target: '2', type: 'buttonedge'}, //label: 'this is an edge label' },
  //{ id: 'e1-3', source: '1', target: '3', type: 'buttonedge', animated: true },
  /*{
    id: 'e4-5',
    source: '4',
    target: '5',
    sourceHandle: 'handle-0',
    data: {
      selectIndex: 0,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'e4-6',
    source: '4',
    target: '6',
    type: 'smoothstep',
    sourceHandle: 'handle-1',
    data: {
      selectIndex: 1,
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },*/
];

const nodeTypes = {
  selectorNode: ColorSelectorNode,
  rules: Rules,
  chat: Chat,
  post: Post,
  email: Email,
  bot: Bot,
  tour: Tour,
  banner: Banner,
};

const edgeTypes = {
  custom: CustomEdge,
  buttonedge: ButtonEdge,
};

const minimapStyle = {
  height: 120,
};

const OverviewFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect2 = useCallback((params) => {
    console.log('connecting', params);
    setEdges((eds) => addEdge(params, eds));
  }, []);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'buttonedge',
            label: 'olii',
            data: { text: 'custom edge' },
          },
          eds
        )
      ),
    []
  );

  const [open, setOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  const reactFlowWrapper = React.useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  React.useEffect(() => {
    if (currentEntry) setOpen(true);
  }, [currentEntry]);

  React.useEffect(() => {
    if (!open) setCurrentEntry(false);
  }, [open]);

  function onInit(reactFlowInstance) {
    console.log('flow loaded:', reactFlowInstance);
    reactFlowInstance.fitView();
    setReactFlowInstance(reactFlowInstance);
  }

  function onClose() {
    setOpen(false);
  }

  function updateElements(element) {
    // find the index of object from array that you want to update
    const objIndex = nodes.findIndex((obj) => obj.id === element.id);
    // make final new array of objects by combining updated object.
    const updatedProjects = [
      ...nodes.slice(0, objIndex),
      element,
      ...nodes.slice(objIndex + 1),
    ];
    setNodes(updatedProjects);
  }

  const onElementClick = (event, element) => {
    console.log(element.type);
    switch (element.type) {
      case 'rules':
      case 'chat':
      case 'post':
      case 'bot':
      case 'tour':
      case 'banner':
      case 'email':
        setCurrentEntry(element);
        break;
      default:
        break;
    }
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  let id = 0;
  const getId = () => `dndnode_${id++}`;

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  return (
    <ReactFlowProvider>
      <Slide title={'s'} open={open} onClose={onClose}>
        {currentEntry && (
          <EditorRenderer data={currentEntry} update={updateElements} />
        )}
      </Slide>

      <div className="flex">
        <div className="flex-grow" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={onInit}
            fitView
            onNodeClick={true && onElementClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            //attributionPosition="top-right"
            edgeTypes={edgeTypes}
            nodeTypes={nodeTypes}
          >
            <MiniMap style={minimapStyle} zoomable pannable />
            <Controls />
            <Background color="#aaa" gap={16} />
          </ReactFlow>
        </div>
        <Sidebar />
      </div>
    </ReactFlowProvider>
  );
};

export default OverviewFlow;
