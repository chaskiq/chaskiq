import React, { memo } from 'react'
import { Handle } from 'react-flow-renderer'
import BaseElement from './base'

export default memo(({ data }) => {
  return (

    <>

      <Handle
        type="target"
        position="left"
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}>
      </Handle>

      <BaseElement data={data} type={'banner'}></BaseElement>

      <Handle
        type="source"
        position="right"
        id="a"
        style={{ top: 10, background: '#555' }}>
        <div>YES</div>
      </Handle>

      <Handle
        type="source"
        position="right"
        id="b"
        style={{ bottom: 10, top: 'auto', background: '#555' }}>
        <div>NO</div>
      </Handle>
    </>
  )
})
