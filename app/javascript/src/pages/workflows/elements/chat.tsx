import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import BaseElement from './base';
export default memo(({ data }: { data: any; children: React.ReactChild }) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
      ></Handle>

      <BaseElement data={data} type={'chat'}></BaseElement>

      <Handle
        type="source"
        position={Position.Right}
        id="a"
        style={{ top: 10, background: '#555' }}
      >
        <div>When delivered</div>
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
