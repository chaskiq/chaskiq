import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import BaseElement from './base';

export default memo(({ data }: { children: React.ReactChild; data: any }) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
      ></Handle>

      <BaseElement data={data} type={'tour'}></BaseElement>

      <Handle
        type="source"
        position={Position.Right}
        id="a"
        style={{ top: 10, background: '#555' }}
      >
        <div>YES</div>
      </Handle>

      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{ bottom: 10, top: 'auto', background: '#555' }}
      >
        <div>NO</div>
      </Handle>
    </>
  );
});
