import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';

import styled from '@emotion/styled';

const HandeItem = styled.div`
  position: absolute;
  width: 300px;
  font-size: 0.4em;
  left: 12px;
`;

export default memo(({ data }: { data: any; children: React.ReactChild }) => {
  return (
    <>
      {data.ruleType !== 'entry' && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ background: '#555' }}
          onConnect={(params) => console.log('handle onConnect', params)}
        ></Handle>
      )}

      <li className={'col-span-1 flex shadow-sm rounded-md'}>
        <div
          className={
            'flex-shrink-0 flex items-center justify-center w-16 text-sm font-medium rounded-l-md bg-yellow-500'
          }
        >
          CD
        </div>
        <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
          <div className="flex-1 px-4 py-2 text-sm truncate">
            <p className="text-gray-900 font-medium">
              Rules: <strong>{data.label}</strong>
            </p>
            <p className="text-gray-500">12 Members</p>
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
      </li>

      <Handle
        type="source"
        position={Position.Right}
        id="a"
        style={{ top: 10, background: '#555' }}
      >
        <div>
          <HandeItem>when match</HandeItem>
        </div>
      </Handle>

      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{ bottom: 10, top: 'auto', background: '#555' }}
      >
        <HandeItem
          onClick={() => console.log('epa')}
          onMouseOver={() => console.log('nono')}
        >
          NO
        </HandeItem>
      </Handle>

      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{ bottom: 30, top: 'auto', background: '#555' }}
      >
        <HandeItem>NO</HandeItem>
      </Handle>
    </>
  );
});
